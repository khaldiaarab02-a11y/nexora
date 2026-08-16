"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { orderStatuses, statusLabel, statusStyles, type OrderStatus } from "@/lib/orderStatus";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  wilaya: string;
  commune: string | null;
  total: number;
  status: string;
  created_at: string;
};

type SortOption = "newest" | "oldest" | "priceHigh" | "priceLow";
type StatusFilter = "all" | OrderStatus;

const sortLabel: Record<SortOption, string> = {
  newest: "الأحدث",
  oldest: "الأقدم",
  priceHigh: "الأعلى سعرًا",
  priceLow: "الأقل سعرًا",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  // Debounce the search input so filtering doesn't run on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setSearchTerm(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  async function loadOrders(isRefresh = false) {
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

    const { data, error } = await supabase
      .from("orders")
      .select("id,customer_name,customer_phone,wilaya,commune,total,status,created_at")
      .eq("store_id", membership.store_id)
      .order("created_at", { ascending: false });

    if (error) setMessage(error.message);
    else setOrders(data ?? []);

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: orders.length,
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

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    if (searchTerm) {
      result = result.filter((order) => {
        const idMatch = order.id.toLowerCase().includes(searchTerm);
        const nameMatch = order.customer_name?.toLowerCase().includes(searchTerm);
        const phoneMatch = order.customer_phone?.toLowerCase().includes(searchTerm);
        return idMatch || nameMatch || phoneMatch;
      });
    }

    const sorted = [...result];
    switch (sortOption) {
      case "newest":
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "priceHigh":
        sorted.sort((a, b) => Number(b.total) - Number(a.total));
        break;
      case "priceLow":
        sorted.sort((a, b) => Number(a.total) - Number(b.total));
        break;
    }
    return sorted;
  }, [orders, statusFilter, searchTerm, sortOption]);

  function clearFilters() {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("all");
  }

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  return (
    <main className="min-h-screen bg-zinc-50" dir="rtl">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">Nexora</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900">الطلبات</h1>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-zinc-500">
            العودة للوحة التحكم
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-zinc-200 bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard title="إجمالي الطلبات" value={stats.all} active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
            {orderStatuses.map((s) => (
              <StatCard
                key={s}
                title={statusLabel[s]}
                value={stats[s]}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              />
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ابحث برقم الطلب أو اسم العميل أو الهاتف..."
            className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-zinc-900 sm:flex-1"
          />
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
            >
              <option value="all">كل الحالات</option>
              {orderStatuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabel[s]}
                </option>
              ))}
            </select>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
            >
              {(Object.keys(sortLabel) as SortOption[]).map((option) => (
                <option key={option} value={option}>
                  {sortLabel[option]}
                </option>
              ))}
            </select>
            <button
              onClick={() => loadOrders(true)}
              disabled={refreshing || loading}
              className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 disabled:opacity-50"
            >
              {refreshing ? "..." : "تحديث"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="mt-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-3xl border border-zinc-200 bg-white" />
              ))}
            </div>
          ) : message ? (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center text-red-700">{message}</div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center">
              <h2 className="text-2xl font-bold text-zinc-900">لا توجد طلبات حتى الآن</h2>
              <p className="mt-2 text-sm text-zinc-500">ستظهر هنا الطلبات فور استلامها من صفحة المتجر.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center">
              <h2 className="text-xl font-bold text-zinc-900">لم نجد أي طلب مطابق</h2>
              <p className="mt-2 text-sm text-zinc-500">جرّبي تعديل كلمة البحث أو الفلتر.</p>
              <button
                onClick={clearFilters}
                className="mt-5 inline-flex rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white"
              >
                مسح الفلاتر
              </button>
            </div>
          ) : (
            <>
              {hasActiveFilters && (
                <p className="mb-3 text-xs text-zinc-400">
                  {filteredOrders.length} من {orders.length} طلب
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="block rounded-3xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-400"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-bold text-zinc-900">#{order.id.slice(0, 8)}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.status as OrderStatus] || "bg-zinc-100 text-zinc-700"}`}>
                        {statusLabel[order.status] || order.status}
                      </span>
                    </div>
                    <p className="mt-3 font-semibold text-zinc-900">{order.customer_name}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">{order.customer_phone}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {order.wilaya}
                      {order.commune ? ` / ${order.commune}` : ""}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                      <span className="text-xs text-zinc-400">
                        {new Date(order.created_at).toLocaleDateString("fr-DZ", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                      <span className="font-bold text-zinc-900">{Number(order.total).toLocaleString("fr-DZ")} DZD</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  active,
  onClick,
}: {
  title: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-right transition ${
        active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400"
      }`}
    >
      <p className={`text-xs ${active ? "text-zinc-300" : "text-zinc-500"}`}>{title}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </button>
  );
}
