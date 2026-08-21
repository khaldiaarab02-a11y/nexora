"use client";
import { useI18n } from "@/i18n/LanguageProvider";

export default function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    [t.landing.step1, t.landing.step1Description],
    [t.landing.step2, t.landing.step2Description],
    [t.landing.step3, t.landing.step3Description],
  ];
  return (
    <section id="how" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <p className="landing-kicker">{t.landing.howLabel}</p>
          <h2 className="landing-heading mt-3">{t.landing.howTitle}</h2>
        </div>
        <div className="relative mt-14 grid gap-5 md:grid-cols-3">
          <div className="absolute inset-x-[16%] top-9 hidden h-px bg-zinc-200 md:block" />
          {steps.map(([title, description], index) => (
            <article key={title} className="relative rounded-3xl border border-zinc-200 bg-white p-7 text-center shadow-[0_10px_35px_rgba(24,24,27,0.04)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-black text-zinc-950 shadow-sm">0{index + 1}</div>
              <h3 className="mt-6 text-lg font-bold tracking-tight text-zinc-950">{title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-500">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
