import { createAdminClient } from "@/utils/supabase/admin";
import {
  verifyToken,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("delivery_options")
    .select("*")
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ delivery_options: data });
}

export async function POST(request: NextRequest) {
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "admin") return forbiddenResponse();

  const { name, type, cost } = await request.json();

  if (!name || !type) {
    return NextResponse.json(
      { error: "name dan type wajib diisi" },
      { status: 400 },
    );
  }

  const validType = ["courier", "self_pickup"];
  if (!validType.includes(type)) {
    return NextResponse.json({ error: "type tidak valid" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("delivery_options")
    .insert({
      name,
      type,
      cost: type === "self_pickup" ? 0 : (cost ?? 0),
      is_available: true,
      created_by: payload.user_id,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ delivery_option: data }, { status: 201 });
}
