"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { DashboardAnalytics } from "@/types/phase3";
import { useI18n } from "@/i18n/LanguageProvider";

function money(value: number) {
  return `${Math.round(value).toLocaleString("fr-DZ")} DZD`;
}

export default function AnalyticsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setMessage(t.feedback.authRequired);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/dashboard/analytics", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = (await response.json()) as DashboardAnalytics | { error?: string };
    if (!response.ok || !("kpis" in payload)) {
      setMessage("error" in payload && payload.error ? payload.error : t.analytics.loadError);
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
          <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">Nexora · Phase 3</p><h1 className="mt-1 text-2xl font-bold text-zinc-900">{t.analytics.title}</h1></div>
          <div className="flex gap-2"><button onClick={() => void load()} disabled={loading} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50">{t.analytics.refresh}</button><Link href="/dashboard" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white">{t.analytics.dashboardLink}</Link></div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {message && <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">{message}</div>}
        {loading && !data ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />)}</div> : data && <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Card title={t.analytics.revenue} value={money(data.kpis.revenue)} /><Card title={t.analytics.orders} value={data.kpis.orders} /><Card title={t.analytics.avgOrder} value={money(data.kpis.averageOrderValue)} /><Card title={t.analytics.customers} value={data.kpis.customers} /><Card title={t.analytics.products} value={data.kpis.products} /><Card title={t.analytics.lowStock} value={data.kpis.lowStock} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <section className="rounded-3xl border border-zinc-200 bg-white p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">{t.analytics.dailySalesTitle}</h2><span className="text-xs text-zinc-400">{t.analytics.lastDaysPrefix} {data.rangeDays} {t.analytics.daysWord}</span></div><div className="mt-6 flex h-64 items-end gap-1 overflow-hidden">{data.daily.map((day) => <div key={day.date} className="group flex h-full flex-1 items-end"><div title={`${day.date}: ${money(day.revenue)}`} className="w-full rounded-t-md bg-zinc-900 transition-opacity group-hover:opacity-70" style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, day.revenue ? 4 : 1)}%` }} /></div>)}</div></section>
            <section className="rounded-3xl border border-zinc-200 bg-white p-6"><h2 className="text-lg font-bold">{t.analytics.orderStatusesTitle}</h2><div className="mt-5 space-y-3">{Object.entries(data.statusCounts).map(([status, count]) => <div key={status} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3"><span>{t.orderStatus[status as keyof typeof t.orderStatus] || status}</span><strong>{count}</strong></div>)}</div></section>
          </div>
          <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6"><h2 className="text-lg font-bold">{t.analytics.topProductsTitle}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{data.topProducts.length ? data.topProducts.map((product, index) => <div key={product.productId} className="flex items-center gap-3 rounded-2xl border border-zinc-100 p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 font-bold">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate font-semibold">{product.name}</p><p className="text-xs text-zinc-500">{product.quantity} {t.analytics.unitsWord} · {money(product.revenue)}</p></div></div>) : <p className="py-8 text-center text-sm text-zinc-500">{t.analytics.noSalesYet}</p>}</div></section>
        </>}
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string | number }) { return <div className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="text-xs text-zinc-500">{title}</p><p className="mt-2 truncate text-xl font-bold">{value}</p></div>; }
