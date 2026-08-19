"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { PLAN_LABELS, type PlanId } from "@/config/plans";

type Row = {
  storeId: string;
  storeName: string;
  storeSlug: string;
  planId: string;
  status: string;
  endDate: string | null;
};

const statusLabel: Record<string, string> = {
  pending: "قيد الانتظار",
  active: "فعال",
  expired: "منتهي",
  cancelled: "ملغى",
};

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700",
  expired: "bg-red-50 text-red-700",
  cancelled: "bg-zinc-100 text-zinc-500",
};

export default function AdminSubscriptionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: stores, error: storesError } = await supabase
        .from("stores")
        .select("id,name,slug")
        .order("created_at", { ascending: false });

      if (storesError) {
        setMessage(storesError.message);
        setLoading(false);
        return;
      }

      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from("subscriptions")
        .select("store_id,plan_id,status,end_date");

      if (subscriptionsError) {
        setMessage(subscriptionsError.message);
        setLoading(false);
        return;
      }

      const subscriptionsByStore = new Map(
        (subscriptions ?? []).map((subscription) => [subscription.store_id, subscription])
      );

      setRows(
        (stores ?? []).map((store) => {
          const subscription = subscriptionsByStore.get(store.id);
          return {
            storeId: store.id,
            storeName: store.name,
            storeSlug: store.slug,
            planId: subscription?.plan_id || "—",
            status: subscription?.status || "—",
            endDate: subscription?.end_date || null,
          };
        })
      );
      setLoading(false);
    }

    load();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 py-8" dir="rtl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900">الاشتراكات</h1>
        <p className="mt-1 text-sm text-zinc-500">إدارة اشتراك كل متجر من خلال تفاصيله.</p>

        <div className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl border border-zinc-200 bg-white" />
              ))}
            </div>
          ) : message ? (
            <p className="rounded-2xl bg-red-50 p-4 text-red-700">{message}</p>
          ) : rows.length === 0 ? (
            <p className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
              لا توجد متاجر بعد.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              {rows.map((row) => (
                <Link
                  key={row.storeId}
                  href={`/admin/subscriptions/${row.storeId}`}
                  className="flex flex-col gap-3 border-b border-zinc-100 p-4 last:border-0 hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-zinc-900">{row.storeName}</p>
                    <p className="truncate text-xs text-zinc-400">/shop/{row.storeSlug}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3 text-sm">
                    <span className="text-zinc-500">
                      {PLAN_LABELS[row.planId as PlanId] || row.planId}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusStyle[row.status] || "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {statusLabel[row.status] || row.status}
                    </span>
                    {row.endDate && (
                      <span className="text-xs text-zinc-400">
                        حتى {new Date(row.endDate).toLocaleDateString("fr-DZ")}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
