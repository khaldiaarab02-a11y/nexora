"use client";

import Image from "next/image";
import { useI18n } from "@/i18n/LanguageProvider";

export default function Features() {
  const { t } = useI18n();

  const items = [
    {
      title: t.landing.featureProducts,
      description: t.landing.featureProductsDescription,
      icon: "/assets/landing/features/shopping-bag.png",
    },
    {
      title: t.landing.featureOrders,
      description: t.landing.featureOrdersDescription,
      icon: "/assets/landing/features/cart.png",
    },
    {
      title: t.landing.featureThemes,
      description: t.landing.featureThemesDescription,
      icon: "/assets/landing/features/settings.png",
    },
    {
      title: t.landing.featureAnalytics,
      description: t.landing.featureAnalyticsDescription,
      icon: "/assets/landing/features/growth.png",
    },
    {
      title: t.landing.featureSubscriptions,
      description: t.landing.featureSubscriptionsDescription,
      icon: "/assets/landing/features/star.png",
    },
    {
      title: t.landing.featureSupport,
      description: t.landing.featureSupportDescription,
      icon: "/assets/landing/features/support-chat.png",
    },
  ];

  return (
    <section
      id="features"
      className="bg-[#fafafa] dark:bg-[var(--nx-bg)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">

        <div className="max-w-3xl">
          <p className="landing-kicker">
            {t.landing.featuresLabel}
          </p>

          <h2 className="landing-heading mt-3 text-[40px] sm:text-[50px] lg:text-[60px]">
            {t.landing.featuresTitle}
          </h2>

          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base sm:leading-8">
            {t.landing.featuresDescription}
          </p>
        </div>

        <div className="landing-feature-grid mt-14 grid sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={item.title}
              className="landing-feature-item"
            >
              <div className="flex items-center justify-between">

                <div className="flex h-14 w-14 items-center justify-center">
                  <Image
                    src={item.icon}
                    alt=""
                    width={64}
                    height={64}
                    className="
                      h-14
                      w-14
                      object-contain
                      drop-shadow-[0_8px_14px_rgba(124,58,237,0.22)]
                      transition-transform
                      duration-300
                      hover:-translate-y-1
                      hover:scale-110
                    "
                  />
                </div>

                <span className="text-[10px] font-bold tracking-[0.18em] text-zinc-300 dark:text-zinc-700">
                  0{index + 1}
                </span>
              </div>

              <h3 className="mt-7 text-[16px] font-bold tracking-tight text-zinc-950 dark:text-white">
                {item.title}
              </h3>

              <p className="mt-2.5 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {item.description}
              </p>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
