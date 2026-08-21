"use client";
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
            <div className="rounded-[24px] border border-zinc-300/70 bg-zinc-950 p-2 shadow-[0_24px_60px_rgba(24,24,27,0.18)]">
              <div className="overflow-hidden rounded-[18px] bg-white">
                <div className="flex h-9 items-center justify-between border-b border-zinc-100 px-4"><span className="h-2 w-20 rounded-full bg-zinc-200" /><span className="h-5 w-5 rounded-full bg-zinc-100" /></div>
                <div className="grid min-h-[230px] grid-cols-2 gap-4 p-5 sm:grid-cols-[1.1fr_.9fr]">
                  <div className="flex flex-col justify-center">
                    <span className="h-2 w-20 rounded-full bg-zinc-200" />
                    <span className="mt-4 h-6 w-40 max-w-full rounded-lg bg-zinc-900/85" />
                    <span className="mt-2 h-2.5 w-28 rounded-full bg-zinc-200" />
                    <div className="mt-6 flex gap-2"><span className="h-8 w-24 rounded-lg bg-zinc-900" /><span className="h-8 w-20 rounded-lg border border-zinc-200" /></div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-[#d8c8b6] via-[#ede4d9] to-white p-4"><div className="h-full rounded-xl border border-white/70 bg-white/20" /></div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -start-3 hidden w-32 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl sm:block"><div className="h-2 w-12 rounded-full bg-zinc-200" /><div className="mt-3 h-16 rounded-xl bg-zinc-100" /><div className="mt-2 h-2 w-16 rounded-full bg-zinc-200" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
