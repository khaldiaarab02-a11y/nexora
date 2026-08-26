"use client";

import Link from "next/link";
import { type PlanId } from "@/config/plans";
import { PLAN_PRICING } from "@/config/pricing";
import { useI18n } from "@/i18n/LanguageProvider";

export default function PlansPreview() {
  const { t } = useI18n();

  return (
    <section
      id="plans"
      className="bg-[#fafafa] dark:bg-[var(--nx-bg)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="landing-kicker">
            {t.landing.plansLabel}
          </p>

          <h2 className="landing-heading mt-3">
            {t.landing.plansTitle}
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-zinc-600 dark:text-zinc-400">
            {t.landing.plansDescription}
          </p>
        </div>

        {/* Plans */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">

          {(["starter", "business"] as PlanId[]).map((plan) => {
            const pricing = PLAN_PRICING[plan];
            const business = plan === "business";

            return (
              <article
                key={plan}
                className={`
                  relative overflow-hidden rounded-[30px] border p-7
                  transition-all duration-300
                  sm:p-8
                  ${
                    business
                      ? `
                        border-zinc-900
                        bg-zinc-950
                        text-white
                        shadow-[0_28px_70px_rgba(24,24,27,0.18)]
                        hover:-translate-y-1
                        hover:shadow-[0_35px_85px_rgba(124,58,237,0.18)]
                      `
                      : `
                        border-zinc-200
                        bg-white
                        text-zinc-950
                        shadow-[0_18px_50px_rgba(24,24,27,0.06)]
                        hover:-translate-y-1
                        hover:border-violet-200
                        hover:shadow-[0_25px_65px_rgba(124,58,237,0.10)]
                        dark:border-[var(--nx-border)]
                        dark:bg-[var(--nx-surface)]
                        dark:text-[var(--nx-fg)]
                      `
                  }
                `}
              >

                {/* Violet glow for Business */}
                {business && (
                  <div
                    className="
                      pointer-events-none
                      absolute -end-24 -top-24
                      h-48 w-48
                      rounded-full
                      bg-violet-500/20
                      blur-3xl
                    "
                    aria-hidden="true"
                  />
                )}

                {/* Recommended */}
                {business && (
                  <span
                    className="
                      absolute end-6 top-6
                      rounded-full
                      border border-violet-300/20
                      bg-violet-500/15
                      px-3 py-1
                      text-[10px]
                      font-bold
                      text-violet-200
                      backdrop-blur-sm
                    "
                  >
                    {t.landing.recommended}
                  </span>
                )}

                {/* Plan name */}
                <p
                  className={`
                    relative
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    ${
                      business
                        ? "text-zinc-400"
                        : "text-zinc-400 dark:text-zinc-500"
                    }
                  `}
                >
                  {plan === "starter"
                    ? t.plans.starter
                    : t.plans.business}
                </p>

                {/* Title */}
                <h3
                  className={`
                    relative
                    mt-4
                    text-2xl
                    font-black
                    tracking-tight
                    ${
                      business
                        ? "text-white"
                        : "text-zinc-950 dark:text-[var(--nx-fg)]"
                    }
                  `}
                >
                  {plan === "starter"
                    ? t.landing.starterTitle
                    : t.landing.businessTitle}
                </h3>

                {/* Description */}
                <p
                  className={`
                    relative
                    mt-3
                    text-sm
                    leading-6
                    ${
                      business
                        ? "text-zinc-300"
                        : "text-zinc-500 dark:text-zinc-400"
                    }
                  `}
                >
                  {plan === "starter"
                    ? t.landing.starterDescription
                    : t.landing.businessDescription}
                </p>

                {/* Price */}
                <div className="relative mt-8">
                  <p
                    className={`
                      text-3xl
                      font-black
                      tracking-tight
                      ${
                        business
                          ? "text-white"
                          : "text-zinc-950 dark:text-[var(--nx-fg)]"
                      }
                    `}
                  >
                    {pricing.amount === null
                      ? t.landing.priceConfigured
                      : `${pricing.amount.toLocaleString()} ${pricing.currency}`}
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href="/auth?mode=signup"
                  className={`
                    relative
                    mt-7
                    inline-flex
                    min-h-12
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    px-5
                    text-sm
                    font-bold
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    ${
                      business
                        ? `
                          bg-white
                          text-zinc-950
                          shadow-[0_10px_25px_rgba(0,0,0,0.18)]
                          hover:bg-violet-50
                        `
                        : `
                          bg-zinc-950
                          text-white
                          shadow-[0_10px_25px_rgba(24,24,27,0.12)]
                          hover:bg-zinc-800
                        `
                    }
                  `}
                >
                  {t.landing.choosePlan}
                </Link>

              </article>
            );
          })}

        </div>
      </div>
    </section>
  );
}
