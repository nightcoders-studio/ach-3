import { createAdminClient } from "@/utils/supabase/admin";
import { verifyToken, unauthorizedResponse } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();

  const supabase = createAdminClient();

  const { data: cart, error } = await supabase
    .from("carts")
    .select("*, cart_items(*, products(*))")
    .eq("user_id", payload.user_id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cart: cart ?? null });
}
