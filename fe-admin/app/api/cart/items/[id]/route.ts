import { createAdminClient } from "@/utils/supabase/admin";
import { verifyToken, unauthorizedResponse } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();

  const supabase = createAdminClient();

  // Fetch cart item with cart owner user_id for safety validation
  const { data: cartItem, error } = await supabase
    .from("cart_items")
    .select("*, carts(user_id), products(*)")
    .eq("cart_item_id", id)
    .single();

  if (error || !cartItem) {
    return NextResponse.json(
      { error: "Item keranjang tidak ditemukan" },
      { status: 404 },
    );
  }

  interface CartItemResponse {
    cart_item_id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    carts: {
      user_id: string;
    };
    products: {
      product_id: string;
      category_id: string | null;
      name: string;
      description: string | null;
      unit: string;
      min_order_qty: number;
      price_per_unit: number;
      created_at: string;
      updated_by: string;
    } | null;
  }

  const typedCartItem = cartItem as unknown as CartItemResponse;

  // Enforce customer owner verification
  if (typedCartItem.carts?.user_id !== payload.user_id) {
    return NextResponse.json(
      { error: "Akses ditolak" },
      { status: 403 },
    );
  }

  const { carts, ...cleanCartItem } = typedCartItem;

  return NextResponse.json({ cart_item: cleanCartItem });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();

  const { quantity } = await request.json();

  if (!quantity || quantity < 1) {
    return NextResponse.json(
      { error: "quantity tidak valid" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("cart_item_id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cart_item: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_item_id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Item dihapus" });
}
