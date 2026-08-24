"use client";
import { useTheme } from "@/theme/ThemeProvider";
import type { ThemeMode } from "@/theme/config";
import { useI18n } from "@/i18n/LanguageProvider";

const OPTIONS: { mode: ThemeMode; icon: string }[] = [
  { mode: "light", icon: "☀" },
  { mode: "dark", icon: "🌙" },
  { mode: "system", icon: "🖥" },
];

/** Compact segmented Light / Dark / System control. Mirrors the visual
 * language of LanguageSwitcher so the two live comfortably side by side
 * without competing for attention. */
export default function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const { t } = useI18n();
  const labels: Record<ThemeMode, string> = {
    light: t.common.themeLight,
    dark: t.common.themeDark,
    system: t.common.themeSystem,
  };

  return (
    <div
      role="radiogroup"
      aria-label={t.common.theme}
      className="inline-flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-0.5 text-zinc-500 dark:border-[var(--nx-border)] dark:bg-[var(--nx-surface)] dark:text-[var(--nx-fg-muted)]"
    >
      {OPTIONS.map((option) => {
        const active = mode === option.mode;
        return (
          <button
            key={option.mode}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={labels[option.mode]}
            title={labels[option.mode]}
            onClick={() => setMode(option.mode)}
            className={`flex h-7 w-7 items-center justify-center rounded-md text-[13px] leading-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--nx-accent)] ${
              active
                ? "bg-zinc-950 text-white dark:bg-[var(--nx-accent)] dark:text-zinc-950"
                : "hover:bg-zinc-100 dark:hover:bg-[var(--nx-muted-strong)]"
            }`}
          >
            <span aria-hidden="true">{option.icon}</span>
          </button>
        );
      })}
    </div>
  );
}
