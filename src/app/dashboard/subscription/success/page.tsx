"use client";
import Link from "next/link";
import { useI18n } from "@/i18n/LanguageProvider";
export default function SubscriptionSuccessPage(){
  const { t } = useI18n();
  return <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6"><div className="w-full max-w-lg rounded-3xl border bg-white p-8 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">✓</div><h1 className="mt-5 text-3xl font-bold">{t.subscriptionSuccess.title}</h1><p className="mt-3 text-zinc-500">{t.subscriptionSuccess.subtitle}</p><Link href="/dashboard" className="mt-6 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-white">{t.subscriptionSuccess.dashboardLink}</Link></div></main>;
}
