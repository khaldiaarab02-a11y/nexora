"use client";
import Image from "next/image";
import { useI18n } from "@/i18n/LanguageProvider";

export default function ProductsSection() {
  const { t } = useI18n();
  return (
    <section className="bg-zinc-50/80">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="landing-image-frame order-2 overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-[0_20px_50px_rgba(24,24,27,0.08)] lg:order-1">
            <Image
              src="/assets/landing/nexora-products.png"
              alt={t.landing.productsAlt}
              width={1280}
              height={900}
              sizes="(max-width: 1023px) 100vw, 48vw"
              loading="lazy"
              className="h-auto w-full"
            />
          </div>
          <div className="order-1 max-w-xl lg:order-2">
            <p className="landing-kicker">{t.landing.productsLabel}</p>
            <h2 className="landing-heading mt-3">{t.landing.productsTitle}</h2>
            <p className="mt-5 text-[15px] leading-7 text-zinc-600 sm:text-base sm:leading-8">{t.landing.productsDescription}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
