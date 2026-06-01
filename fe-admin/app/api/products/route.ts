import { createAdminClient } from "@/utils/supabase/admin";
import {
  verifyToken,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || searchParams.get("q") || "";

  const { data: products, error } = await supabase
    .from("products")
    .select("*, categories(name)");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: stockLogs } = await supabase
    .from("stock_logs")
    .select("product_id, quantity, recorded_at")
    .order("recorded_at", { ascending: false });

  const latestStock: Record<string, number> = {};
  for (const log of stockLogs ?? []) {
    if (!(log.product_id in latestStock)) {
      latestStock[log.product_id] = log.quantity;
    }
  }

  interface ProductWithCategory {
    product_id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    unit: string;
    min_order_qty: number;
    price_per_unit: number;
    created_at: string;
    updated_by: string;
    categories: {
      name: string;
    } | null;
  }

  const dbProducts = (products as unknown as ProductWithCategory[] || []);

  let result = dbProducts.map((p) => ({
    ...p,
    current_stock: latestStock[p.product_id] ?? 0,
  }));

  // Filter products by search query if provided
  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower)) ||
        (p.categories &&
          p.categories.name &&
          p.categories.name.toLowerCase().includes(searchLower)),
    );
  }

  return NextResponse.json({ products: result });
}

export async function POST(request: NextRequest) {
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "admin") return forbiddenResponse();

  const {
    category_id,
    name,
    description,
    unit,
    min_order_qty,
    price_per_unit,
  } = await request.json();

  if (!name || !unit || !price_per_unit) {
    return NextResponse.json(
      { error: "name, unit, dan price_per_unit wajib diisi" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      category_id,
      name,
      description,
      unit,
      min_order_qty,
      price_per_unit,
      updated_by: payload.user_id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data }, { status: 201 });
}
