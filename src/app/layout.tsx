import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  LANGUAGES,
  DEFAULT_LANGUAGE,
  type Language,
} from "@/i18n/config";
import { THEME_COOKIE, THEME_MODES, DEFAULT_THEME_MODE, type ThemeMode } from "@/theme/config";
import { siteConfig } from "@/config/site";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";
import "./page.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/assets/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

// Runs before React hydrates so the correct theme class is on <html> for the
// very first paint. Reads the same cookie value the server already used, and
// only falls back to matchMedia when there's no stored preference yet. This
// is what prevents a flash of the wrong theme on load/navigation.
const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var stored = document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]+)/);
    var mode = stored ? decodeURIComponent(stored[1]) : ${JSON.stringify(DEFAULT_THEME_MODE)};
    var isDark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const storedLanguage = cookieStore.get("nexora-language")?.value;

  const initialLanguage: Language =
    storedLanguage && LANGUAGES.includes(storedLanguage as Language)
      ? (storedLanguage as Language)
      : DEFAULT_LANGUAGE;

  const initialDir = initialLanguage === "ar" ? "rtl" : "ltr";

  const storedTheme = cookieStore.get(THEME_COOKIE)?.value;
  const initialThemeMode: ThemeMode =
    storedTheme && THEME_MODES.includes(storedTheme as ThemeMode)
      ? (storedTheme as ThemeMode)
      : DEFAULT_THEME_MODE;

  return (
    <html
      lang={initialLanguage}
      dir={initialDir}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider initialMode={initialThemeMode}>
          <LanguageProvider initialLanguage={initialLanguage}>
            <ToastProvider>{children}</ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
