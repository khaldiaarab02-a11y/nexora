"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_THEME_MODE,
  THEME_COOKIE,
  THEME_MODES,
  THEME_STORAGE_KEY,
  resolveTheme,
  type ResolvedTheme,
  type ThemeMode,
} from "./config";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function persistTheme(next: ThemeMode) {
  // Same dual-write pattern as LanguageProvider: cookie so the server
  // (RootLayout) can render the right theme on the very first response,
  // localStorage as a client-only fallback. Both stay in sync so the two
  // mechanisms never drift apart.
  window.localStorage.setItem(THEME_STORAGE_KEY, next);
  document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

type ThemeContext = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedTheme: ResolvedTheme;
};
const Context = createContext<ThemeContext | null>(null);

export function ThemeProvider({
  children,
  initialMode,
}: {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}) {
  // Same reasoning as LanguageProvider: start from the value the server
  // already resolved from the cookie (see the inline script + RootLayout),
  // not from a hardcoded default, so client state matches what was already
  // painted and no second re-render/flash is needed.
  const [mode, setModeState] = useState<ThemeMode>(initialMode ?? DEFAULT_THEME_MODE);
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark);

  useEffect(() => {
    if (initialMode) return;
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (stored && THEME_MODES.includes(stored)) setModeState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemPrefersDark(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    persistTheme(next);
  };

  const resolvedTheme = resolveTheme(mode, systemPrefersDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo(() => ({ mode, setMode, resolvedTheme }), [mode, resolvedTheme]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useTheme() {
  const value = useContext(Context);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
