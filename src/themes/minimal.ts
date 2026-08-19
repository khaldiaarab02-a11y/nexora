import type { ThemeConfig } from "./types";

export const minimalTheme: ThemeConfig = {
  id: "minimal",
  name: "Minimal",
  description: "واجهة نظيفة وهادئة تركز على المنتجات وسهولة الشراء.",
  defaults: { primaryColor: "#18181b", accentColor: "#71717a", font: "system" },
  preview: { background: "#fafafa", foreground: "#18181b", accent: "#71717a" },
  layout: {
    header: "border-b border-zinc-200/80 bg-white/95 backdrop-blur",
    hero: "rounded-[2rem] bg-zinc-900 px-7 py-12 text-white sm:px-12",
    heroTitle: "text-4xl font-bold leading-tight sm:text-5xl",
    card: "rounded-[1.75rem] border border-zinc-200 bg-white",
    button: "rounded-xl",
    grid: "sm:grid-cols-2 lg:grid-cols-3",
    productDetail: "rounded-[2rem] border border-zinc-200 bg-white",
    footer: "border-t border-zinc-200 bg-white",
  },
};
