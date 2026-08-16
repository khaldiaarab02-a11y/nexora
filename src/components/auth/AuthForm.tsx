"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUserEmail(session?.user?.email ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === "signup") {
      setMessage("تم إنشاء الحساب. إذا كان تأكيد البريد مفعّلًا، افتحي بريدك وأكدي الحساب.");
    } else {
      setMessage("تم تسجيل الدخول بنجاح.");
    }

    setLoading(false);
  }

  async function handleSignOut() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setMessage(error ? error.message : "تم تسجيل الخروج.");
    setLoading(false);
  }

  if (userEmail) {
    return (
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 text-center shadow-sm" dir="rtl">
        <p className="text-sm text-zinc-500">Nexora</p>
        <h1 className="mt-2 text-2xl font-bold">أنت مسجل الدخول</h1>
        <p className="mt-4 break-all text-sm text-zinc-600">{userEmail}</p>
        <button onClick={handleSignOut} disabled={loading}
          className="mt-8 w-full rounded-xl bg-zinc-900 px-4 py-3 text-white disabled:opacity-50">
          {loading ? "جاري التنفيذ..." : "تسجيل الخروج"}
        </button>
        {message && <p className="mt-4 text-sm text-zinc-600">{message}</p>}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-sm" dir="rtl">
      <div className="text-center">
        <p className="text-sm text-zinc-500">Nexora</p>
        <h1 className="mt-2 text-3xl font-bold">
          {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">البريد الإلكتروني</label>
          <input id="email" type="email" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900"
            placeholder="name@example.com" />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">كلمة المرور</label>
          <input id="password" type="password" required minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900"
            placeholder="••••••••" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white disabled:opacity-50">
          {loading ? "جاري التنفيذ..." : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
        </button>
      </form>

      {message && <p className="mt-5 rounded-xl bg-zinc-50 p-3 text-center text-sm">{message}</p>}

      <div className="mt-6 text-center text-sm text-zinc-500">
        {mode === "login" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
        <button type="button" className="mr-2 font-semibold underline"
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
          {mode === "login" ? "إنشاء حساب" : "تسجيل الدخول"}
        </button>
      </div>
    </div>
  );
}