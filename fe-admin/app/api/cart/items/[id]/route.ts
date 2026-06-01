import { createAdminClient } from "@/utils/supabase/admin";
import { verifyToken, unauthorizedResponse } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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
    .eq("cart_item_id", params.id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cart_item: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_item_id", params.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Item dihapus" });
}
