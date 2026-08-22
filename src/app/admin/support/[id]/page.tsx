"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { SupportDetailResponse, SupportMessage } from "@/types/api";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/i18n/LanguageProvider";

type AdminSupportDetailState = { conversation: NonNullable<SupportDetailResponse["conversation"]>; messages: SupportMessage[] };

export default function AdminSupportDetail() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { t } = useI18n();
  const [data, setData] = useState<AdminSupportDetailState | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const token = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }, []);

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/support/${id}`, { headers: { Authorization: `Bearer ${await token()}` } });
    const d = (await r.json()) as SupportDetailResponse;
    if (d.conversation) setData({ conversation: d.conversation, messages: d.messages || [] });
    else setData(null);
  }, [id, token]);

  useEffect(() => { void load(); }, [load]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const r = await fetch(`/api/admin/support/${id}`, { method: "POST", headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      if (!r.ok) {
        toast.error(t.feedback.replySentError);
      } else {
        setMessage("");
        toast.success(t.feedback.replySentSuccess);
        await load();
      }
    } catch {
      toast.error(t.feedback.replySentError);
    } finally {
      setSending(false);
    }
  }

  async function change(status: "open" | "resolved") {
    const r = await fetch(`/api/admin/support/${id}`, { method: "POST", headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" }, body: JSON.stringify({ action: "status", status }) });
    if (!r.ok) {
      toast.error(t.feedback.adminActionError);
      return;
    }
    toast.success(t.feedback.adminActionSuccess);
    await load();
  }

  if (!data) return <main className="p-8 text-center">جاري التحميل...</main>;
  return <main className="min-h-screen bg-zinc-50 py-8"><div className="mx-auto max-w-3xl px-4"><Link href="/admin/support" className="text-sm text-zinc-500">← الدعم</Link><div className="mt-4 rounded-3xl border bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">{data.conversation.subject}</h1><p className="mt-1 text-xs text-zinc-500">{data.conversation.category}</p></div><div className="flex gap-2"><button onClick={() => void change("open")} className="rounded-lg border px-3 py-2 text-xs">مفتوح</button><button onClick={() => void change("resolved")} className="rounded-lg bg-zinc-900 px-3 py-2 text-xs text-white">حل</button></div></div><div className="mt-6 space-y-3">{data.messages.map((m) => <div key={m.id} className="rounded-2xl bg-zinc-50 p-4"><p className="text-sm leading-7">{m.message}</p><p className="mt-2 text-xs text-zinc-400">{new Date(m.created_at).toLocaleString()}</p></div>)}</div><form onSubmit={send} className="mt-6 flex flex-col gap-2 sm:flex-row"><input required value={message} onChange={(e) => setMessage(e.target.value)} className="min-w-0 flex-1 rounded-xl border px-4 py-3" placeholder="رد الإدارة..." /><button disabled={sending} className="shrink-0 rounded-xl bg-zinc-900 px-5 py-3 text-white disabled:opacity-60">{sending ? t.common.sending : "إرسال"}</button></form></div></div></main>;
}
