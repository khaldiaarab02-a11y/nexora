"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/i18n/LanguageProvider";

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

// Where an authenticated user belongs: admin -> /admin, owner with a store
// -> /dashboard, owner without one yet -> /dashboard/store/new. Centralized
// here so login, signup, and the "already signed in" auto-redirect on
// mount all resolve it identically.
async function resolveDestination(userId: string): Promise<string> {
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
  if (admin) return "/admin";

  const { data: membership } = await supabase
    .from("store_members")
    .select("store_id")
    .eq("user_id", userId)
    .eq("role", "owner")
    .limit(1)
    .maybeSingle();

  return membership ? "/dashboard" : "/dashboard/store/new";
}

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, dir } = useI18n();

  const [mode, setMode] = useState<"login" | "signup">(searchParams.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  // If already authenticated, this page has nothing to do - move on to
  // wherever this account belongs.
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setCheckingSession(false);
        return;
      }
      router.replace(await resolveDestination(data.user.id));
    });
  }, [router]);

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
        ? await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (result.error) {
      setMessage(friendlyAuthError(result.error.message));
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      if (result.data.session && result.data.user) {
        // Email confirmation is off in this project's Supabase settings -
        // the user is already logged in.
        router.push(await resolveDestination(result.data.user.id));
        return;
      }
      router.replace("/auth/verify-email");
      return;
    }

    if (!result.data.user) {
      setMessage("تعذر التحقق من الحساب بعد تسجيل الدخول. حاولي مرة أخرى.");
      setMessageType("error");
      setLoading(false);
      return;
    }

    router.push(await resolveDestination(result.data.user.id));
  }

  if (checkingSession) {
    return (
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 text-center text-sm text-zinc-400" dir={dir}>
        {t.common.loading}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm" dir={dir}>
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm font-black">Nexora</Link>
        <LanguageSwitcher />
      </div>

      <div className="mt-8 text-center">
        <h1 className="text-3xl font-bold">{mode === "login" ? t.auth.login : t.auth.signup}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {mode === "login" ? "ادخلي إلى لوحة متجرك." : "أنشئي حسابك وابدئي رحلة متجرك."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <label className="block text-sm font-medium">
          {t.auth.email}
          <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900" placeholder="name@example.com" />
        </label>

        <label className="block text-sm font-medium">
          {t.auth.password}
          <input required minLength={6} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900" placeholder="••••••••" />
        </label>

        {mode === "signup" && (
          <label className="block text-sm font-medium">
            {t.auth.confirm}
            <input required minLength={6} type="password" autoComplete="new-password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-zinc-900" placeholder="••••••••" />
          </label>
        )}

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white disabled:opacity-50">
          {loading ? "..." : mode === "login" ? t.auth.login : t.auth.signup}
        </button>
      </form>

      {mode === "login" && (
        <div className="mt-4 text-center">
          <Link href="/auth/forgot-password" className="text-sm font-medium underline">{t.auth.forgot}</Link>
        </div>
      )}

      {message && (
        <p className={`mt-5 rounded-xl p-3 text-center text-sm ${
          messageType === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {message}
        </p>
      )}

      <div className="mt-6 text-center text-sm text-zinc-500">
        <button type="button" className="font-semibold underline"
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
          {mode === "login" ? t.auth.signup : t.auth.login}
        </button>
      </div>
    </div>
  );
}
