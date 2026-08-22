"use client";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/LanguageProvider";
import { useToast } from "@/components/ui/Toast";
import type { SupportConversation, SupportListResponse } from "@/types/api";

const cats: Array<[string, string]> = [["technical", "مشكلة تقنية"], ["store", "مشكلة في المتجر"], ["subscription", "الاشتراك"], ["payment", "الدفع"], ["general", "سؤال عام"]];

export default function SupportPage() {
  const { dir, t } = useI18n();
  const toast = useToast();
  const [rows, setRows] = useState<SupportConversation[]>([]);
  const [category, setCategory] = useState("technical");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const token = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }, []);

  const load = useCallback(async () => {
    const r = await fetch("/api/support", { headers: { Authorization: `Bearer ${await token()}` } });
    const d = (await r.json()) as SupportListResponse;
    setRows(d.conversations || []);
    setError(d.error || "");
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      const r = await fetch("/api/support", { method: "POST", headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ category, subject, message }) });
      const d = (await r.json()) as { error?: string };
      if (!r.ok) {
        const message = d.error || t.feedback.supportSentError;
        setError(message);
        toast.error(message);
      } else {
        setSubject("");
        setMessage("");
        setError("");
        toast.success(t.feedback.supportSentSuccess);
        await load();
      }
    } catch {
      setError(t.feedback.genericError);
      toast.error(t.feedback.genericError);
    } finally {
      setCreating(false);
    }
  }

  return <main dir={dir} className="min-h-screen bg-zinc-50 py-8"><div className="mx-auto max-w-5xl px-4 sm:px-6"><h1 className="text-3xl font-bold">الدعم</h1><div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]"><section className="rounded-3xl border bg-white p-6"><h2 className="text-xl font-bold">طلب جديد</h2><form onSubmit={submit} className="mt-5 space-y-4"><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border px-4 py-3">{cats.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="الموضوع" className="w-full rounded-xl border px-4 py-3" /><textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="اكتب رسالتك" className="min-h-36 w-full rounded-xl border px-4 py-3" /><button disabled={creating} className="w-full rounded-xl bg-zinc-900 px-5 py-3 font-semibold text-white disabled:opacity-60 sm:w-auto">{creating ? t.common.sending : "إرسال الطلب"}</button>{error && <p className="text-sm text-red-600">{error}</p>}</form></section><section className="rounded-3xl border bg-white p-6"><h2 className="text-xl font-bold">محادثاتي</h2><div className="mt-5 space-y-3">{rows.length === 0 ? <p className="text-sm text-zinc-500">لا توجد محادثات.</p> : rows.map((r) => <Link href={`/dashboard/support/${r.id}`} key={r.id} className="block rounded-2xl border p-4 hover:bg-zinc-50"><div className="flex justify-between gap-3"><b>{r.subject}</b><span className="text-xs text-zinc-500">{r.status}</span></div><p className="mt-1 text-xs text-zinc-500">{r.category}</p></Link>)}</div></section></div></div></main>;
}
