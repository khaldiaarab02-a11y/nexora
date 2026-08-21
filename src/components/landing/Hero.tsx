"use client";

import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/i18n/LanguageProvider";

function LogoMark() {
  return (
    <span className="landing-logo-mark" aria-hidden="true">
      <span className="landing-logo-dot" />
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Hero() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Nexora">
          <LogoMark />
          <span className="text-[20px] font-extrabold tracking-[-0.05em]">Nexora</span>
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] font-medium text-zinc-500 lg:flex">
          <a href="#about" className="transition hover:text-zinc-950">{t.nav.about}</a>
          <a href="#features" className="transition hover:text-zinc-950">{t.nav.features}</a>
          <a href="#how" className="transition hover:text-zinc-950">{t.landing.howNav}</a>
          <a href="#plans" className="transition hover:text-zinc-950">{t.nav.plans}</a>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <Link href="/auth" className="hidden rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-zinc-700 transition hover:bg-zinc-100 sm:inline-flex">
            {t.nav.login}
          </Link>
          <Link href="/auth?mode=signup" className="group inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3 py-2.5 text-[12px] font-semibold text-white shadow-[0_8px_24px_rgba(24,24,27,0.14)] transition hover:-translate-y-0.5 hover:bg-zinc-800 sm:gap-2 sm:px-4 sm:text-[13px]">
            <span className="sm:hidden">{t.nav.createStore.split(" ")[0]}</span>
            <span className="hidden sm:inline">{t.nav.createStore}</span>
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function HeroSection() {
  const { t } = useI18n();
  const capabilities = [
    [t.landing.featureProducts, t.landing.featureProductsDescription],
    [t.landing.featureOrders, t.landing.featureOrdersDescription],
    [t.landing.featureThemes, t.landing.featureThemesDescription],
    [t.landing.featureAnalytics, t.landing.featureAnalyticsDescription],
  ];

  return (
    <section className="relative overflow-hidden bg-[#fbfaff]">
      <div className="landing-glow landing-glow-hero" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
          <div className="relative z-10 max-w-xl">
            <span className="landing-eyebrow">{t.landing.platformLabel}</span>
            <h1 className="mt-6 text-[48px] font-black leading-[0.96] tracking-[-0.065em] text-zinc-950 sm:text-[64px] lg:text-[78px]">
              {t.landing.heroTitle}
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-7 text-zinc-600 sm:text-[17px] sm:leading-8">
              {t.landing.heroDescription}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth?mode=signup" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 text-sm font-bold text-white shadow-[0_16px_36px_rgba(24,24,27,0.16)] transition hover:-translate-y-0.5 hover:bg-zinc-800">
                {t.nav.createStore}
                <ArrowIcon />
              </Link>
              <a href="#features" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 text-sm font-bold text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50">
                {t.landing.explore}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-zinc-500">
              {[t.landing.trustOne, t.landing.trustTwo, t.landing.trustThree].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-violet-100 bg-violet-50 text-[9px] font-bold text-violet-600">✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="landing-image-frame landing-hero-frame">
              <Image
                src="/assets/landing/nexora-hero.png"
                alt={t.landing.previewDashboard}
                width={1536}
                height={1024}
                priority
                sizes="(max-width: 1023px) 100vw, 62vw"
                className="h-auto w-full"
              />
            </div>
            <div className="landing-float-card landing-float-card-a hidden sm:block">
              <span className="text-[10px] font-semibold text-zinc-400">{t.landing.previewSales}</span>
              <strong className="mt-1 block text-lg tracking-tight text-zinc-950">{t.landing.storeStatus}</strong>
              <span className="mt-2 block h-1.5 w-20 rounded-full bg-violet-100"><span className="block h-full w-3/4 rounded-full bg-violet-500" /></span>
            </div>
            <div className="landing-float-card landing-float-card-b hidden md:block">
              <span className="text-[10px] font-semibold text-zinc-400">{t.landing.previewStorefront}</span>
              <div className="mt-2 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-xs font-semibold text-zinc-800">{t.landing.previewStore}</span></div>
            </div>
          </div>
        </div>

        <div className="landing-capability-strip mt-10 grid sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(([title, description], index) => (
            <div key={title} className="landing-capability-item">
              <span className="landing-capability-number">0{index + 1}</span>
              <div>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
