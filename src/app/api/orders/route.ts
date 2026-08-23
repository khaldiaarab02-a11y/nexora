import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/server/auth";
import { getRequestTranslations } from "@/lib/server/i18n";

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

function validateBody(body: OrderInput, t: ReturnType<typeof getRequestTranslations>) {
  if (
    !body.customerName?.trim() ||
    !body.customerPhone?.trim() ||
    !body.wilaya?.trim() ||
    !body.address?.trim()
  ) {
    return t.orderApi.missingCustomerData;
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return t.orderApi.emptyCart;
  }

  for (const item of body.items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      return t.orderApi.invalidCartItem;
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
  supabase: ReturnType<typeof serviceClient>,
  body: OrderInput,
  t: ReturnType<typeof getRequestTranslations>
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
    throw new Error(t.orderApi.createFailed);
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
  supabase: ReturnType<typeof serviceClient>,
  body: OrderInput,
  t: ReturnType<typeof getRequestTranslations>
) {
  const productIds = body.items.map((item) => item.productId);

  // Store is derived from the products themselves - body.storeId (if sent)
  // is never used to scope this query or to decide the order's store_id.
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id,store_id,name,sku,price,stock_quantity,is_active")
    .in("id", productIds);

  if (productsError) {
    throw new Error(`${t.orderApi.readProductsFailed}: ${productsError.message}`);
  }

  if (!products || products.length !== body.items.length) {
    throw new Error(t.orderApi.productNoLongerAvailable);
  }

  const distinctStoreIds = new Set(products.map((p) => p.store_id));
  if (distinctStoreIds.size !== 1) {
    throw new Error(t.orderApi.mixedStoresNotAllowed);
  }
  const storeId = products[0].store_id as string;

  const productMap = new Map(products.map((product) => [product.id, product]));
  let subtotal = 0;

  const orderItems = body.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error(t.orderApi.productNotFound);

    const quantity = Number(item.quantity);

    if (!product.is_active) {
      throw new Error(`${t.orderApi.productInactive}: ${product.name}`);
    }
    if (product.stock_quantity < quantity) {
      throw new Error(`${t.orderApi.insufficientStockPrefix} "${product.name}". ${t.orderApi.availableSuffix} ${product.stock_quantity}`);
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
    throw new Error(`${t.orderApi.createOrderFailedPrefix}: ${orderError?.message || t.orderApi.orderNotCreated}`);
  }

  const itemsWithOrderId = orderItems.map((item) => ({ ...item, order_id: order.id }));

  const { error: itemsError } = await supabase.from("order_items").insert(itemsWithOrderId);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(`${t.orderApi.saveItemsFailedPrefix}: ${itemsError.message}`);
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
          ? `${t.orderApi.stockUpdateFailedPrefix}: ${stockError.message}`
          : `${t.orderApi.stockChangedForProductPrefix} ${product.name}`
      );
    }
  }

  return { orderId: order.id as string, subtotal, shippingFee, total };
}

export async function POST(request: Request) {
  const t = getRequestTranslations(request);
  try {
    let body: OrderInput;
    try {
      body = (await request.json()) as OrderInput;
    } catch {
      return NextResponse.json({ error: t.orderApi.invalidRequestBody }, { status: 400 });
    }

    const validationError = validateBody(body, t);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = serviceClient();

    const rpcResult = await createOrderViaRpc(supabase, body, t);

    const result = rpcResult.installed
      ? rpcResult
      : await createOrderFallback(supabase, body, t);

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
    const message = error instanceof Error ? error.message : t.orderApi.unknownError;

    console.error("NEXORA ORDER ERROR:", error);

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
