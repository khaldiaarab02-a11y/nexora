import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type OrderItemInput = {
  productId: string;
  quantity: number;
};

type OrderInput = {
  storeId: string;
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderInput;

    if (
      !body.storeId ||
      !body.customerName?.trim() ||
      !body.customerPhone?.trim() ||
      !body.wilaya?.trim() ||
      !body.address?.trim() ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        { error: "بيانات الطلب غير مكتملة." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const productIds = body.items.map((item) => item.productId);

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(
        "id,store_id,name,sku,price,stock_quantity,is_active"
      )
      .eq("store_id", body.storeId)
      .in("id", productIds);

    if (productsError) {
      throw new Error(`تعذر قراءة المنتجات: ${productsError.message}`);
    }

    if (!products || products.length !== body.items.length) {
      return NextResponse.json(
        { error: "أحد المنتجات في السلة لم يعد متاحًا." },
        { status: 409 }
      );
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    let subtotal = 0;

    const orderItems = body.items.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new Error("المنتج غير موجود.");
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error(`الكمية غير صالحة للمنتج: ${product.name}`);
      }

      if (!product.is_active) {
        throw new Error(`المنتج غير متاح: ${product.name}`);
      }

      if (product.stock_quantity < quantity) {
        throw new Error(
          `المخزون غير كافٍ للمنتج "${product.name}". المتوفر: ${product.stock_quantity}`
        );
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
      .eq("store_id", body.storeId)
      .maybeSingle();

    const shippingFee = Number(settings?.default_shipping_fee ?? 0);
    const total = subtotal + shippingFee;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        store_id: body.storeId,
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
      throw new Error(
        `تعذر إنشاء الطلب: ${orderError?.message || "لم يتم إنشاء الطلب"}`
      );
    }

    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error(`تعذر حفظ تفاصيل الطلب: ${itemsError.message}`);
    }

    for (const item of body.items) {
      const product = productMap.get(item.productId)!;
      const quantity = Number(item.quantity);

      const { data: updatedProduct, error: stockError } = await supabase
        .from("products")
        .update({
          stock_quantity: product.stock_quantity - quantity,
        })
        .eq("id", product.id)
        .eq("store_id", body.storeId)
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

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        subtotal,
        shippingFee,
        total,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "حدث خطأ غير معروف.";

    console.error("NEXORA ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}