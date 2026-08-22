"use client";
import Image from "next/image";
import { useI18n } from "@/i18n/LanguageProvider";

export default function MediaSection() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="overflow-hidden rounded-[30px] border border-zinc-200 bg-[#f7f4f0] p-6 sm:p-10 lg:p-12">
        <div className="grid items-center gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="max-w-xl">
            <p className="landing-kicker">{t.landing.previewsLabel}</p>
            <h2 className="landing-heading mt-3">{t.landing.mediaTitle}</h2>
            <p className="mt-5 text-[15px] leading-7 text-zinc-600">{t.landing.mediaDescription}</p>
          </div>
          <div className="relative mx-auto w-full max-w-[640px]">
            <div className="landing-image-frame overflow-hidden rounded-[24px] border border-zinc-300/70 bg-white shadow-[0_24px_60px_rgba(24,24,27,0.14)]">
              <Image
                src="/assets/landing/nexora-storefront.png"
                alt={t.landing.storefrontAlt}
                width={1280}
                height={900}
                sizes="(max-width: 1023px) 100vw, 52vw"
                loading="lazy"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
