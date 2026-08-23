import { DEFAULT_LANGUAGE, LANGUAGES, translations, type Language, type Translations } from "@/i18n/config";

// API routes run server-side and have no React context, so they cannot call
// useI18n(). They CAN read the same "nexora-language" cookie the client
// LanguageProvider writes - that keeps a single source of truth for the
// selected language instead of introducing a second one for the API layer.
export function getRequestLanguage(request: Request): Language {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)nexora-language=([^;]+)/);
  const value = match ? decodeURIComponent(match[1]) : null;
  return value && (LANGUAGES as readonly string[]).includes(value) ? (value as Language) : DEFAULT_LANGUAGE;
}

export function getRequestTranslations(request: Request): Translations {
  return translations[getRequestLanguage(request)];
}
