import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type OrderItemInput = {
  productId: string;
  quantity: number;
};

type OrderInput = {
  // storeId may be sent by the client for backward compatibility with the
  // current checkout page, but it is never trusted for the actual order:
  // the real store is always derived from the products themselves, both
  // in the RPC and in the fallback path below.
  storeId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  wilaya: string;
  commune?: string;
  address: string;
  notes?: string;
  items: OrderItemInput[];
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!key) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables"
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function validateBody(body: OrderInput) {
  if (
    !body.customerName?.trim() ||
    !body.customerPhone?.trim() ||
    !body.wilaya?.trim() ||
    !body.address?.trim()
  ) {
    return "بيانات العميل ناقصة. يرجى تعبئة الاسم والهاتف والولاية والعنوان.";
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return "السلة فارغة.";
  }

  for (const item of body.items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      return "بيانات أحد المنتجات في السلة غير صالحة.";
    }
  }

  return null;
}

function isMissingFunctionError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  if (error.code === "PGRST202") return true;
  const message = (error.message || "").toLowerCase();
  return message.includes("could not find the function") || message.includes("does not exist");
}

async function createOrderViaRpc(
  supabase: ReturnType<typeof getAdminClient>,
  body: OrderInput
) {
  const { data, error } = await supabase.rpc("create_order_with_items", {
    p_items: body.items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
    p_customer_name: body.customerName.trim(),
    p_customer_phone: body.customerPhone.trim(),
    p_customer_email: body.customerEmail?.trim() || null,
    p_wilaya: body.wilaya.trim(),
    p_commune: body.commune?.trim() || null,
    p_address: body.address.trim(),
    p_notes: body.notes?.trim() || null,
  });

  if (error) {
    if (isMissingFunctionError(error)) {
      return { installed: false as const };
    }
    // A real business-rule rejection from inside the function (insufficient
    // stock, inactive product, mixed stores, etc.) - surface it as-is,
    // it is already a clear Arabic message raised by the RPC itself.
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row?.order_id) {
    throw new Error("تعذر إنشاء الطلب.");
  }

  return {
    installed: true as const,
    orderId: row.order_id as string,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee),
    total: Number(row.total),
  };
}

async function createOrderFallback(
  supabase: ReturnType<typeof getAdminClient>,
  body: OrderInput
) {
  const productIds = body.items.map((item) => item.productId);

  // Store is derived from the products themselves - body.storeId (if sent)
  // is never used to scope this query or to decide the order's store_id.
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id,store_id,name,sku,price,stock_quantity,is_active")
    .in("id", productIds);

  if (productsError) {
    throw new Error(`تعذر قراءة المنتجات: ${productsError.message}`);
  }

  if (!products || products.length !== body.items.length) {
    throw new Error("أحد المنتجات في السلة لم يعد متاحًا.");
  }

  const distinctStoreIds = new Set(products.map((p) => p.store_id));
  if (distinctStoreIds.size !== 1) {
    throw new Error("عناصر السلة تنتمي لمتاجر مختلفة، وهذا غير مسموح.");
  }
  const storeId = products[0].store_id as string;

  const productMap = new Map(products.map((product) => [product.id, product]));
  let subtotal = 0;

  const orderItems = body.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error("المنتج غير موجود.");

    const quantity = Number(item.quantity);

    if (!product.is_active) {
      throw new Error(`المنتج غير متاح: ${product.name}`);
    }
    if (product.stock_quantity < quantity) {
      throw new Error(`المخزون غير كافٍ للمنتج "${product.name}". المتوفر: ${product.stock_quantity}`);
    }

    const unitPrice = Number(product.price);
    subtotal += unitPrice * quantity;

    return {
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      unit_price: unitPrice,
      quantity,
      options: {},
    };
  });

  const { data: settings } = await supabase
    .from("store_settings")
    .select("default_shipping_fee")
    .eq("store_id", storeId)
    .maybeSingle();

  const shippingFee = Number(settings?.default_shipping_fee ?? 0);
  const total = subtotal + shippingFee;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      store_id: storeId,
      customer_name: body.customerName.trim(),
      customer_phone: body.customerPhone.trim(),
      customer_email: body.customerEmail?.trim() || null,
      wilaya: body.wilaya.trim(),
      commune: body.commune?.trim() || null,
      address: body.address.trim(),
      notes: body.notes?.trim() || null,
      subtotal,
      shipping_fee: shippingFee,
      total,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(`تعذر إنشاء الطلب: ${orderError?.message || "لم يتم إنشاء الطلب"}`);
  }

  const itemsWithOrderId = orderItems.map((item) => ({ ...item, order_id: order.id }));

  const { error: itemsError } = await supabase.from("order_items").insert(itemsWithOrderId);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(`تعذر حفظ تفاصيل الطلب: ${itemsError.message}`);
  }

  for (const item of body.items) {
    const product = productMap.get(item.productId)!;
    const quantity = Number(item.quantity);

    // Conditional atomic decrement: this WHERE guard is evaluated by
    // Postgres against the row's current value at update time, so it
    // still correctly blocks overselling the last unit even under
    // concurrent requests. See create_order_with_items_rpc.sql for the
    // fully atomic single-transaction version (recommended upgrade) that
    // additionally removes the narrower lost-update edge case described
    // there.
    const { data: updatedProduct, error: stockError } = await supabase
      .from("products")
      .update({ stock_quantity: product.stock_quantity - quantity })
      .eq("id", product.id)
      .eq("store_id", storeId)
      .gte("stock_quantity", quantity)
      .select("id")
      .maybeSingle();

    if (stockError || !updatedProduct) {
      await supabase.from("order_items").delete().eq("order_id", order.id);
      await supabase.from("orders").delete().eq("id", order.id);

      throw new Error(
        stockError
          ? `تعذر تحديث المخزون: ${stockError.message}`
          : `المخزون تغير أثناء إنشاء الطلب للمنتج: ${product.name}`
      );
    }
  }

  return { orderId: order.id as string, subtotal, shippingFee, total };
}

export async function POST(request: Request) {
  try {
    let body: OrderInput;
    try {
      body = (await request.json()) as OrderInput;
    } catch {
      return NextResponse.json({ error: "بيانات الطلب غير صالحة." }, { status: 400 });
    }

    const validationError = validateBody(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = getAdminClient();

    const rpcResult = await createOrderViaRpc(supabase, body);

    const result = rpcResult.installed
      ? rpcResult
      : await createOrderFallback(supabase, body);

    return NextResponse.json(
      {
        success: true,
        orderId: result.orderId,
        subtotal: result.subtotal,
        shippingFee: result.shippingFee,
        total: result.total,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "حدث خطأ غير معروف.";

    console.error("NEXORA ORDER ERROR:", error);

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
