"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { DashboardAnalytics } from "@/types/phase3";

function money(value: number) {
  return `${Math.round(value).toLocaleString("fr-DZ")} DZD`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setMessage("يجب تسجيل الدخول أولًا.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/dashboard/analytics", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = (await response.json()) as DashboardAnalytics | { error?: string };
    if (!response.ok || !("kpis" in payload)) {
      setMessage("error" in payload && payload.error ? payload.error : "تعذر تحميل التحليلات.");
      setLoading(false);
      return;
    }
    setData(payload);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const maxRevenue = useMemo(() => Math.max(...(data?.daily.map((day) => day.revenue) ?? [1]), 1), [data]);

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">Nexora · Phase 3</p><h1 className="mt-1 text-2xl font-bold text-zinc-900">تحليلات المتجر</h1></div>
          <div className="flex gap-2"><button onClick={() => void load()} disabled={loading} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50">تحديث</button><Link href="/dashboard" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white">اللوحة</Link></div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {message && <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">{message}</div>}
        {loading && !data ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />)}</div> : data && <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Card title="المبيعات" value={money(data.kpis.revenue)} /><Card title="الطلبات" value={data.kpis.orders} /><Card title="متوسط الطلب" value={money(data.kpis.averageOrderValue)} /><Card title="العملاء" value={data.kpis.customers} /><Card title="المنتجات" value={data.kpis.products} /><Card title="مخزون منخفض" value={data.kpis.lowStock} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <section className="rounded-3xl border border-zinc-200 bg-white p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">المبيعات اليومية</h2><span className="text-xs text-zinc-400">آخر {data.rangeDays} يومًا</span></div><div className="mt-6 flex h-64 items-end gap-1 overflow-hidden">{data.daily.map((day) => <div key={day.date} className="group flex h-full flex-1 items-end"><div title={`${day.date}: ${money(day.revenue)}`} className="w-full rounded-t-md bg-zinc-900 transition-opacity group-hover:opacity-70" style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, day.revenue ? 4 : 1)}%` }} /></div>)}</div></section>
            <section className="rounded-3xl border border-zinc-200 bg-white p-6"><h2 className="text-lg font-bold">حالات الطلبات</h2><div className="mt-5 space-y-3">{Object.entries(data.statusCounts).map(([status, count]) => <div key={status} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3"><span>{({ pending: "قيد الانتظار", confirmed: "مؤكد", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغى" } as Record<string,string>)[status]}</span><strong>{count}</strong></div>)}</div></section>
          </div>
          <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6"><h2 className="text-lg font-bold">أفضل المنتجات · آخر 30 يومًا</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{data.topProducts.length ? data.topProducts.map((product, index) => <div key={product.productId} className="flex items-center gap-3 rounded-2xl border border-zinc-100 p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 font-bold">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate font-semibold">{product.name}</p><p className="text-xs text-zinc-500">{product.quantity} قطعة · {money(product.revenue)}</p></div></div>) : <p className="py-8 text-center text-sm text-zinc-500">لا توجد مبيعات كافية بعد.</p>}</div></section>
        </>}
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string | number }) { return <div className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="text-xs text-zinc-500">{title}</p><p className="mt-2 truncate text-xl font-bold">{value}</p></div>; }
