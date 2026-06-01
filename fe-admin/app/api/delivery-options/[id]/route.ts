import { createAdminClient } from "@/utils/supabase/admin";
import {
  verifyToken,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "admin") return forbiddenResponse();

  const body = await request.json();

  if (body.type) {
    const validType = ["courier", "self_pickup"];
    if (!validType.includes(body.type)) {
      return NextResponse.json({ error: "type tidak valid" }, { status: 400 });
    }
  }

  const supabase = createAdminClient();

  if (body.type === "self_pickup" || body.cost !== undefined) {
    const { data: current } = await supabase
      .from("delivery_options")
      .select("type")
      .eq("delivery_option_id", id)
      .single();

    const finalType = body.type || current?.type;
    if (finalType === "self_pickup") {
      body.cost = 0;
    }
  }

  const { data, error } = await supabase
    .from("delivery_options")
    .update(body)
    .eq("delivery_option_id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ delivery_option: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "admin") return forbiddenResponse();

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("delivery_options")
    .delete()
    .eq("delivery_option_id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Delivery option dihapus" });
}
