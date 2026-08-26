"use client";

import Image from "next/image";
import { useI18n } from "@/i18n/LanguageProvider";

export default function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      title: t.landing.step1,
      description: t.landing.step1Description,
      image: "/assets/landing/how-it-works/store.png",
    },
    {
      title: t.landing.step2,
      description: t.landing.step2Description,
      image: "/assets/landing/how-it-works/products.png",
    },
    {
      title: t.landing.step3,
      description: t.landing.step3Description,
      image: "/assets/landing/how-it-works/rocket.png",
    },
  ];

  return (
    <section id="how" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">

        <div className="text-center">
          <p className="landing-kicker">
            {t.landing.howLabel}
          </p>

          <h2 className="landing-heading mt-3">
            {t.landing.howTitle}
          </h2>
        </div>

        <div className="relative mt-14 grid gap-5 md:grid-cols-3">

          {/* Connecting line */}
          <div className="absolute inset-x-[16%] top-24 hidden h-px bg-zinc-200 md:block" />

          {steps.map((step, index) => (
            <article
              key={step.title}
              className="
                relative
                rounded-3xl
                border border-zinc-200
                bg-white
                p-7
                text-center
                shadow-[0_10px_35px_rgba(24,24,27,0.04)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_18px_45px_rgba(124,58,237,0.10)]
              "
            >

              {/* 3D Icon */}
              <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_25px_rgba(124,58,237,0.10)]">

                <Image
                  src={step.image}
                  alt=""
                  width={76}
                  height={76}
                  priority
                  className="
                    h-[76px]
                    w-[76px]
                    object-contain
                    drop-shadow-[0_8px_12px_rgba(124,58,237,0.25)]
                  "
                />

              </div>

              {/* Number */}
              <div className="mt-5 text-[10px] font-bold tracking-[0.18em] text-zinc-300">
                0{index + 1}
              </div>

              <h3 className="mt-3 text-lg font-bold tracking-tight text-zinc-950">
                {step.title}
              </h3>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-500">
                {step.description}
              </p>

            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
