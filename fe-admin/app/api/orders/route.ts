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

  const supabase = createAdminClient();

  let query = supabase
    .from("orders")
    .select(
      "*, order_items(*, products(*)), delivery_options(*), users(name, phone)",
    )
    .order("ordered_at", { ascending: false });

  if (payload.role === "customer") {
    query = query.eq("user_id", payload.user_id);
  }

  const { data, error } = await query;

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}

export async function POST(request: NextRequest) {
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "customer") return forbiddenResponse();

  const { delivery_option_id, delivery_lat, delivery_lng } =
    await request.json();

  if (!delivery_option_id) {
    return NextResponse.json(
      { error: "delivery_option_id wajib diisi" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  // Fetch delivery option to check type and cost
  const { data: deliveryOption, error: deliveryError } = await supabase
    .from("delivery_options")
    .select("*")
    .eq("delivery_option_id", delivery_option_id)
    .single();

  if (deliveryError || !deliveryOption) {
    return NextResponse.json(
      { error: "Metode pengiriman tidak ditemukan atau tidak valid" },
      { status: 404 },
    );
  }

  if (!deliveryOption.is_available) {
    return NextResponse.json(
      { error: "Metode pengiriman sedang tidak tersedia" },
      { status: 400 },
    );
  }

  // Validate GPS coordinates if type is courier
  if (deliveryOption.type === "courier") {
    if (
      delivery_lat === undefined ||
      delivery_lat === null ||
      delivery_lng === undefined ||
      delivery_lng === null
    ) {
      return NextResponse.json(
        {
          error:
            "Koordinat GPS (latitude dan longitude) wajib diisi untuk pengiriman kurir",
        },
        { status: 400 },
      );
    }
  }

  const { data: cart } = await supabase
    .from("carts")
    .select("cart_id, cart_items(*, products(price_per_unit))")
    .eq("user_id", payload.user_id)
    .single();

  if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
    return NextResponse.json({ error: "Cart kosong" }, { status: 400 });
  }

  type CartItemWithProduct = {
    product_id: string;
    quantity: number;
    products: {
      price_per_unit: number;
    };
  };

  const delivery_cost =
    deliveryOption.type === "self_pickup" ? 0 : (deliveryOption.cost ?? 0);

  const items_total = (cart.cart_items as CartItemWithProduct[]).reduce(
    (sum: number, item: CartItemWithProduct) => {
      return sum + item.quantity * item.products.price_per_unit;
    },
    0,
  );

  const total_price = items_total + delivery_cost;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: payload.user_id,
      delivery_option_id,
      delivery_lat: deliveryOption.type === "self_pickup" ? null : delivery_lat,
      delivery_lng: deliveryOption.type === "self_pickup" ? null : delivery_lng,
      total_price,
      status: "pending",
    })
    .select()
    .single();

  if (orderError)
    return NextResponse.json({ error: orderError.message }, { status: 500 });

  const orderItems = (cart.cart_items as CartItemWithProduct[]).map(
    (item: CartItemWithProduct) => ({
      order_id: order.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_per_unit: item.products.price_per_unit,
      subtotal: item.quantity * item.products.price_per_unit,
    }),
  );

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError)
    return NextResponse.json({ error: itemsError.message }, { status: 500 });

  await supabase.from("cart_items").delete().eq("cart_id", cart.cart_id);

  return NextResponse.json({ order }, { status: 201 });
}
