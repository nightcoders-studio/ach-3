import { createAdminClient } from "@/utils/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createAdminClient();

  const { error } = await supabase.from("users").select("user_id").limit(1);

  if (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ status: "ok" });
}
