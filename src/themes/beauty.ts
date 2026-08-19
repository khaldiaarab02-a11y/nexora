import type { ThemeConfig } from "./types";

export const beautyTheme: ThemeConfig = {
  id: "beauty",
  name: "Beauty",
  description: "واجهة ناعمة ودافئة مصممة لمنتجات الجمال والعناية.",
  requiredFeature: "advanced_themes",
  defaults: { primaryColor: "#4a3036", accentColor: "#d9778a", font: "rounded" },
  preview: { background: "#fff7f8", foreground: "#4a3036", accent: "#d9778a" },
  layout: {
    header: "border-b border-rose-100 bg-[#fff7f8]",
    hero: "rounded-[2.5rem] bg-[#4a3036] px-7 py-14 text-[#fff7f8] sm:px-14",
    heroTitle: "text-4xl font-bold leading-tight sm:text-6xl",
    card: "rounded-[2rem] border border-rose-100 bg-white",
    button: "rounded-full",
    grid: "sm:grid-cols-2 lg:grid-cols-3",
    productDetail: "rounded-[2rem] border border-rose-100 bg-white",
    footer: "border-t border-rose-100 bg-[#fff7f8]",
  },
};
