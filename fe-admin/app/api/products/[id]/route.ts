import { createAdminClient } from "@/utils/supabase/admin";
import {
  verifyToken,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const payload = verifyToken(request);
  if (!payload) return unauthorizedResponse();
  if (payload.role !== "admin") return forbiddenResponse();

  const body = await request.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .update({ ...body, updated_by: payload.user_id })
    .eq("product_id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}
