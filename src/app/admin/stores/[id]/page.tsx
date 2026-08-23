"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { PLAN_LABELS, type PlanId } from "@/config/plans";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/LanguageProvider";

type StoreDetail = {
  store: { id: string; name: string; slug: string; description: string | null; logo_url: string | null; is_active: boolean; created_at: string };
  ownerEmail: string | null;
  subscription: { plan_id: string; status: string; start_date: string | null; end_date: string | null } | null;
};


async function authedFetch(path: string, init?: RequestInit) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch(path, {
    ...init,
    headers: { ...(init?.headers || {}), Authorization: `Bearer ${token}` },
  });
}

export default function AdminStoreDetailPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const { t } = useI18n();
  const [detail, setDetail] = useState<StoreDetail | null>(null);
  const [endDateInput, setEndDateInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  async function load() {
    setLoading(true);
    const response = await authedFetch(`/api/admin/stores/${params.id}`);
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || t.adminStoreDetail.loadError);
      setMessageType("error");
      setLoading(false);
      return;
    }
    setDetail(data);
    setEndDateInput(data.subscription?.end_date ? data.subscription.end_date.slice(0, 10) : "");
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function updateSubscription(patch: { status?: string; planId?: string; endDate?: string | null }) {
    if (saving) return;
    setSaving(true);
    setMessage("");

    const response = await authedFetch("/api/admin/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId: params.id, ...patch }),
    });
    const data = await response.json();

    if (!response.ok) {
      const msg = data.error || t.feedback.adminActionError;
      setMessage(msg);
      setMessageType("error");
      toast.error(msg);
      setSaving(false);
      return;
    }

    setMessage(t.adminStoreDetail.subscriptionUpdateSuccess);
    setMessageType("success");
    toast.success(t.feedback.adminActionSuccess);
    await load();
    setSaving(false);
  }

  if (loading) {
    return <main className="min-h-screen bg-zinc-50 p-6 text-center text-zinc-500">{t.adminStoreDetail.loading}</main>;
  }

  if (!detail) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6 text-center">
        <p className="rounded-2xl bg-red-50 p-4 text-red-700">{message}</p>
      </main>
    );
  }

  const sub = detail.subscription;

  return (
    <main className="min-h-screen bg-zinc-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <Link href="/admin/stores" className="text-sm text-zinc-500">{t.adminStoreDetail.allStores}</Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">{detail.store.name}</h1>
        <p className="text-sm text-zinc-400">/shop/{detail.store.slug}</p>

        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900">{t.adminStoreDetail.storeInfoTitle}</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-xs text-zinc-400">{t.adminStoreDetail.owner}</dt><dd className="mt-1 text-sm">{detail.ownerEmail || t.adminStoreDetail.unknown}</dd></div>
            <div><dt className="text-xs text-zinc-400">{t.adminStoreDetail.createdAt}</dt><dd className="mt-1 text-sm">{new Date(detail.store.created_at).toLocaleDateString("fr-DZ")}</dd></div>
            <div><dt className="text-xs text-zinc-400">{t.adminStoreDetail.visibleInStore}</dt><dd className="mt-1 text-sm">{detail.store.is_active ? t.adminStoreDetail.yes : t.adminStoreDetail.no}</dd></div>
          </dl>
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900">{t.adminStoreDetail.subscriptionTitle}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-xs text-zinc-400">{t.adminStoreDetail.currentPlan}</dt><dd className="mt-1 text-sm font-semibold">{sub ? PLAN_LABELS[sub.plan_id as PlanId] || sub.plan_id : t.adminStoreDetail.noSubscription}</dd></div>
            <div><dt className="text-xs text-zinc-400">{t.common.status}</dt><dd className="mt-1 text-sm font-semibold">{sub ? t.storeStatus[sub.status as keyof typeof t.storeStatus] || sub.status : "—"}</dd></div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button disabled={saving} onClick={() => updateSubscription({ status: "active" })}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{t.adminStoreDetail.activate}</button>
            <button disabled={saving} onClick={() => updateSubscription({ status: "cancelled" })}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{t.adminStoreDetail.deactivate}</button>
            <button disabled={saving} onClick={() => updateSubscription({ planId: sub?.plan_id === "starter" ? "business" : "starter" })}
              className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 disabled:opacity-50">
              {t.adminStoreDetail.changePlanTo} {sub?.plan_id === "starter" ? "Business" : "Starter"}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-2 block text-xs text-zinc-500">{t.adminStoreDetail.extendUntil}</label>
              <input type="date" value={endDateInput} onChange={(e) => setEndDateInput(e.target.value)}
                className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm" />
            </div>
            <button disabled={saving || !endDateInput}
              onClick={() => updateSubscription({ endDate: new Date(endDateInput).toISOString() })}
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
              {t.adminStoreDetail.saveDate}
            </button>
          </div>

          {message && (
            <p className={`mt-5 rounded-xl p-3 text-sm ${messageType === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
