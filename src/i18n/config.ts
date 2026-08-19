import { ar } from "./translations/ar";
import { en } from "./translations/en";
import { fr } from "./translations/fr";

export const LANGUAGES = ["ar", "en", "fr"] as const;
export type Language = (typeof LANGUAGES)[number];
export const translations = { ar, en, fr } as const;
export const languageDirection: Record<Language, "rtl" | "ltr"> = { ar: "rtl", en: "ltr", fr: "ltr" };
export const DEFAULT_LANGUAGE: Language = "ar";
