import { createAdminClient } from "@/utils/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  const { phone, password } = await request.json();

  if (!phone || !password) {
    return NextResponse.json(
      { error: "Semua field wajib diisi" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("user_id, name, phone, role, password_hash")
    .eq("phone", phone)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "Nomor telepon tidak ditemukan" },
      { status: 404 },
    );
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  const token = jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" },
  );

  return NextResponse.json({
    token,
    user: {
      user_id: user.user_id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    },
  });
}
