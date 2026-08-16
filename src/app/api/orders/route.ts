import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Body = {
  storeId: string;
  storeSlug: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    wilaya: string;
    commune?: string;
    address: string;
    notes?: string;
  };
  items: { productId: string; quantity: number }[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;

    if (!body.storeId || !body.items?.length) {
      return NextResponse.json({ error: "الطلب غير مكتمل." }, { status: 400 });
    }

    if (!body.customer?.name || !body.customer?.phone || !body.customer?.wilaya || !body.customer?.address) {
      return NextResponse.json({ error: "يرجى إكمال معلومات التوصيل." }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const { data: store } = await supabase
      .from("stores")
      .select("id,slug,is_active")
      .eq("id", body.storeId)
      .maybeSingle();

    if (!store?.is_active) {
      return NextResponse.json({ error: "المتجر غير متاح." }, { status: 400 });
    }

    const ids = body.items.map((x) => x.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id,store_id,name,sku,price,stock_quantity,is_active")
      .in("id", ids)
      .eq("store_id", body.storeId)
      .eq("is_active", true);

    if (productsError || !products || products.length !== ids.length) {
      return NextResponse.json({ error: "أحد المنتجات لم يعد متاحًا." }, { status: 400 });
    }

    const normalized = body.items.map((requested) => {
      const product = products.find((p) => p.id === requested.productId)!;
      const quantity = Math.max(1, Math.floor(Number(requested.quantity)));
      return { product, quantity };
    });

    for (const item of normalized) {
      if (item.quantity > item.product.stock_quantity) {
        return NextResponse.json({ error: `الكمية المتاحة من "${item.product.name}" هي ${item.product.stock_quantity}.` }, { status: 400 });
      }
    }

    const subtotal = normalized.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

    const { data: settings } = await supabase
      .from("store_settings")
      .select("default_shipping_fee")
      .eq("store_id", body.storeId)
      .maybeSingle();

    const shippingFee = Number(settings?.default_shipping_fee || 0);
    const total = subtotal + shippingFee;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        store_id: body.storeId,
        customer_name: body.customer.name.trim(),
        customer_phone: body.customer.phone.trim(),
        customer_email: body.customer.email?.trim() || null,
        wilaya: body.customer.wilaya.trim(),
        commune: body.customer.commune?.trim() || null,
        address: body.customer.address.trim(),
        notes: body.customer.notes?.trim() || null,
        subtotal,
        shipping_fee: shippingFee,
        total,
        status: "pending",
      })
      .select("id,order_number")
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || "تعذر إنشاء الطلب." }, { status: 500 });
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      normalized.map(({ product, quantity }) => ({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        unit_price: product.price,
        quantity,
        options: {},
      }))
    );

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "تعذر حفظ تفاصيل الطلب." }, { status: 500 });
    }

    for (const { product, quantity } of normalized) {
      const { data: updated, error: stockError } = await supabase
        .from("products")
        .update({ stock_quantity: product.stock_quantity - quantity })
        .eq("id", product.id)
        .eq("store_id", body.storeId)
        .gte("stock_quantity", quantity)
        .select("id")
        .maybeSingle();

      if (stockError || !updated) {
        await supabase.from("order_items").delete().eq("order_id", order.id);
        await supabase.from("orders").delete().eq("id", order.id);
        return NextResponse.json({ error: `تعذر تحديث مخزون "${product.name}". حاولي مرة أخرى.` }, { status: 409 });
      }
    }

    return NextResponse.json({ ok: true, orderNumber: order.order_number, storeSlug: store.slug });
  } catch {
    return NextResponse.json({ error: "حدث خطأ غير متوقع." }, { status: 500 });
  }
}