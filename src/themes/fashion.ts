import type { ThemeConfig } from "./types";

export const fashionTheme: ThemeConfig = {
  id: "fashion",
  name: "Fashion",
  description: "واجهة جريئة بطابع مجلّة أزياء مناسبة للعلامات المرئية.",
  requiredFeature: "advanced_themes",
  defaults: { primaryColor: "#111111", accentColor: "#e11d48", font: "system" },
  preview: { background: "#f4f4f5", foreground: "#111111", accent: "#e11d48" },
  layout: {
    header: "border-b border-black bg-white",
    hero: "rounded-none bg-black px-7 py-16 text-white sm:px-14",
    heroTitle: "text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl",
    card: "rounded-none border border-black/10 bg-white",
    button: "rounded-none uppercase tracking-wide",
    grid: "sm:grid-cols-2 lg:grid-cols-4",
    productDetail: "rounded-none border border-black/10 bg-white",
    footer: "border-t border-black bg-white",
  },
};
