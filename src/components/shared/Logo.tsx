"use client";
import Image from "next/image";
import { useTheme } from "@/theme/ThemeProvider";

type LogoVariant = "full" | "compact" | "mark";
type LogoAsset = { src: string; width: number; height: number };

// Exact pixel dimensions of each saved asset (verified against the actual
// files in public/assets/brand/) so next/image never has to guess an
// aspect ratio — light and dark lockups aren't pixel-identical in every
// variant, so each gets its own true width/height instead of a shared
// nominal ratio, which is what previously risked stretching the logo.
const ASSETS: Record<LogoVariant, { light: LogoAsset; dark: LogoAsset }> = {
  full: {
    light: { src: "/assets/brand/nexora-logo-full-light.png", width: 1200, height: 378 },
    dark: { src: "/assets/brand/nexora-logo-full-dark.png", width: 1200, height: 234 },
  },
  compact: {
    light: { src: "/assets/brand/nexora-logo-compact-light.png", width: 900, height: 134 },
    dark: { src: "/assets/brand/nexora-logo-compact-dark.png", width: 900, height: 134 },
  },
  mark: {
    light: { src: "/assets/brand/nexora-mark-light.png", width: 400, height: 328 },
    dark: { src: "/assets/brand/nexora-mark-dark.png", width: 400, height: 328 },
  },
};

/**
 * Official Nexora brand mark. Picks the correct light/dark asset for the
 * active theme automatically.
 *
 * - "full": symbol + wordmark + tagline — footer, auth pages, wide headers.
 * - "compact": symbol + wordmark, no tagline — navbars, dashboard/admin bars.
 * - "mark": symbol only — collapsed sidebar, mobile, favicon-adjacent spots.
 */
export default function Logo({
  variant = "compact",
  className = "",
  height = 28,
  priority = false,
  background = "auto",
}: {
  variant?: LogoVariant;
  className?: string;
  height?: number;
  priority?: boolean;
  /** "auto" follows the active site theme. Use "light" or "dark" to force
   * a variant when the logo sits on a surface with a fixed color that
   * doesn't follow the theme (e.g. the always-dark admin bar). */
  background?: "auto" | "light" | "dark";
}) {
  const { resolvedTheme } = useTheme();
  const effectiveTheme = background === "auto" ? resolvedTheme : background;
  const asset = ASSETS[variant][effectiveTheme];
  const width = Math.round((asset.width / asset.height) * height);

  return (
    <Image
      src={asset.src}
      alt="Nexora"
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}
