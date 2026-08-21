"use client";
import { useI18n } from "@/i18n/LanguageProvider";

export default function Features() {
  const { t } = useI18n();
  const items = [
    [t.landing.featureProducts, t.landing.featureProductsDescription],
    [t.landing.featureOrders, t.landing.featureOrdersDescription],
    [t.landing.featureThemes, t.landing.featureThemesDescription],
    [t.landing.featureAnalytics, t.landing.featureAnalyticsDescription],
    [t.landing.featureSubscriptions, t.landing.featureSubscriptionsDescription],
    [t.landing.featureSupport, t.landing.featureSupportDescription],
  ];
  return (
    <section id="features" className="bg-zinc-50/80">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="landing-kicker">{t.landing.featuresLabel}</p>
          <h2 className="landing-heading mt-3">{t.landing.featuresTitle}</h2>
          <p className="mt-5 text-[15px] leading-7 text-zinc-600 sm:text-base sm:leading-8">{t.landing.featuresDescription}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([title, description], index) => (
            <article key={title} className="landing-card min-h-[190px]">
              <div className="flex items-center justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${index === 2 || index === 4 ? "bg-violet-50" : "bg-white"} border border-zinc-100`}><span className="h-3.5 w-3.5 rounded-[5px] bg-zinc-900" /></span>
                <span className="text-[11px] font-bold text-zinc-300">0{index + 1}</span>
              </div>
              <h3 className="mt-8 text-[16px] font-bold tracking-tight text-zinc-950">{title}</h3>
              <p className="mt-2.5 text-sm leading-6 text-zinc-500">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
