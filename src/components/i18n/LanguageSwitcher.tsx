"use client";
import { useI18n } from "@/i18n/LanguageProvider";
export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-700">
      <span aria-hidden="true">🌐</span>
      <select
        aria-label={t.common.language}
        value={language}
        onChange={(e) => setLanguage(e.target.value as typeof language)}
        className="bg-transparent text-sm text-zinc-700 focus:outline-none"
      >
        <option value="ar">AR</option>
        <option value="en">EN</option>
        <option value="fr">FR</option>
      </select>
    </span>
  );
}
