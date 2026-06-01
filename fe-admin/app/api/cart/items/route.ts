import { createAdminClient } from "@/utils/supabase/admin";
import { verifyToken, unauthorizedResponse } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();

  const { product_id, quantity } = await request.json();

  if (!product_id || !quantity) {
    return NextResponse.json(
      { error: "product_id dan quantity wajib diisi" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  let cart: { cart_id: string } | null = null;
  const { data: cartData } = await supabase
    .from("carts")
    .select("cart_id")
    .eq("user_id", payload.user_id)
    .single();

  cart = cartData;

  if (!cart) {
    const { data: newCart, error: cartError } = await supabase
      .from("carts")
      .insert({ user_id: payload.user_id })
      .select()
      .single();

    if (cartError) {
      return NextResponse.json({ error: cartError.message }, { status: 500 });
    }
    cart = newCart;
  }

  const { data: existing } = await supabase
    .from("cart_items")
    .select("cart_item_id, quantity")
    .eq("cart_id", cart!.cart_id)
    .eq("product_id", product_id)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("cart_item_id", existing.cart_item_id)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ cart_item: data });
  }

  const { data, error } = await supabase
    .from("cart_items")
    .insert({ cart_id: cart!.cart_id, product_id, quantity })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cart_item: data }, { status: 201 });
}
