"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/i18n/LanguageProvider";

function LogoMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-[0_8px_24px_rgba(24,24,27,0.14)]">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path d="M7.5 10.5V8.8a4.5 4.5 0 0 1 9 0v1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="5" y="10" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 14v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function ArrowIcon() {
  return <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function Hero() {
  const { t } = useI18n();

  return (
    <header className="relative z-40 border-b border-zinc-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Nexora">
          <LogoMark />
          <span className="text-[20px] font-extrabold tracking-[-0.04em] text-zinc-950">Nexora</span>
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] font-medium text-zinc-600 lg:flex">
          <a href="#features" className="transition hover:text-zinc-950">{t.nav.features}</a>
          <a href="#plans" className="transition hover:text-zinc-950">{t.nav.plans}</a>
          <a href="#how" className="transition hover:text-zinc-950">{t.landing.howNav}</a>
          <a href="#about" className="transition hover:text-zinc-950">{t.nav.about}</a>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/auth" className="inline-flex rounded-xl px-2.5 py-2.5 text-[12px] font-semibold text-zinc-700 transition hover:bg-zinc-100 sm:px-3.5 sm:text-[13px]">
            {t.nav.login}
          </Link>
          <Link href="/auth?mode=signup" className="group inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3 py-2.5 text-[12px] font-semibold text-white sm:gap-2 sm:px-4 sm:text-[13px] shadow-[0_8px_24px_rgba(24,24,27,0.14)] transition hover:-translate-y-0.5 hover:bg-zinc-800">
            <span className="sm:hidden">{t.nav.createStore.split(" ")[0]}</span><span className="hidden sm:inline">{t.nav.createStore}</span>
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </header>
  );
}

function MiniSidebar({ t }: { t: ReturnType<typeof useI18n>["t"] }) {
  const items = [t.landing.previewHome, t.landing.previewOrders, t.landing.previewProducts, t.landing.previewAppearance, t.landing.previewSettings];
  return (
    <aside className="hidden w-[145px] shrink-0 border-e border-zinc-100 bg-white/90 p-3 sm:block">
      <div className="mb-5 flex items-center gap-2 px-2">
        <span className="h-6 w-6 rounded-lg bg-zinc-950" />
        <span className="truncate text-[10px] font-bold text-zinc-800">Nexora Store</span>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={item} className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[9px] font-medium ${index === 0 ? "bg-violet-50 text-violet-700" : "text-zinc-500"}`}>
            <span className={`h-2.5 w-2.5 rounded-md ${index === 0 ? "bg-violet-500" : "bg-zinc-200"}`} />
            {item}
          </div>
        ))}
      </div>
    </aside>
  );
}

export function HeroSection() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-x-0 top-0 -z-0 h-[560px] bg-[radial-gradient(circle_at_68%_18%,rgba(139,92,246,0.12),transparent_34%),radial-gradient(circle_at_48%_12%,rgba(59,130,246,0.06),transparent_25%)]" />
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14 lg:px-8 lg:pb-20 lg:pt-24">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50/80 px-3.5 py-2 text-[11px] font-semibold text-violet-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            {t.landing.platformLabel}
          </div>
          <h1 className="mt-6 max-w-[640px] text-[42px] font-black leading-[1.04] tracking-[-0.055em] text-zinc-950 sm:text-6xl lg:text-[64px]">
            {t.landing.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-7 text-zinc-600 sm:text-[17px] sm:leading-8">
            {t.landing.heroDescription}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth?mode=signup" className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_32px_rgba(24,24,27,0.16)] transition hover:-translate-y-0.5 hover:bg-zinc-800">
              {t.nav.createStore}
              <ArrowIcon />
            </Link>
            <a href="#features" className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-bold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50">
              {t.landing.explore}
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[12px] font-medium text-zinc-500">
            {[t.landing.trustOne, t.landing.trustTwo, t.landing.trustThree].map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100 text-[9px] text-zinc-700">✓</span>{item}</span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[690px]">
          <div className="absolute -inset-8 -z-10 rounded-[4rem] bg-violet-200/25 blur-3xl" />
          <div className="overflow-hidden rounded-[28px] border border-zinc-200/90 bg-white shadow-[0_28px_80px_rgba(24,24,27,0.12)]">
            <div className="flex h-11 items-center justify-between border-b border-zinc-100 bg-white px-4 sm:px-5">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-zinc-300" /><span className="h-2 w-2 rounded-full bg-zinc-200" /><span className="h-2 w-2 rounded-full bg-zinc-100" /></div>
              <span className="text-[9px] font-semibold text-zinc-400">{t.landing.previewDashboard}</span>
              <span className="h-6 w-6 rounded-full bg-zinc-100" />
            </div>
            <div className="flex min-h-[390px] bg-zinc-50/70">
              <MiniSidebar t={t} />
              <div className="min-w-0 flex-1 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[9px] font-semibold text-zinc-400">{t.landing.previewWelcome}</p><h2 className="mt-1 text-sm font-bold tracking-tight text-zinc-900 sm:text-base">{t.landing.previewStore}</h2></div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-semibold text-emerald-700">{t.landing.storeStatus}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {[t.landing.previewProducts, t.landing.previewOrders, t.landing.previewThemes, t.landing.previewSupport].map((label, index) => (
                    <div key={label} className="rounded-xl border border-zinc-100 bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between"><span className="h-5 w-5 rounded-lg bg-zinc-100" /><span className="text-[8px] text-zinc-300">{index + 1}</span></div>
                      <p className="mt-3 text-[9px] font-semibold text-zinc-500">{label}</p>
                      <div className="mt-2 h-1.5 w-3/4 rounded-full bg-zinc-100" />
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1.5fr_0.9fr]">
                  <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between"><p className="text-[10px] font-bold text-zinc-800">{t.landing.previewSales}</p><span className="rounded-lg bg-zinc-50 px-2 py-1 text-[8px] text-zinc-400">{t.landing.previewPeriod}</span></div>
                    <div className="mt-5 flex h-28 items-end gap-2">
                      {[34, 48, 42, 62, 52, 76, 68, 84, 72, 90, 78, 86].map((height, index) => <span key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-violet-500/80 to-violet-300/50" style={{ height: `${height}%` }} />)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-bold text-zinc-800">{t.landing.previewStorefront}</p>
                    <div className="mt-4 rounded-xl bg-[#f4efe8] p-3">
                      <div className="h-2 w-16 rounded-full bg-zinc-900/15" />
                      <div className="mt-3 h-16 rounded-lg bg-gradient-to-br from-[#d9c8b2] via-[#eee5d9] to-white" />
                      <div className="mt-3 h-2.5 w-20 rounded-full bg-zinc-900/15" />
                      <div className="mt-2 h-2 w-12 rounded-full bg-zinc-900/10" />
                    </div>
                    <div className="mt-3 flex gap-2"><span className="h-5 flex-1 rounded-md bg-zinc-100" /><span className="h-5 w-12 rounded-md bg-zinc-900" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="grid gap-2 rounded-[22px] border border-zinc-200 bg-white p-2 shadow-[0_12px_40px_rgba(24,24,27,0.05)] sm:grid-cols-3 lg:grid-cols-6">
          {[t.landing.stripProducts, t.landing.stripOrders, t.landing.stripCheckout, t.landing.stripStorefront, t.landing.stripThemes, t.landing.stripSupport].map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[12px] font-semibold text-zinc-700"><span className={`h-7 w-7 rounded-xl ${index % 2 === 0 ? "bg-violet-50" : "bg-zinc-100"}`} /><span>{item}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}
