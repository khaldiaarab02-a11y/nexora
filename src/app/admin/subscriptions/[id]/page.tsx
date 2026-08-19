"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { PLAN_LABELS, type PlanId } from "@/config/plans";

type SubscriptionDetail = {
  store: { id: string; name: string; slug: string } | null;
  subscription: {
    plan_id: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
  } | null;
};

async function authedFetch(path: string, init?: RequestInit) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch(path, {
    ...init,
    headers: { ...(init?.headers || {}), Authorization: `Bearer ${token}` },
  });
}

export default function AdminSubscriptionDetailPage() {
  const params = useParams<{ id: string }>();
  const [detail, setDetail] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const response = await authedFetch(`/api/admin/stores/${params.id}`);
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "تعذر تحميل بيانات الاشتراك.");
        setLoading(false);
        return;
      }
      setDetail({
        store: data.store ?? null,
        subscription: data.subscription ?? null,
      });
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return <main className="min-h-screen bg-zinc-50 p-6 text-center text-zinc-500" dir="rtl">جاري التحميل...</main>;
  }

  if (!detail) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6 text-center" dir="rtl">
        <p className="rounded-2xl bg-red-50 p-4 text-red-700">{message}</p>
      </main>
    );
  }

  const subscription = detail.subscription;

  return (
    <main className="min-h-screen bg-zinc-50 py-8" dir="rtl">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <Link href="/admin/stores" className="text-sm text-zinc-500">→ كل المتاجر</Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">تفاصيل الاشتراك</h1>

        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900">المتجر</h2>
          {detail.store ? (
            <>
              <p className="mt-2 text-sm font-medium text-zinc-800">{detail.store.name}</p>
              <p className="mt-1 text-sm text-zinc-400">/shop/{detail.store.slug}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">المتجر غير موجود.</p>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900">الاشتراك</h2>
          {subscription ? (
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-zinc-400">الخطة</dt>
                <dd className="mt-1 text-sm font-semibold">{PLAN_LABELS[subscription.plan_id as PlanId] || subscription.plan_id}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-400">الحالة</dt>
                <dd className="mt-1 text-sm font-semibold">{subscription.status}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-400">تاريخ البداية</dt>
                <dd className="mt-1 text-sm">{subscription.start_date ? new Date(subscription.start_date).toLocaleDateString("fr-DZ") : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-400">تاريخ الانتهاء</dt>
                <dd className="mt-1 text-sm">{subscription.end_date ? new Date(subscription.end_date).toLocaleDateString("fr-DZ") : "—"}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">لا يوجد اشتراك لهذا المتجر.</p>
          )}
        </section>
      </div>
    </main>
  );
}
