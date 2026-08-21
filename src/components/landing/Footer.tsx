"use client";
import Link from "next/link";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/i18n/LanguageProvider";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white"><span className="h-2.5 w-2.5 rounded-sm bg-white" /></span><span className="font-extrabold tracking-tight">Nexora</span></div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500">
            <a href="#about" className="hover:text-zinc-950">{t.nav.about}</a>
            <a href="#features" className="hover:text-zinc-950">{t.nav.features}</a>
            <a href="#plans" className="hover:text-zinc-950">{t.nav.plans}</a>
            <a href="#how" className="hover:text-zinc-950">{t.landing.howNav}</a>
            <Link href="/auth" className="hover:text-zinc-950">{t.nav.login}</Link>
            <LanguageSwitcher />
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-zinc-100 pt-6 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Nexora</span>
          <span>{t.landing.footerText}</span>
        </div>
      </div>
    </footer>
  );
}
