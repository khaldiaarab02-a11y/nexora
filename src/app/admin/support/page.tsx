"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { SupportConversation, SupportListResponse } from "@/types/api";

export default function AdminSupport() {
  const [rows, setRows] = useState<SupportConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/admin/support", { headers: { Authorization: `Bearer ${data.session?.access_token || ""}` } });
    const d = (await r.json()) as SupportListResponse;
    setRows(d.conversations || []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return <main className="min-h-screen bg-zinc-50 py-8"><div className="mx-auto max-w-6xl px-4"><h1 className="text-3xl font-bold">دعم التجار</h1><div className="mt-6 rounded-3xl border bg-white p-5">{loading ? "جاري التحميل..." : rows.length === 0 ? <p className="text-sm text-zinc-500">لا توجد محادثات.</p> : <div className="space-y-2">{rows.map((r) => <Link href={`/admin/support/${r.id}`} key={r.id} className="flex justify-between gap-3 rounded-2xl border p-4 hover:bg-zinc-50"><div><b>{r.subject}</b><p className="mt-1 text-xs text-zinc-500">Store: {r.store_id}</p></div><span className="text-xs">{r.status}</span></Link>)}</div>}</div></div></main>;
}
