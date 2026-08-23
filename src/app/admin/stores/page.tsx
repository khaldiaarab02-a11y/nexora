"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { PLAN_LABELS, type PlanId } from "@/config/plans";
import { useI18n } from "@/i18n/LanguageProvider";

type Row = {
  storeId: string;
  storeName: string;
  storeSlug: string;
  createdAt: string;
  planId: string;
  status: string;
};

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700",
  expired: "bg-red-50 text-red-700",
  cancelled: "bg-zinc-100 text-zinc-500",
};

export default function AdminStoresPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: stores, error: storesError } = await supabase
        .from("stores")
        .select("id,name,slug,created_at")
        .order("created_at", { ascending: false });

      if (storesError) {
        setMessage(storesError.message);
        setLoading(false);
        return;
      }

      const { data: subs } = await supabase.from("subscriptions").select("store_id,plan_id,status");
      const subsByStore = new Map((subs ?? []).map((s) => [s.store_id, s]));

      setRows(
        (stores ?? []).map((store) => ({
          storeId: store.id,
          storeName: store.name,
          storeSlug: store.slug,
          createdAt: store.created_at,
          planId: subsByStore.get(store.id)?.plan_id || "—",
          status: subsByStore.get(store.id)?.status || "—",
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900">{t.adminStoresList.title}</h1>

        <div className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl border border-zinc-200 bg-white" />
              ))}
            </div>
          ) : message ? (
            <p className="rounded-2xl bg-red-50 p-4 text-red-700">{message}</p>
          ) : rows.length === 0 ? (
            <p className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">{t.adminStoresList.noStoresYet}</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              {rows.map((row) => (
                <Link
                  key={row.storeId}
                  href={`/admin/stores/${row.storeId}`}
                  className="flex flex-col gap-2 border-b border-zinc-100 p-4 last:border-0 hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-zinc-900">{row.storeName}</p>
                    <p className="truncate text-xs text-zinc-400">/shop/{row.storeSlug}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm">
                    <span className="text-zinc-500">{PLAN_LABELS[row.planId as PlanId] || row.planId}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle[row.status] || "bg-zinc-100 text-zinc-500"}`}>
                      {t.storeStatus[row.status as keyof typeof t.storeStatus] || row.status}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(row.createdAt).toLocaleDateString("fr-DZ", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
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
