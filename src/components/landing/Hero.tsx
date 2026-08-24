"use client";

import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Logo from "@/components/shared/Logo";
import { useI18n } from "@/i18n/LanguageProvider";

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h9M8 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Hero() {
  const { t } = useI18n();

  return (
    <header
      className="
        sticky top-0 z-50
        border-b
        border-zinc-200/70
        bg-white/90
        backdrop-blur-xl
        dark:border-zinc-800/80
        dark:bg-[#09090b]/95
      "
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Nexora"
        >
          <Logo variant="compact" height={26} priority />
        </Link>

        <nav
          className="
            hidden items-center gap-7
            text-[13px] font-medium
            text-zinc-500
            lg:flex
            dark:text-zinc-400
          "
        >
          <a
            href="#about"
            className="transition hover:text-zinc-950 dark:hover:text-white"
          >
            {t.nav.about}
          </a>

          <a
            href="#features"
            className="transition hover:text-zinc-950 dark:hover:text-white"
          >
            {t.nav.features}
          </a>

          <a
            href="#how"
            className="transition hover:text-zinc-950 dark:hover:text-white"
          >
            {t.landing.howNav}
          </a>

          <a
            href="#plans"
            className="transition hover:text-zinc-950 dark:hover:text-white"
          >
            {t.nav.plans}
          </a>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          <LanguageSwitcher />

          <Link
            href="/auth"
            className="
              hidden rounded-xl
              px-3 py-2.5
              text-[13px] font-semibold
              text-zinc-700
              transition
              hover:bg-zinc-100
              sm:inline-flex
              dark:text-zinc-300
              dark:hover:bg-zinc-800
              dark:hover:text-white
            "
          >
            {t.nav.login}
          </Link>

          <Link
            href="/auth?mode=signup"
            className="
              group inline-flex items-center gap-1.5
              rounded-xl
              bg-zinc-950
              px-3 py-2.5
              text-[12px] font-semibold
              text-white
              shadow-[0_8px_24px_rgba(24,24,27,0.14)]
              transition
              hover:-translate-y-0.5
              hover:bg-zinc-800
              sm:gap-2 sm:px-4 sm:text-[13px]
              dark:bg-white
              dark:text-zinc-950
              dark:hover:bg-zinc-200
            "
          >
            <span className="sm:hidden">
              {t.nav.createStore.split(" ")[0]}
            </span>

            <span className="hidden sm:inline">
              {t.nav.createStore}
            </span>

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
    <section className="relative overflow-hidden bg-[#fbfaff] dark:bg-[#09090b]">
      <div
        className="landing-glow landing-glow-hero"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
        <div
          className="
            landing-hero-visual
            relative overflow-hidden
            rounded-[30px]
            border border-violet-100/80
            bg-white
            shadow-[0_35px_100px_rgba(76,29,149,0.10)]
            sm:rounded-[38px]
            dark:border-zinc-800
            dark:bg-zinc-950
          "
        >
          <Image
            src="/assets/landing/nexora-hero.png"
            alt={t.landing.previewDashboard}
            width={1536}
            height={1024}
            priority
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover object-[72%_center]"
          />

          {/* Light/Dark readability overlay */}
          <div
            className="
              absolute inset-0
              bg-gradient-to-r
              from-white
              via-white/95
              to-white/5
              sm:via-white/90
              dark:from-zinc-950/95
              dark:via-zinc-950/70
              dark:to-transparent
              dark:sm:via-zinc-950/65
            "
            aria-hidden="true"
          />

          <div className="relative z-10 flex min-h-[560px] items-center px-6 py-14 sm:min-h-[600px] sm:px-10 lg:min-h-[650px] lg:px-14">
            <div className="max-w-[500px]">
              <span className="landing-eyebrow">
                {t.landing.platformLabel}
              </span>

              <h1
                className="
                  mt-6
                  text-[43px]
                  font-black
                  leading-[0.98]
                  tracking-[-0.06em]
                  text-zinc-950
                  dark:text-white
                  sm:text-[58px]
                  lg:text-[72px]
                "
              >
                {t.landing.heroTitle}
              </h1>

              <p
                className="
                  mt-6
                  max-w-lg
                  text-[15px]
                  leading-7
                  text-zinc-600
                  dark:text-zinc-200
                  sm:text-[17px]
                  sm:leading-8
                "
              >
                {t.landing.heroDescription}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth?mode=signup"
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-zinc-950
                    px-6
                    text-sm
                    font-bold
                    text-white
                    shadow-[0_16px_36px_rgba(24,24,27,0.16)]
                    transition
                    hover:-translate-y-0.5
                    hover:bg-zinc-800
                    dark:bg-white
                    dark:text-zinc-950
                    dark:hover:bg-zinc-200
                  "
                >
                  {t.nav.createStore}
                  <ArrowIcon />
                </Link>

                <a
                  href="#features"
                  className="
                    inline-flex
                    min-h-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-zinc-200
                    bg-white/90
                    px-6
                    text-sm
                    font-bold
                    text-zinc-800
                    transition
                    hover:border-zinc-300
                    hover:bg-white
                    dark:border-zinc-700
                    dark:bg-zinc-900/80
                    dark:text-white
                    dark:hover:border-zinc-600
                    dark:hover:bg-zinc-800
                  "
                >
                  {t.landing.explore}
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-zinc-500 dark:text-zinc-300">
                {[
                  t.landing.trustOne,
                  t.landing.trustTwo,
                  t.landing.trustThree,
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2"
                  >
                    <span
                      className="
                        flex
                        h-4
                        w-4
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-violet-100
                        bg-violet-50
                        text-[9px]
                        font-bold
                        text-violet-600
                        dark:border-violet-400/30
                        dark:bg-violet-400/10
                        dark:text-violet-300
                      "
                    >
                      ✓
                    </span>

                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="landing-capability-strip mt-8 grid sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(([title, description], index) => (
            <div
              key={title}
              className="landing-capability-item"
            >
              <span className="landing-capability-number">
                0{index + 1}
              </span>

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
