"use client";
import Link from "next/link";
import { type PlanId } from "@/config/plans";
import { PLAN_PRICING } from "@/config/pricing";
import { useI18n } from "@/i18n/LanguageProvider";

export default function PlansPreview() {
  const { t } = useI18n();
  return (
    <section id="plans" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="landing-kicker">{t.landing.plansLabel}</p>
          <h2 className="landing-heading mt-3">{t.landing.plansTitle}</h2>
          <p className="mt-4 text-[15px] leading-7 text-zinc-600">{t.landing.plansDescription}</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          {(["starter", "business"] as PlanId[]).map((plan) => {
            const pricing = PLAN_PRICING[plan];
            const business = plan === "business";
            return (
              <article key={plan} className={`relative rounded-[28px] border p-7 sm:p-8 ${business ? "border-zinc-900 bg-zinc-950 text-white shadow-[0_24px_55px_rgba(24,24,27,0.14)]" : "border-zinc-200 bg-white"}`}>
                {business && <span className="absolute end-6 top-6 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-white">{t.landing.recommended}</span>}
                <p className={`text-xs font-bold uppercase tracking-[0.18em] ${business ? "text-zinc-400" : "text-zinc-400"}`}>{plan === "starter" ? t.plans.starter : t.plans.business}</p>
                <h3 className="mt-4 text-2xl font-black tracking-tight">{plan === "starter" ? t.landing.starterTitle : t.landing.businessTitle}</h3>
                <p className={`mt-3 text-sm leading-6 ${business ? "text-zinc-300" : "text-zinc-500"}`}>{plan === "starter" ? t.landing.starterDescription : t.landing.businessDescription}</p>
                <p className="mt-7 text-sm font-semibold">{pricing.amount === null ? t.landing.priceConfigured : `${pricing.amount.toLocaleString()} ${pricing.currency}`}</p>
                <Link href="/auth?mode=signup" className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold ${business ? "bg-white text-zinc-950 hover:bg-zinc-100" : "bg-zinc-950 text-white hover:bg-zinc-800"}`}>{t.landing.choosePlan}</Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
