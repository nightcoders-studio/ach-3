import { createAdminClient } from "@/utils/supabase/admin";
import {
  verifyToken,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "admin") return forbiddenResponse();

  const supabase = createAdminClient();

  // Fetch users with their orders to filter those with 0 orders
  const { data, error } = await supabase
    .from("users")
    .select("user_id, name, phone, created_at, orders(order_id)")
    .eq("role", "customer");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter out customers with 0 transactions
  const activeCustomers = (data || [])
    .filter((user: any) => user.orders && user.orders.length > 0)
    .map(({ orders, ...user }) => user);

  // Sort by created_at descending
  activeCustomers.sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return NextResponse.json({ customers: activeCustomers });
}
