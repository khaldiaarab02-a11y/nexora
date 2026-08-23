"use client";

import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { useI18n } from "@/i18n/LanguageProvider";

function AuthLoading() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-md rounded-3xl border bg-white p-8 text-center text-sm text-zinc-400">
        {t.common.loading}
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
        <AuthForm />
      </main>
    </Suspense>
  );
}
