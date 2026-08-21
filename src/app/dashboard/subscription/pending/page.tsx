"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { PLAN_LABELS, type PlanId } from "@/config/plans";
import type { PaymentRequestRow, SubscriptionListResponse } from "@/types/api";

export default function PendingPage() {
  const [row, setRow] = useState<PaymentRequestRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      const r = await fetch("/api/subscriptions", { headers: { Authorization: `Bearer ${data.session?.access_token || ""}` } });
      const d = (await r.json()) as SubscriptionListResponse;
      setRow(d.requests?.[0] || null);
      setLoading(false);
    });
  }, []);

  return <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6"><div className="w-full max-w-lg rounded-3xl border bg-white p-8 text-center">{loading ? <p>جاري التحميل...</p> : row?.status === "approved" ? <><h1 className="text-3xl font-bold">تمت الموافقة</h1><p className="mt-3 text-zinc-500">تم تفعيل {PLAN_LABELS[row.plan_id as PlanId] || row.plan_id}.</p><Link href="/dashboard" className="mt-6 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-white">لوحة التحكم</Link></> : row?.status === "rejected" ? <><h1 className="text-3xl font-bold">تم رفض الطلب</h1><p className="mt-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">{row.rejection_reason || "يرجى إعادة إرسال الإثبات."}</p><Link href={`/dashboard/subscription/payment?plan=${row.plan_id}`} className="mt-6 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-white">إعادة الإرسال</Link></> : <><h1 className="text-3xl font-bold">طلبك قيد المراجعة</h1><p className="mt-3 text-zinc-500">سيراجع فريق Nexora إثبات الدفع ثم يفعّل الاشتراك عند الموافقة.</p><Link href="/dashboard" className="mt-6 inline-flex rounded-xl border px-5 py-3">العودة للوحة التحكم</Link></>}</div></main>;
}
