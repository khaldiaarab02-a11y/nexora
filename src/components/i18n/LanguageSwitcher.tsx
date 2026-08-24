"use client";

import Image from "next/image";
import { useI18n } from "@/i18n/LanguageProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label={t.common.language}
        title={t.common.language}
        className="
          group relative flex h-9 w-9 items-center justify-center
          rounded-xl border border-zinc-200/80 bg-white
          shadow-[0_4px_14px_rgba(24,24,27,0.08)]
          transition-all duration-200
          hover:-translate-y-0.5
          hover:border-violet-300
          hover:shadow-[0_8px_24px_rgba(124,58,237,0.18)]
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-violet-500
          dark:border-[var(--nx-border)]
          dark:bg-[var(--nx-surface)]
        "
      >
        <Image
          src="/assets/landing/nexora-globe-3d.png"
          alt=""
          width={30}
          height={30}
          priority
          className="h-[30px] w-[30px] object-contain drop-shadow-[0_3px_5px_rgba(124,58,237,0.25)]"
        />

        <select
          aria-label={t.common.language}
          value={language}
          onChange={(e) =>
            setLanguage(e.target.value as typeof language)
          }
          className="
            absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0
          "
        >
          <option value="ar">العربية</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </button>
    </div>
  );
}
