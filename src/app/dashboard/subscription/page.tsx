"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { PLAN_LABELS, type PlanId } from "@/config/plans";
import { PLAN_PRICING } from "@/config/pricing";
import { useI18n } from "@/i18n/LanguageProvider";
import type { PaymentRequestRow, SubscriptionRow } from "@/types/api";

export default function SubscriptionPage() {
  const { dir, t } = useI18n();
  const features: Record<PlanId, string[]> = {
    starter: [t.subscription.starterFeature1, t.subscription.starterFeature2, t.subscription.starterFeature3, t.subscription.starterFeature4],
    business: [t.subscription.businessFeature1, t.subscription.businessFeature2, t.subscription.businessFeature3],
  };
  const [plan, setPlan] = useState<PlanId>("starter");
  const [current, setCurrent] = useState<SubscriptionRow | null>(null);
  const [requests, setRequests] = useState<PaymentRequestRow[]>([]);
  const [proof, setProof] = useState<File | null>(null);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentSettings, setPaymentSettings] = useState<{ccp_account:string|null;account_holder:string|null;payment_methods:string|null;instructions:string|null}|null>(null);

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
      const settingsResponse = await fetch("/api/payment-settings", { headers: { Authorization: `Bearer ${token.data.session?.access_token || ""}` } });
      const settingsData = await settingsResponse.json() as { settings?: {ccp_account:string|null;account_holder:string|null;payment_methods:string|null;instructions:string|null} | null };
      setPaymentSettings(settingsData.settings || null);
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
      setMessage(t.feedback.paymentProofRequired);
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
    if (!r.ok) setMessage(d.error || t.feedback.subscriptionRequestError);
    else {
      setMessage(t.subscription.requestSentDetail);
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
          <div><p className="text-sm text-zinc-500">Nexora</p><h1 className="mt-1 text-3xl font-bold">{t.subscription.title}</h1><p className="mt-2 text-sm text-zinc-500">{t.subscription.subtitle}</p></div>
          <Link href="/dashboard" className="text-sm text-zinc-500">{t.subscription.back}</Link>
        </div>
        {current && <div className="mt-6 rounded-2xl border bg-white p-5"><b>{t.subscription.currentStatusLabel}</b> {PLAN_LABELS[current.plan_id as PlanId] || current.plan_id} — {current.status}</div>}
        <div className="mt-6 grid gap-5 md:grid-cols-2">{(Object.keys(features) as PlanId[]).map((id) => <button type="button" key={id} onClick={() => setPlan(id)} className={`text-right rounded-3xl border bg-white p-6 ${plan === id ? "border-zinc-900 ring-2 ring-zinc-900/5" : "border-zinc-200"}`}><div className="flex items-center justify-between"><h2 className="text-2xl font-bold">{PLAN_LABELS[id]}</h2>{plan === id && <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-white">{t.subscription.selectedBadge}</span>}</div><div className="mt-4 space-y-2 text-sm text-zinc-600">{features[id].map((f) => <p key={f}>✓ {f}</p>)}</div><p className="mt-5 text-sm font-semibold">{PLAN_PRICING[id].amount === null ? t.subscription.priceTBD : `${PLAN_PRICING[id].amount.toLocaleString()} ${PLAN_PRICING[id].currency}`}</p></button>)}</div>
        {paymentSettings && (paymentSettings.ccp_account || paymentSettings.payment_methods || paymentSettings.instructions) && <section className="mt-6 rounded-3xl border border-violet-100 bg-violet-50/60 p-6"><h2 className="text-xl font-bold text-zinc-900">{t.subscription.paymentInfoTitle}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{paymentSettings.ccp_account && <div className="rounded-2xl bg-white p-4"><p className="text-xs text-zinc-500">{t.subscription.ccpAccountLabel}</p><p className="mt-1 font-bold">{paymentSettings.ccp_account}</p></div>}{paymentSettings.account_holder && <div className="rounded-2xl bg-white p-4"><p className="text-xs text-zinc-500">{t.subscription.accountHolderLabel}</p><p className="mt-1 font-semibold">{paymentSettings.account_holder}</p></div>}</div>{paymentSettings.payment_methods && <div className="mt-3 rounded-2xl bg-white p-4"><p className="text-xs text-zinc-500">{t.subscription.paymentMethodsLabel}</p><p className="mt-1 whitespace-pre-wrap leading-7">{paymentSettings.payment_methods}</p></div>}{paymentSettings.instructions && <div className="mt-3 rounded-2xl bg-white p-4"><p className="text-xs text-zinc-500">{t.subscription.paymentInstructionsLabel}</p><p className="mt-1 whitespace-pre-wrap leading-7 text-zinc-700">{paymentSettings.instructions}</p></div>}</section>}
        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6"><h2 className="text-xl font-bold">{t.subscription.sendProofTitle}</h2><div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">{t.subscription.sendProofIntro}</div><form onSubmit={submit} className="mt-5 space-y-4"><label className="block text-sm font-medium">{t.subscription.paymentRefLabel}<input value={reference} onChange={(e) => setReference(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label><label className="block text-sm font-medium">{t.subscription.paymentProofLabel}<input required type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setProof(e.target.files?.[0] || null)} className="mt-2 block w-full rounded-xl border bg-white p-3 text-sm" /></label><button disabled={sending || loading} className="rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white">{sending ? t.subscription.sending : t.subscription.submitReview}</button>{message && <p className="rounded-xl bg-zinc-50 p-4 text-sm">{message}</p>}</form></section>
        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6"><h2 className="text-xl font-bold">{t.subscription.paymentRequestsTitle}</h2><div className="mt-4 space-y-3">{requests.length === 0 ? <p className="text-sm text-zinc-500">{t.subscription.noRequestsYet}</p> : requests.map((r) => <div key={r.id} className="rounded-2xl border p-4"><div className="flex flex-wrap justify-between gap-2"><b>{PLAN_LABELS[r.plan_id as PlanId] || r.plan_id}</b><span className="text-sm">{r.status}</span></div>{r.rejection_reason && <p className="mt-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{t.subscription.rejectionReasonPrefix} {r.rejection_reason}</p>}</div>)}</div></section>
      </div>
    </main>
  );
}
