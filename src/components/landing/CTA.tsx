"use client";
import Link from "next/link";
import { useI18n } from "@/i18n/LanguageProvider";

export default function CTA() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="relative overflow-hidden rounded-[30px] bg-zinc-950 px-6 py-14 text-white sm:px-10 lg:px-14 lg:py-16">
        <div className="absolute -end-20 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Nexora</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{t.landing.ctaTitle}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">{t.landing.ctaDescription}</p>
          <Link href="/auth?mode=signup" className="mt-7 inline-flex rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100">{t.landing.createAccount}</Link>
        </div>
      </div>
    </section>
  );
}
