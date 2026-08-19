import type { ThemeConfig } from "./types";

export const modernTheme: ThemeConfig = {
  id: "modern",
  name: "Modern",
  description: "تخطيط عصري واضح مع بطاقات قوية وعناصر حركة خفيفة.",
  defaults: { primaryColor: "#111827", accentColor: "#2563eb", font: "system" },
  preview: { background: "#f8fafc", foreground: "#111827", accent: "#2563eb" },
  layout: {
    header: "border-b border-slate-200 bg-white",
    hero: "rounded-3xl bg-slate-900 px-7 py-12 text-white shadow-sm sm:px-12",
    heroTitle: "text-4xl font-extrabold leading-tight sm:text-6xl",
    card: "rounded-2xl border border-slate-200 bg-white shadow-sm",
    button: "rounded-lg",
    grid: "sm:grid-cols-2 lg:grid-cols-4",
    productDetail: "rounded-3xl border border-slate-200 bg-white shadow-sm",
    footer: "border-t border-slate-200 bg-white",
  },
};
