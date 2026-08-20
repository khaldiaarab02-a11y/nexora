import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");
  if (!storeId) return NextResponse.json({ defaultShippingFee: 0, currency: "DZD" });

  const supabase = serviceClient();

  const { data } = await supabase
    .from("store_settings")
    .select("default_shipping_fee,currency")
    .eq("store_id", storeId)
    .maybeSingle();

  return NextResponse.json({
    defaultShippingFee: Number(data?.default_shipping_fee || 0),
    currency: data?.currency || "DZD",
  });
}