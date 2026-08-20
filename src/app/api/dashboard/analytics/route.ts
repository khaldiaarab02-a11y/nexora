import { NextResponse } from "next/server";
import { getBearerUser, getOwnedStore, serviceClient } from "@/lib/server/auth";
import type { AnalyticsStatus, DashboardAnalytics } from "@/types/phase3";

const STATUSES: AnalyticsStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const RANGE_DAYS = 30;

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const user = await getBearerUser(request);
    if (!user) return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

    const storeId = await getOwnedStore(user.id);
    if (!storeId) return NextResponse.json({ error: "لم يتم العثور على متجرك." }, { status: 404 });

    const db = serviceClient();
    const since = new Date();
    since.setDate(since.getDate() - (RANGE_DAYS - 1));

    const [{ data: orders, error: ordersError }, { data: products, error: productsError }] = await Promise.all([
      db.from("orders")
        .select("id,customer_name,customer_phone,total,status,created_at")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false }),
      db.from("products")
        .select("id,name,stock_quantity,is_active")
        .eq("store_id", storeId),
    ]);

    if (ordersError) throw new Error(ordersError.message);
    if (productsError) throw new Error(productsError.message);

    const orderRows = orders ?? [];
    const productRows = products ?? [];
    const validOrders = orderRows.filter((order) => order.status !== "cancelled");
    const revenue = validOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    const customerKeys = new Set(
      orderRows
        .map((order) => `${(order.customer_phone || "").trim()}|${(order.customer_name || "").trim().toLowerCase()}`)
        .filter((key) => key !== "|")
    );

    const statusCounts = STATUSES.reduce<Record<AnalyticsStatus, number>>((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<AnalyticsStatus, number>);

    for (const order of orderRows) {
      if (STATUSES.includes(order.status as AnalyticsStatus)) {
        statusCounts[order.status as AnalyticsStatus] += 1;
      }
    }

    const dailyMap = new Map<string, AnalyticsDay>();
    for (let i = 0; i < RANGE_DAYS; i += 1) {
      const day = new Date(since);
      day.setDate(since.getDate() + i);
      const key = dateKey(day);
      dailyMap.set(key, { date: key, orders: 0, revenue: 0 });
    }

    for (const order of validOrders) {
      const key = dateKey(new Date(order.created_at));
      const day = dailyMap.get(key);
      if (!day) continue;
      day.orders += 1;
      day.revenue += Number(order.total || 0);
    }

    const recentOrderIds = orderRows
      .filter((order) => new Date(order.created_at) >= since && order.status !== "cancelled")
      .map((order) => order.id);

    const topProducts: DashboardAnalytics["topProducts"] = [];
    if (recentOrderIds.length > 0) {
      const { data: items, error: itemsError } = await db
        .from("order_items")
        .select("product_id,product_name,quantity,unit_price")
        .in("order_id", recentOrderIds);
      if (itemsError) throw new Error(itemsError.message);

      const grouped = new Map<string, DashboardAnalytics["topProducts"][number]>();
      for (const item of items ?? []) {
        const id = item.product_id as string;
        const existing = grouped.get(id);
        const quantity = Number(item.quantity) || 0;
        const revenueValue = quantity * (Number(item.unit_price) || 0);
        if (existing) {
          existing.quantity += quantity;
          existing.revenue += revenueValue;
        } else {
          grouped.set(id, {
            productId: id,
            name: item.product_name,
            quantity,
            revenue: revenueValue,
          });
        }
      }
      topProducts.push(...Array.from(grouped.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8));
    }

    const payload: DashboardAnalytics = {
      rangeDays: RANGE_DAYS,
      kpis: {
        revenue,
        orders: validOrders.length,
        averageOrderValue: validOrders.length ? revenue / validOrders.length : 0,
        customers: customerKeys.size,
        products: productRows.length,
        lowStock: productRows.filter((product) => product.is_active && Number(product.stock_quantity) <= 5).length,
      },
      statusCounts,
      daily: Array.from(dailyMap.values()),
      topProducts,
    };

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "حدث خطأ غير معروف.";
    console.error("NEXORA ANALYTICS ERROR:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
