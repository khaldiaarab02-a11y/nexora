import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  LANGUAGES,
  DEFAULT_LANGUAGE,
  type Language,
} from "@/i18n/config";
import { siteConfig } from "@/config/site";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";
import "./page.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

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

  return (
    <html
      lang={initialLanguage}
      dir={initialDir}
      suppressHydrationWarning
    >
      <body>
        <LanguageProvider initialLanguage={initialLanguage}>
          <ToastProvider>{children}</ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
