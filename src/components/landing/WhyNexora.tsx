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
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <p className="landing-kicker">{t.landing.whyLabel}</p>
          <h2 className="landing-heading mt-3">{t.landing.whyTitle}</h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-zinc-600 sm:text-base sm:leading-8">{t.landing.whyDescription}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([title, description], index) => (
            <article key={title} className="landing-card group">
              <span className={`mb-7 flex h-11 w-11 items-center justify-center rounded-2xl ${index % 2 === 0 ? "bg-violet-50 text-violet-600" : "bg-zinc-100 text-zinc-800"}`}>
                <span className="h-3 w-3 rounded-full bg-current" />
              </span>
              <h3 className="text-[16px] font-bold tracking-tight text-zinc-950">{title}</h3>
              <p className="mt-2.5 text-sm leading-6 text-zinc-500">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
