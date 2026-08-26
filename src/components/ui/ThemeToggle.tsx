"use client";

import Image from "next/image";
import { useTheme } from "@/theme/ThemeProvider";
import { useI18n } from "@/i18n/LanguageProvider";

export default function ThemeToggle() {
  const { resolvedTheme, setMode } = useTheme();
  const { t } = useI18n();

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setMode(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t.common.themeLight : t.common.themeDark}
      title={isDark ? t.common.themeLight : t.common.themeDark}
      className="
        group
        relative
        flex
        h-9
        w-9
        items-center
        justify-center
        overflow-hidden
        rounded-xl
        border
        border-zinc-200/80
        bg-white
        shadow-[0_4px_14px_rgba(24,24,27,0.08)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-violet-300
        hover:shadow-[0_8px_24px_rgba(124,58,237,0.18)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-violet-500
        dark:border-[var(--nx-border)]
        dark:bg-[var(--nx-surface)]
      "
    >
      <Image
        src={
          isDark
            ? "/assets/landing/features/sun.png"
            : "/assets/landing/features/moon.png"
        }
        alt=""
        width={30}
        height={30}
        priority
        className="
          h-[30px]
          w-[30px]
          object-contain
          drop-shadow-[0_3px_6px_rgba(124,58,237,0.25)]
          transition-transform
          duration-300
          group-hover:scale-110
        "
      />
    </button>
  );
}
