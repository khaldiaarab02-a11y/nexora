"use client";
import Link from "next/link";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Logo from "@/components/shared/Logo";
import { useI18n } from "@/i18n/LanguageProvider";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-[var(--nx-border)] dark:bg-[var(--nx-bg)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
          <Logo variant="compact" height={24} />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500">
            <a href="#about" className="hover:text-zinc-950">{t.nav.about}</a>
            <a href="#features" className="hover:text-zinc-950">{t.nav.features}</a>
            <a href="#plans" className="hover:text-zinc-950">{t.nav.plans}</a>
            <a href="#how" className="hover:text-zinc-950">{t.landing.howNav}</a>
            <Link href="/auth" className="hover:text-zinc-950">{t.nav.login}</Link>
            <ThemeToggle />
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
