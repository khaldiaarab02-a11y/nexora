"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function CreateStoreForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleSlugChange(value: string) {
    setSlug(value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-"));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setMessage("يجب تسجيل الدخول أولًا.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc("create_store", {
      p_name: name.trim(),
      p_slug: slug,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setMessage("تعذر إنشاء المتجر.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm" dir="rtl">
      <div className="mb-8">
        <p className="text-sm font-medium text-zinc-500">Nexora</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">إنشاء متجرك</h1>
        <p className="mt-2 text-sm text-zinc-500">أدخل المعلومات الأساسية لبدء متجرك الإلكتروني.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="store-name" className="mb-2 block text-sm font-medium text-zinc-700">اسم المتجر</label>
          <input id="store-name" required value={name} onChange={(e)=>setName(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-900"
            placeholder="مثال: متجر الأناقة" />
        </div>

        <div>
          <label htmlFor="store-slug" className="mb-2 block text-sm font-medium text-zinc-700">رابط المتجر</label>
          <div className="flex items-center rounded-xl border border-zinc-300 focus-within:border-zinc-900">
            <span className="border-l px-3 text-sm text-zinc-400">/</span>
            <input id="store-slug" required minLength={3} value={slug} onChange={(e)=>handleSlugChange(e.target.value)}
              className="w-full rounded-xl px-3 py-3 outline-none" placeholder="my-store" />
          </div>
          <p className="mt-2 text-xs text-zinc-400">استخدمي الحروف الإنجليزية والأرقام والشرطة فقط.</p>
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50">
          {loading ? "جاري إنشاء المتجر..." : "إنشاء المتجر"}
        </button>
      </form>

      {message && <p className="mt-5 rounded-xl bg-red-50 p-3 text-center text-sm text-red-700">{message}</p>}
    </div>
  );
}