"use client";
import { useI18n } from "@/i18n/LanguageProvider";

export default function WhyNexora() {
  const { t } = useI18n();
  const cards = [
    [t.landing.whyCardOneTitle, t.landing.whyCardOneDescription],
    [t.landing.whyCardTwoTitle, t.landing.whyCardTwoDescription],
    [t.landing.whyCardThreeTitle, t.landing.whyCardThreeDescription],
    [t.landing.whyCardFourTitle, t.landing.whyCardFourDescription],
  ];
  return (
    <section id="about" className="border-y border-zinc-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="landing-kicker">{t.landing.whyLabel}</p>
            <h2 className="landing-heading mt-3 text-[40px] sm:text-[48px] lg:text-[56px]">{t.landing.whyTitle}</h2>
          </div>
          <div>
            <p className="max-w-2xl text-[15px] leading-7 text-zinc-600 sm:text-base sm:leading-8">{t.landing.whyDescription}</p>
            <div className="mt-10 grid sm:grid-cols-2">
              {cards.map(([title, description], index) => (
                <article key={title} className="landing-editorial-item">
                  <div className="flex items-center gap-3">
                    <span className="landing-editorial-number">0{index + 1}</span>
                    <span className="h-px flex-1 bg-zinc-200" />
                  </div>
                  <h3 className="mt-5 text-[16px] font-bold tracking-tight text-zinc-950">{title}</h3>
                  <p className="mt-2.5 text-sm leading-6 text-zinc-500">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
