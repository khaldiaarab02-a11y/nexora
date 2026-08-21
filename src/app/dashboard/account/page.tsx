"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [emailConfirmed, setEmailConfirmed] = useState<boolean | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (user) {
        setEmail(user.email ?? null);
        setEmailConfirmed(Boolean(user.email_confirmed_at));
        setCreatedAt(user.created_at ?? null);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-4 sm:p-6">
        <div className="mx-auto max-w-lg animate-pulse space-y-4 py-6">
          <div className="h-8 w-32 rounded bg-zinc-200" />
          <div className="h-48 rounded-3xl bg-zinc-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-8">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900">الحساب</h1>

        <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6">
          {email ? (
            <>
              <div>
                <p className="text-xs text-zinc-400">البريد الإلكتروني</p>
                <p className="mt-1 break-all text-sm font-medium text-zinc-900">{email}</p>
              </div>

              {emailConfirmed !== null && (
                <div className="mt-4">
                  <p className="text-xs text-zinc-400">حالة الحساب</p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      emailConfirmed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {emailConfirmed ? "البريد مؤكَّد" : "بانتظار تأكيد البريد"}
                  </span>
                </div>
              )}

              {createdAt && (
                <div className="mt-4">
                  <p className="text-xs text-zinc-400">تاريخ إنشاء الحساب</p>
                  <p className="mt-1 text-sm text-zinc-700">
                    {new Date(createdAt).toLocaleDateString("fr-DZ", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-red-600">يجب تسجيل الدخول أولًا.</p>
          )}

          <button
            onClick={handleSignOut}
            disabled={signingOut || !email}
            className="mt-6 w-full rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {signingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
          </button>
        </section>
      </div>
    </main>
  );
}
