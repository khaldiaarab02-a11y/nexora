"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { PLAN_LABELS, type PlanId } from "@/config/plans";
import type { PaymentRequestRow, PaymentRequestsResponse } from "@/types/api";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/LanguageProvider";

export default function AdminPaymentRequestPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { t } = useI18n();
  const [row, setRow] = useState<PaymentRequestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const token = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/payment-requests", { headers: { Authorization: `Bearer ${await token()}` } });
    const d = (await r.json()) as PaymentRequestsResponse;
    setRow(d.requests?.find((x) => x.id === id) || null);
    if (!r.ok) setError(d.error || "تعذر التحميل.");
    setLoading(false);
  }, [id, token]);

  useEffect(() => { void load(); }, [load]);

  async function action(actionName: "approve" | "reject" | "proof") {
    if (busy) return;
    setBusy(true);
    const r = await fetch(`/api/admin/payment-requests/${id}`, { method: "POST", headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" }, body: JSON.stringify(actionName === "reject" ? { action: actionName, reason } : { action: actionName }) });
    const d = (await r.json()) as { error?: string; url?: string };
    if (!r.ok) {
      const msg = d.error || t.feedback.adminActionError;
      setError(msg);
      toast.error(msg);
    } else if (actionName === "proof") {
      setProofUrl(d.url || "");
    } else {
      toast.success(t.feedback.adminActionSuccess);
      await load();
    }
    setBusy(false);
  }

  if (loading) return <main className="p-8 text-center">جاري التحميل...</main>;
  if (!row) return <main className="p-8 text-center"><p>{error || "الطلب غير موجود."}</p></main>;

  return <main className="min-h-screen bg-zinc-50 py-8"><div className="mx-auto max-w-2xl px-4"><Link href="/admin/subscriptions" className="text-sm text-zinc-500">← الطلبات</Link><section className="mt-5 rounded-3xl border bg-white p-6"><h1 className="text-2xl font-bold">طلب {PLAN_LABELS[row.plan_id as PlanId] || row.plan_id}</h1><dl className="mt-5 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs text-zinc-400">Store</dt><dd className="mt-1 text-sm">{row.store_id}</dd></div><div><dt className="text-xs text-zinc-400">الحالة</dt><dd className="mt-1 text-sm">{row.status}</dd></div><div><dt className="text-xs text-zinc-400">المرجع</dt><dd className="mt-1 text-sm">{row.payment_reference || "—"}</dd></div><div><dt className="text-xs text-zinc-400">المبلغ</dt><dd className="mt-1 text-sm">{row.amount === null ? "غير محدد" : `${row.amount} ${row.currency}`}</dd></div></dl>{row.proof_path && <button disabled={busy} onClick={() => void action("proof")} className="mt-6 rounded-xl border px-4 py-3 text-sm">فتح إثبات الدفع</button>}{proofUrl && <a href={proofUrl} target="_blank" rel="noreferrer" className="ms-3 text-sm font-semibold underline">فتح الرابط المؤقت</a>}{row.status === "pending" && <div className="mt-8 border-t pt-6"><div className="flex flex-wrap gap-3"><button disabled={busy} onClick={() => void action("approve")} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">الموافقة والتفعيل</button><button disabled={busy || !reason.trim()} onClick={() => void action("reject")} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white">رفض الطلب</button></div><textarea value={reason} onChange={(e) => setReason(e.target.value)} className="mt-4 min-h-28 w-full rounded-xl border px-4 py-3" placeholder="سبب الرفض، مطلوب عند الرفض" /></div>}{error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}</section></div></main>;
}
