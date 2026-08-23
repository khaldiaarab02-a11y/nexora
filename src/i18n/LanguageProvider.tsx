"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANGUAGE, languageDirection, LANGUAGES, translations, type Language, type Translations } from "./config";

const COOKIE_NAME = "nexora-language";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function persistLanguage(next: Language) {
  // Cookie: read on the server (RootLayout) so the very first HTML response
  // already has the right lang/dir/text. localStorage: kept in sync as a
  // client-only fallback. Both are written together on every change so the
  // two mechanisms can never drift apart again.
  window.localStorage.setItem(COOKIE_NAME, next);
  document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

type I18nContext = { language: Language; setLanguage: (language: Language) => void; dir: "rtl" | "ltr"; t: Translations };
const Context = createContext<I18nContext | null>(null);

export function LanguageProvider({ children, initialLanguage }: { children: React.ReactNode; initialLanguage?: Language }) {
  // Server (RootLayout) already resolved the correct language from the
  // cookie before the first byte was sent, so the client starts from that
  // same value instead of always defaulting to DEFAULT_LANGUAGE. This is
  // what previously caused "direction updates but text needs a refresh":
  // React state started at the default every time and only caught up to
  // the real selection after a post-mount effect.
  const [language, setLanguageState] = useState<Language>(initialLanguage ?? DEFAULT_LANGUAGE);

  useEffect(() => {
    // Fallback only: covers the case where no server-rendered value was
    // available (e.g. a cached/static shell). If the cookie already matched,
    // this is a no-op.
    if (initialLanguage) return;
    const stored = window.localStorage.getItem(COOKIE_NAME) as Language | null;
    if (stored && LANGUAGES.includes(stored)) setLanguageState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    persistLanguage(next);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = languageDirection[language];
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, dir: languageDirection[language], t: translations[language] }), [language]);
  // All user-visible strings now flow through the typed t.* dictionary
  // (see /i18n/translations). The DOM-mutation text-replacement bridge
  // that used to patch over leftover hardcoded strings has been removed:
  // it's no longer needed, and keeping it running would mean two
  // competing translation mechanisms fighting over the same DOM.
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useI18n() { const value = useContext(Context); if (!value) throw new Error("useI18n must be used inside LanguageProvider"); return value; }
