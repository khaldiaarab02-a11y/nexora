"use client";

import { useI18n } from "@/i18n/LanguageProvider";

function Globe3D() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-[27px] w-[27px]"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="globe-core" cx="35%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="22%" stopColor="#ddd6fe" />
          <stop offset="55%" stopColor="#8b5cf6" />
          <stop offset="82%" stopColor="#6d28d9" />
          <stop offset="100%" stopColor="#4c1d95" />
        </radialGradient>

        <linearGradient
          id="globe-shine"
          x1="8"
          y1="6"
          x2="39"
          y2="43"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#c4b5fd" stopOpacity="0.65" />
          <stop offset="1" stopColor="#7c3aed" stopOpacity="0.15" />
        </linearGradient>

        <filter
          id="globe-shadow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodColor="#7c3aed"
            floodOpacity="0.45"
          />
        </filter>
      </defs>

      {/* 3D globe body */}
      <circle
        cx="24"
        cy="24"
        r="18"
        fill="url(#globe-core)"
        filter="url(#globe-shadow)"
      />

      {/* Vertical longitude curves */}
      <ellipse
        cx="24"
        cy="24"
        rx="8"
        ry="18"
        stroke="url(#globe-shine)"
        strokeWidth="1.6"
      />

      <ellipse
        cx="24"
        cy="24"
        rx="14"
        ry="18"
        stroke="url(#globe-shine)"
        strokeWidth="1.15"
        opacity="0.8"
      />

      {/* Horizontal latitude curves */}
      <ellipse
        cx="24"
        cy="24"
        rx="18"
        ry="7"
        stroke="url(#globe-shine)"
        strokeWidth="1.5"
      />

      <ellipse
        cx="24"
        cy="24"
        rx="18"
        ry="13"
        stroke="url(#globe-shine)"
        strokeWidth="1.1"
        opacity="0.8"
      />

      {/* Outer rim */}
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="#c4b5fd"
        strokeWidth="1.5"
        opacity="0.9"
      />

      {/* Gloss highlight */}
      <path
        d="M12 15.5C15.2 10.6 20.1 7.7 25.2 7"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />

      <circle
        cx="16"
        cy="12"
        r="2.2"
        fill="#ffffff"
        opacity="0.8"
      />
    </svg>
  );
}

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label={t.common.language}
        title={t.common.language}
        className="
          group
          relative
          flex
          h-9
          w-9
          items-center
          justify-center
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
        <Globe3D />

        <select
          aria-label={t.common.language}
          value={language}
          onChange={(e) =>
            setLanguage(e.target.value as typeof language)
          }
          className="
            absolute
            inset-0
            z-10
            h-full
            w-full
            cursor-pointer
            opacity-0
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
