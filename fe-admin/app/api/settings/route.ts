import { createAdminClient } from "@/utils/supabase/admin";
import {
  verifyToken,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const SETTINGS_FILE_PATH = path.join(process.cwd(), "utils", "store_settings.json");

interface LocalSettings {
  store_name: string;
  store_email: string;
}

const defaultSettings: LocalSettings = {
  store_name: "Mart2You Utama",
  store_email: "admin@mart2you.com",
};

// Helper function to read store settings from local JSON
function getLocalSettings(): LocalSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Gagal membaca file settings:", error);
  }
  return defaultSettings;
}

// Helper function to write store settings to local JSON
function saveLocalSettings(settings: LocalSettings) {
  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), "utf-8");
  } catch (error) {
    console.error("Gagal menyimpan file settings:", error);
  }
}

export async function GET(request: NextRequest) {
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "admin") return forbiddenResponse();

  const supabase = createAdminClient();

  // Fetch admin user profile details
  const { data: adminUser, error } = await supabase
    .from("users")
    .select("user_id, name, phone, role")
    .eq("user_id", payload.user_id)
    .single();

  if (error || !adminUser) {
    return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
  }

  const storeSettings = getLocalSettings();

  return NextResponse.json({
    store_name: storeSettings.store_name,
    store_email: storeSettings.store_email,
    admin: adminUser,
  });
}

export async function PATCH(request: NextRequest) {
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "admin") return forbiddenResponse();

  const { store_name, store_email, name, phone, password } = await request.json();

  const supabase = createAdminClient();

  // 1. Update store settings if provided
  const storeSettings = getLocalSettings();
  if (store_name !== undefined) storeSettings.store_name = store_name;
  if (store_email !== undefined) storeSettings.store_email = store_email;
  saveLocalSettings(storeSettings);

  // 2. Update admin profile/security in database if provided
  const userUpdates: Record<string, any> = {};
  if (name !== undefined) userUpdates.name = name;
  if (phone !== undefined) userUpdates.phone = phone;

  if (password) {
    userUpdates.password_hash = await bcrypt.hash(password, 10);
  }

  let updatedAdminUser = null;
  if (Object.keys(userUpdates).length > 0) {
    const { data, error } = await supabase
      .from("users")
      .update(userUpdates)
      .eq("user_id", payload.user_id)
      .select("user_id, name, phone, role")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    updatedAdminUser = data;
  } else {
    // If no user updates, fetch current details
    const { data } = await supabase
      .from("users")
      .select("user_id, name, phone, role")
      .eq("user_id", payload.user_id)
      .single();
    updatedAdminUser = data;
  }

  return NextResponse.json({
    message: "Pengaturan berhasil diperbarui",
    settings: {
      store_name: storeSettings.store_name,
      store_email: storeSettings.store_email,
      admin: updatedAdminUser,
    },
  });
}
