"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import I18nDomBridge from "./I18nDomBridge";
import { DEFAULT_LANGUAGE, languageDirection, LANGUAGES, translations, type Language, type Translations } from "./config";

type I18nContext = { language: Language; setLanguage: (language: Language) => void; dir: "rtl" | "ltr"; t: Translations };
const Context = createContext<I18nContext | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = window.localStorage.getItem("nexora-language") as Language | null;
    if (stored && LANGUAGES.includes(stored)) setLanguageState(stored);
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem("nexora-language", next);
    document.documentElement.lang = next;
    document.documentElement.dir = languageDirection[next];
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = languageDirection[language];
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, dir: languageDirection[language], t: translations[language] }), [language]);
  return <Context.Provider value={value}><I18nDomBridge language={language} />{children}</Context.Provider>;
}

export function useI18n() {
  const value = useContext(Context);
  if (!value) throw new Error("useI18n must be used inside LanguageProvider");
  return value;
}
