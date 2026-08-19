export type ThemeId = "minimal" | "elegant" | "modern" | "fashion" | "beauty";

export type FontId = "system" | "serif" | "rounded" | "mono";

export type ThemeFeature = "advanced_themes";

export type ThemeConfig = {
  id: ThemeId;
  name: string;
  description: string;
  requiredFeature?: ThemeFeature;
  defaults: {
    primaryColor: string;
    accentColor: string;
    font: FontId;
  };
  preview: {
    background: string;
    foreground: string;
    accent: string;
  };
  layout: {
    header: string;
    hero: string;
    heroTitle: string;
    card: string;
    button: string;
    grid: string;
    productDetail: string;
    footer: string;
  };
};
