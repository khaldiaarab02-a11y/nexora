"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Stats = {
  totalStores: number;
  activeStores: number;
  pendingStores: number;
  expiredStores: number;
  cancelledStores: number;
  starterStores: number;
  businessStores: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const [{ count: totalStores }, { data: subs, error }] = await Promise.all([
        supabase.from("stores").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("status,plan_id"),
      ]);

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      const rows = subs ?? [];
      setStats({
        totalStores: totalStores ?? 0,
        activeStores: rows.filter((r) => r.status === "active").length,
        pendingStores: rows.filter((r) => r.status === "pending").length,
        expiredStores: rows.filter((r) => r.status === "expired").length,
        cancelledStores: rows.filter((r) => r.status === "cancelled").length,
        starterStores: rows.filter((r) => r.plan_id === "starter").length,
        businessStores: rows.filter((r) => r.plan_id === "business").length,
      });
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 py-8" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900">لوحة تحكم Nexora</h1>
        <p className="mt-1 text-sm text-zinc-500">نظرة عامة على المتاجر والاشتراكات.</p>

        {loading ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-zinc-200 bg-white" />
            ))}
          </div>
        ) : message ? (
          <p className="mt-6 rounded-2xl bg-red-50 p-4 text-red-700">{message}</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard title="إجمالي المتاجر" value={stats!.totalStores} />
            <StatCard title="اشتراك فعال" value={stats!.activeStores} tone="emerald" />
            <StatCard title="قيد الانتظار" value={stats!.pendingStores} tone="amber" />
            <StatCard title="منتهي" value={stats!.expiredStores} tone="red" />
            <StatCard title="Starter" value={stats!.starterStores} />
            <StatCard title="Business" value={stats!.businessStores} />
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ title, value, tone }: { title: string; value: number; tone?: "emerald" | "amber" | "red" }) {
  const toneClass =
    tone === "emerald" ? "text-emerald-600" : tone === "amber" ? "text-amber-600" : tone === "red" ? "text-red-600" : "text-zinc-900";
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs text-zinc-500">{title}</p>
      <p className={`mt-1 text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}
