"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

function friendlyAuthError(rawMessage: string): string {
  const message = rawMessage.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (message.includes("email not confirmed")) {
    return "يجب تأكيد بريدك الإلكتروني أولًا. تحققي من صندوق الوارد.";
  }
  if (message.includes("user already registered") || message.includes("already registered")) {
    return "هذا البريد مسجل بالفعل. سجّلي الدخول بدلًا من إنشاء حساب جديد.";
  }
  if (message.includes("password should be at least")) {
    return "كلمة المرور قصيرة جدًا. استخدمي 6 أحرف على الأقل.";
  }
  if (message.includes("unable to validate email") || message.includes("invalid email")) {
    return "صيغة البريد الإلكتروني غير صحيحة.";
  }
  if (message.includes("failed to fetch") || message.includes("network")) {
    return "تعذر الاتصال بالخادم. تحققي من اتصال الإنترنت وحاولي مجددًا.";
  }

  return rawMessage;
}

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  // If already authenticated, this page has nothing to do - move on to the
  // dashboard, which decides (via its own guard) whether that means the
  // real dashboard or the store-onboarding step.
  useEffect(() => {
    const requestedMode = searchParams.get("mode");
    if (requestedMode === "signup") setMode("signup");
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setCheckingSession(false); return; }
      const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
      if (admin) { router.replace("/admin"); return; }
      const { data: membership } = await supabase.from("store_members").select("store_id").eq("user_id", data.user.id).eq("role", "owner").limit(1).maybeSingle();
      router.replace(membership ? "/dashboard" : "/dashboard/store/new");
    });
  }, [router, searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    if (mode === "signup" && password !== confirmPassword) {
      setMessage("كلمتا المرور غير متطابقتين.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(friendlyAuthError(result.error.message));
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      if (result.data.session) {
        // Email confirmation is off in this project's Supabase settings -
        // the user is already logged in.
        router.push("/dashboard/store/new");
        return;
      }
      router.replace("/auth/verify-email");
      return;
    }

    const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", result.data.user.id).maybeSingle();
    if (admin) { router.push("/admin"); return; }
    const { data: membership } = await supabase.from("store_members").select("store_id").eq("user_id", result.data.user.id).eq("role", "owner").limit(1).maybeSingle();
    router.push(membership ? "/dashboard" : "/dashboard/store/new");
  }

  if (checkingSession) {
    return (
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 text-center text-sm text-zinc-400" dir="rtl">
        جاري التحقق من الجلسة...
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

        {mode === "signup" && (
          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium">تأكيد كلمة المرور</label>
            <input id="confirm-password" type="password" required minLength={6}
              autoComplete="new-password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900"
              placeholder="••••••••" />
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white disabled:opacity-50">
          {loading ? "جاري التنفيذ..." : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
        </button>
      </form>

      {message && (
        <p className={`mt-5 rounded-xl p-3 text-center text-sm ${
          messageType === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {message}
        </p>
      )}

      <div className="mt-5 text-center"><Link href="/auth/forgot-password" className="text-sm font-medium text-zinc-500 underline">{mode === "login" ? "نسيت كلمة المرور؟" : ""}</Link></div>

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
