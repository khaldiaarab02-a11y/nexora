import type { ThemeConfig } from "./types";

export const elegantTheme: ThemeConfig = {
  id: "elegant",
  name: "Elegant",
  description: "طابع تحريري فاخر مع مساحات واسعة وتفاصيل راقية.",
  defaults: { primaryColor: "#2f241f", accentColor: "#a16207", font: "serif" },
  preview: { background: "#fbf8f3", foreground: "#2f241f", accent: "#a16207" },
  layout: {
    header: "border-b border-amber-900/10 bg-[#fbf8f3]",
    hero: "rounded-[2.5rem] bg-[#2f241f] px-7 py-14 text-[#fbf8f3] sm:px-14",
    heroTitle: "text-4xl font-semibold leading-tight tracking-tight sm:text-6xl",
    card: "rounded-[1.25rem] border border-amber-900/10 bg-[#fffdf9]",
    button: "rounded-none",
    grid: "sm:grid-cols-2 lg:grid-cols-3",
    productDetail: "rounded-[1.5rem] border border-amber-900/10 bg-[#fffdf9]",
    footer: "border-t border-amber-900/10 bg-[#fbf8f3]",
  },
};
