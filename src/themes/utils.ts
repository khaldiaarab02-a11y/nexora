import { FONT_OPTIONS, getTheme } from "./registry";
import type { FontId, ThemeId } from "./types";

export function getFontStack(font: FontId) {
  return FONT_OPTIONS.find((option) => option.id === font)?.stack ?? FONT_OPTIONS[0].stack;
}

export function resolveTheme(
  themeId: string | null | undefined,
  primaryColor?: string | null,
  accentColor?: string | null,
  font?: string | null
) {
  const theme = getTheme(themeId);
  const safeFont = FONT_OPTIONS.some((option) => option.id === font) ? (font as FontId) : theme.defaults.font;
  return {
    theme,
    themeId: theme.id as ThemeId,
    primaryColor: primaryColor || theme.defaults.primaryColor,
    accentColor: accentColor || theme.defaults.accentColor,
    font: safeFont,
    fontStack: getFontStack(safeFont),
  };
}

export function isValidHex(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}
