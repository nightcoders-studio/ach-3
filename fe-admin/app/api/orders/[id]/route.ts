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

  const { status } = await request.json();

  const validStatus = [
    "pending",
    "confirmed",
    "ready",
    "completed",
    "cancelled",
  ];
  if (!validStatus.includes(status)) {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("order_id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();

  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(*, products(*)), delivery_options(*), users(name, phone)",
    )
    .eq("order_id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  if (payload.role === "customer" && order.user_id !== payload.user_id) {
    return forbiddenResponse();
  }

  return NextResponse.json({ order });
}

