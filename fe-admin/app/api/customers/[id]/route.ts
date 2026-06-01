import { createAdminClient } from "@/utils/supabase/admin";
import {
  verifyToken,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "admin") return forbiddenResponse();

  const supabase = createAdminClient();

  const { data: customer, error: customerError } = await supabase
    .from("users")
    .select("user_id, name, phone, created_at")
    .eq("user_id", id)
    .eq("role", "customer")
    .single();

  if (customerError)
    return NextResponse.json(
      { error: "Customer tidak ditemukan" },
      { status: 404 },
    );

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      "*, order_items(*, products(name, unit)), delivery_options(name, type)",
    )
    .eq("user_id", id)
    .order("ordered_at", { ascending: false });

  if (ordersError)
    return NextResponse.json({ error: ordersError.message }, { status: 500 });

  return NextResponse.json({
    customer,
    orders,
    total_orders: orders.length,
    total_spent: orders.reduce((sum, o) => sum + o.total_price, 0),
  });
}
