"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { PLAN_LABELS, type PlanId } from "@/config/plans";
import { PLAN_PRICING } from "@/config/pricing";
import { useI18n } from "@/i18n/LanguageProvider";
import type { PaymentRequestRow, SubscriptionRow } from "@/types/api";

const features = {
  starter: ["إدارة المنتجات والصور", "السلة والطلبات", "Theme أساسي", "تخصيص أساسي"],
  business: ["كل مزايا Starter", "Themes متقدمة", "تخصيصات متقدمة"],
};

export default function SubscriptionPage() {
  const { dir } = useI18n();
  const [plan, setPlan] = useState<PlanId>("starter");
  const [current, setCurrent] = useState<SubscriptionRow | null>(null);
  const [requests, setRequests] = useState<PaymentRequestRow[]>([]);
  const [proof, setProof] = useState<File | null>(null);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      setLoading(false);
      return;
    }
    const { data: member } = await supabase
      .from("store_members")
      .select("store_id")
      .eq("user_id", user.user.id)
      .eq("role", "owner")
      .maybeSingle();

    if (member) {
      const [sub, token] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("id,store_id,plan_id,status,start_date,end_date,updated_at")
          .eq("store_id", member.store_id)
          .maybeSingle(),
        supabase.auth.getSession(),
      ]);
      const r = await fetch("/api/payment-requests", {
        headers: { Authorization: `Bearer ${token.data.session?.access_token || ""}` },
      });
      const d = (await r.json()) as { requests?: PaymentRequestRow[] };
      setCurrent(sub.data as SubscriptionRow | null);
      setRequests(d.requests || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!proof) {
      setMessage("يرجى إرفاق إثبات الدفع.");
      return;
    }
    setSending(true);
    setMessage("");
    const { data } = await supabase.auth.getSession();
    const fd = new FormData();
    fd.append("planId", plan);
    fd.append("paymentReference", reference);
    fd.append("proof", proof);
    const r = await fetch("/api/payment-requests", {
      method: "POST",
      headers: { Authorization: `Bearer ${data.session?.access_token || ""}` },
      body: fd,
    });
    const d = (await r.json()) as { error?: string };
    if (!r.ok) setMessage(d.error || "تعذر إرسال الطلب.");
    else {
      setMessage("تم إرسال طلب الدفع. سيظهر هنا بعد مراجعة الإدارة.");
      setProof(null);
      setReference("");
      await load();
    }
    setSending(false);
  }

  return (
    <main dir={dir} className="min-h-screen bg-zinc-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm text-zinc-500">Nexora</p><h1 className="mt-1 text-3xl font-bold">الاشتراك</h1><p className="mt-2 text-sm text-zinc-500">اختر الخطة ثم أرسلي إثبات الدفع للمراجعة.</p></div>
          <Link href="/dashboard" className="text-sm text-zinc-500">العودة</Link>
        </div>
        {current && <div className="mt-6 rounded-2xl border bg-white p-5"><b>الحالة الحالية:</b> {PLAN_LABELS[current.plan_id as PlanId] || current.plan_id} — {current.status}</div>}
        <div className="mt-6 grid gap-5 md:grid-cols-2">{(Object.keys(features) as PlanId[]).map((id) => <button type="button" key={id} onClick={() => setPlan(id)} className={`text-right rounded-3xl border bg-white p-6 ${plan === id ? "border-zinc-900 ring-2 ring-zinc-900/5" : "border-zinc-200"}`}><div className="flex items-center justify-between"><h2 className="text-2xl font-bold">{PLAN_LABELS[id]}</h2>{plan === id && <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-white">مختارة</span>}</div><div className="mt-4 space-y-2 text-sm text-zinc-600">{features[id].map((f) => <p key={f}>✓ {f}</p>)}</div><p className="mt-5 text-sm font-semibold">{PLAN_PRICING[id].amount === null ? "السعر يُحدد من إعدادات Nexora" : `${PLAN_PRICING[id].amount.toLocaleString()} ${PLAN_PRICING[id].currency}`}</p></button>)}</div>
        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6"><h2 className="text-xl font-bold">إرسال إثبات الدفع</h2><div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">بعد اختيار الخطة، استخدم طريقة الدفع التي يوفرها فريق Nexora، ثم أرفق صورة أو PDF لإثبات الدفع. لا يتم تفعيل الاشتراك حتى تتم المراجعة اليدوية.</div><form onSubmit={submit} className="mt-5 space-y-4"><label className="block text-sm font-medium">رقم/مرجع الدفع (اختياري)<input value={reference} onChange={(e) => setReference(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label><label className="block text-sm font-medium">إثبات الدفع<input required type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setProof(e.target.files?.[0] || null)} className="mt-2 block w-full rounded-xl border bg-white p-3 text-sm" /></label><button disabled={sending || loading} className="rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white">{sending ? "جاري الإرسال..." : "إرسال طلب المراجعة"}</button>{message && <p className="rounded-xl bg-zinc-50 p-4 text-sm">{message}</p>}</form></section>
        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6"><h2 className="text-xl font-bold">طلبات الدفع</h2><div className="mt-4 space-y-3">{requests.length === 0 ? <p className="text-sm text-zinc-500">لا توجد طلبات بعد.</p> : requests.map((r) => <div key={r.id} className="rounded-2xl border p-4"><div className="flex flex-wrap justify-between gap-2"><b>{PLAN_LABELS[r.plan_id as PlanId] || r.plan_id}</b><span className="text-sm">{r.status}</span></div>{r.rejection_reason && <p className="mt-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">سبب الرفض: {r.rejection_reason}</p>}</div>)}</div></section>
      </div>
    </main>
  );
}
