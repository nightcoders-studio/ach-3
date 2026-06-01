import { createAdminClient } from "@/utils/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const { name, phone, password } = await request.json();

  if (!name || !phone || !password) {
    return NextResponse.json(
      { error: "Semua field wajib diisi" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("users")
    .select("user_id")
    .eq("phone", phone)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Nomor telepon sudah terdaftar" },
      { status: 409 },
    );
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert({ name, phone, password_hash, role: "customer" })
    .select("user_id, name, phone, role")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data }, { status: 201 });
}
