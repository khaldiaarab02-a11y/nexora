"use client";
import { useI18n } from "@/i18n/LanguageProvider";
export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  return <select aria-label="Language" value={language} onChange={(e) => setLanguage(e.target.value as typeof language)} className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-700"><option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option></select>;
}
