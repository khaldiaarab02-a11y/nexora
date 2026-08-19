"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { orderStatuses, statusLabel, statusStyles, statusBarColor, type OrderStatus } from "@/lib/orderStatus";
import { PLAN_LABELS, type PlanId } from "@/config/plans";

type StoreInfo = { name: string; slug: string };

type SubscriptionInfo = { plan_id: string; status: string; end_date: string | null };

type OrderRow = {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
};

type LowStockProduct = {
  id: string;
  name: string;
  stock_quantity: number;
};

type TopProduct = {
  product_id: string;
  product_name: string;
  quantity: number;
  revenue: number;
};

const LOW_STOCK_THRESHOLD = 5;

export default function DashboardPage() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [productsCount, setProductsCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setMessage("يجب تسجيل الدخول أولًا.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const { data: membership } = await supabase
      .from("store_members")
      .select("store_id")
      .eq("user_id", userData.user.id)
      .eq("role", "owner")
      .limit(1)
      .maybeSingle();

    if (!membership) {
      setMessage("لم يتم العثور على متجر مرتبط بهذا الحساب.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const storeId = membership.store_id;

    const [{ data: storeData, error: storeError }, { count: productsTotal, error: productsError }, { data: lowStock, error: lowStockError }, { data: ordersData, error: ordersError }] =
      await Promise.all([
        supabase.from("stores").select("name,slug").eq("id", storeId).maybeSingle(),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("store_id", storeId),
        supabase
          .from("products")
          .select("id,name,stock_quantity")
          .eq("store_id", storeId)
          .eq("is_active", true)
          .lte("stock_quantity", LOW_STOCK_THRESHOLD)
          .order("stock_quantity", { ascending: true }),
        supabase
          .from("orders")
          .select("id,customer_name,total,status,created_at")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false }),
      ]);

    const firstError = storeError || productsError || lowStockError || ordersError;
    if (firstError) {
      setMessage(firstError.message);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setStore(storeData ? { name: storeData.name, slug: storeData.slug } : null);
    setProductsCount(productsTotal ?? 0);
    setLowStockProducts(lowStock ?? []);
    setOrders(ordersData ?? []);

    // Business Core: subscription status. Fetched separately and treated
    // as non-critical - if the Business Core SQL hasn't been run yet in
    // this project, this table won't exist, and the rest of the dashboard
    // must keep working exactly as before regardless.
    try {
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("plan_id,status,end_date")
        .eq("store_id", storeId)
        .maybeSingle();
      setSubscription(subscriptionData ?? null);
    } catch {
      setSubscription(null);
    }

    const nonCancelledOrderIds = (ordersData ?? [])
      .filter((order) => order.status !== "cancelled")
      .map((order) => order.id);

    if (nonCancelledOrderIds.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("product_id,product_name,quantity,unit_price")
        .in("order_id", nonCancelledOrderIds);

      if (itemsError) {
        setMessage(itemsError.message);
      } else {
        const grouped = new Map<string, TopProduct>();
        for (const item of items ?? []) {
          const existing = grouped.get(item.product_id);
          const quantity = Number(item.quantity) || 0;
          const revenue = quantity * (Number(item.unit_price) || 0);
          if (existing) {
            existing.quantity += quantity;
            existing.revenue += revenue;
          } else {
            grouped.set(item.product_id, {
              product_id: item.product_id,
              product_name: item.product_name,
              quantity,
              revenue,
            });
          }
        }
        const ranked = Array.from(grouped.values())
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);
        setTopProducts(ranked);
      }
    } else {
      setTopProducts([]);
    }

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalSales = useMemo(
    () => orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + Number(o.total || 0), 0),
    [orders]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const order of orders) {
      if ((orderStatuses as string[]).includes(order.status)) {
        counts[order.status as OrderStatus] += 1;
      }
    }
    return counts;
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  return (
    <main className="min-h-screen bg-zinc-50" dir="rtl">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">Nexora</p>
            <h1 className="mt-1 truncate text-2xl font-bold text-zinc-900">{loading ? "..." : store?.name || "لوحة التحكم"}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {store?.slug && (
              <Link
                href={`/shop/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900"
              >
                عرض المتجر
              </Link>
            )}
            <button
              onClick={() => loadDashboard(true)}
              disabled={refreshing || loading}
              className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 disabled:opacity-50"
            >
              {refreshing ? "..." : "تحديث"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {!loading && subscription && (
          <div
            className={`mb-6 flex flex-col gap-2 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
              subscription.status === "active" ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50"
            }`}
          >
            {subscription.status === "active" ? (
              <p className="text-sm text-emerald-800">
                الخطة: <strong>{PLAN_LABELS[subscription.plan_id as PlanId] || subscription.plan_id}</strong> — الاشتراك فعال
                {subscription.end_date && ` حتى ${new Date(subscription.end_date).toLocaleDateString("fr-DZ")}`}
              </p>
            ) : (
              <p className="text-sm text-amber-800">
                اشتراكك غير فعال حاليًا ({subscription.status === "pending" ? "قيد الانتظار" : subscription.status === "expired" ? "منتهي" : "ملغى"}).
                تواصلي مع فريق Nexora لتفعيل متجرك.
              </p>
            )}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-red-700">{message}</div>
        )}

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-zinc-200 bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard title="إجمالي المبيعات" value={`${totalSales.toLocaleString("fr-DZ")} DZD`} />
            <StatCard title="إجمالي الطلبات" value={orders.length} />
            <StatCard title="قيد الانتظار" value={statusCounts.pending} />
            <StatCard title="مؤكدة" value={statusCounts.confirmed} />
            <StatCard title="المنتجات" value={productsCount} />
            <StatCard title="مخزون منخفض" value={lowStockProducts.length} />
          </div>
        )}

        {/* Recent orders */}
        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">أحدث الطلبات</h2>
            <Link href="/dashboard/orders" className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
              عرض جميع الطلبات
            </Link>
          </div>

          <div className="mt-5">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-zinc-100" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-500">لا توجد طلبات حتى الآن</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-100 p-4 transition hover:border-zinc-300"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-900">#{order.id.slice(0, 8)}</p>
                      <p className="mt-0.5 truncate text-sm text-zinc-500">{order.customer_name}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusStyles[order.status as OrderStatus] || "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {statusLabel[order.status] || order.status}
                      </span>
                      <span className="text-sm font-bold text-zinc-900">{Number(order.total).toLocaleString("fr-DZ")} DZD</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Top selling products */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold text-zinc-900">المنتجات الأكثر مبيعًا</h2>
            <div className="mt-5">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-2xl bg-zinc-100" />
                  ))}
                </div>
              ) : topProducts.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-500">ستظهر مبيعاتك هنا بعد استلام أول طلب</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={product.product_id} className="flex items-center gap-3 rounded-2xl border border-zinc-100 p-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-500">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-zinc-900">{product.product_name}</p>
                        <p className="text-xs text-zinc-500">{product.quantity} قطعة مباعة</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-zinc-900">
                        {product.revenue.toLocaleString("fr-DZ")} DZD
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Low stock alert */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold text-zinc-900">تنبيه المخزون</h2>
            <div className="mt-5">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-2xl bg-zinc-100" />
                  ))}
                </div>
              ) : lowStockProducts.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-500">المخزون بحالة جيدة ✓</p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/dashboard/products/${product.id}/edit`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-3 transition hover:border-amber-300"
                    >
                      <span className="truncate font-medium text-zinc-900">{product.name}</span>
                      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                        {product.stock_quantity} متبقي
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Status breakdown */}
        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900">حالة الطلبات</h2>
          <div className="mt-5 space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-6 animate-pulse rounded-full bg-zinc-100" />)
            ) : orders.length === 0 ? (
              <p className="py-2 text-center text-sm text-zinc-500">لا توجد طلبات حتى الآن</p>
            ) : (
              orderStatuses.map((s) => {
                const count = statusCounts[s];
                const percent = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-zinc-700">{statusLabel[s]}</span>
                      <span className="text-zinc-500">{count}</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div className={`h-full rounded-full ${statusBarColor[s]}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="truncate text-xs text-zinc-500">{title}</p>
      <p className="mt-1 truncate text-xl font-bold text-zinc-900">{value}</p>
    </div>
  );
}
