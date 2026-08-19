import { beautyTheme } from "./beauty";
import { elegantTheme } from "./elegant";
import { fashionTheme } from "./fashion";
import { minimalTheme } from "./minimal";
import { modernTheme } from "./modern";
import type { ThemeConfig, ThemeId } from "./types";

export const THEMES: ThemeConfig[] = [
  minimalTheme,
  elegantTheme,
  modernTheme,
  fashionTheme,
  beautyTheme,
];

export const THEME_MAP: Record<ThemeId, ThemeConfig> = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme])
) as Record<ThemeId, ThemeConfig>;

export const DEFAULT_THEME_ID: ThemeId = "minimal";

export function getTheme(themeId: string | null | undefined): ThemeConfig {
  return THEME_MAP[themeId as ThemeId] ?? THEME_MAP[DEFAULT_THEME_ID];
}

export const FONT_OPTIONS = [
  { id: "system", name: "System", stack: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { id: "serif", name: "Editorial Serif", stack: "Georgia, 'Times New Roman', serif" },
  { id: "rounded", name: "Rounded", stack: "'Trebuchet MS', system-ui, sans-serif" },
  { id: "mono", name: "Mono", stack: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace" },
] as const;
