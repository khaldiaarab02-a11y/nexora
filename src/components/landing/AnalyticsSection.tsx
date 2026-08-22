"use client";
import Image from "next/image";
import { useI18n } from "@/i18n/LanguageProvider";

export default function AnalyticsSection() {
  const { t } = useI18n();
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="max-w-xl">
            <p className="landing-kicker">{t.landing.analyticsLabel}</p>
            <h2 className="landing-heading mt-3">{t.landing.analyticsTitle}</h2>
            <p className="mt-5 text-[15px] leading-7 text-zinc-600 sm:text-base sm:leading-8">{t.landing.analyticsDescription}</p>
          </div>
          <div className="landing-image-frame landing-analytics-frame overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_20px_50px_rgba(24,24,27,0.08)]">
            <Image
              src="/assets/landing/nexora-analytics.png"
              alt={t.landing.analyticsAlt}
              width={1280}
              height={900}
              sizes="(max-width: 1023px) 100vw, 52vw"
              loading="lazy"
              className="h-full w-full object-cover object-[78%_center]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
