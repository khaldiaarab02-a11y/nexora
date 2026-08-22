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
    <section id="features" className="bg-[#fafafa]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-3xl">
          <p className="landing-kicker">{t.landing.featuresLabel}</p>
          <h2 className="landing-heading mt-3 text-[40px] sm:text-[50px] lg:text-[60px]">{t.landing.featuresTitle}</h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-zinc-600 sm:text-base sm:leading-8">{t.landing.featuresDescription}</p>
        </div>
        <div className="landing-feature-grid mt-14 grid sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([title, description], index) => (
            <article key={title} className="landing-feature-item">
              <div className="flex items-center justify-between">
                <span className="landing-feature-icon"><span /></span>
                <span className="text-[10px] font-bold tracking-[0.18em] text-zinc-300">0{index + 1}</span>
              </div>
              <h3 className="mt-7 text-[16px] font-bold tracking-tight text-zinc-950">{title}</h3>
              <p className="mt-2.5 max-w-sm text-sm leading-6 text-zinc-500">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
