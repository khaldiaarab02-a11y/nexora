import { ar } from "./translations/ar";
import { en } from "./translations/en";
import { fr } from "./translations/fr";

export const LANGUAGES = ["ar", "en", "fr"] as const;
export type Language = (typeof LANGUAGES)[number];

// Canonical translation shape. This describes the STRUCTURE that every
// language file must satisfy (every section/key must exist, and every leaf
// must be a string) — it does not depend on any single language's literal
// values. Deriving it from `en` with every leaf widened to `string` means
// adding a new key to en.ts automatically extends the contract that ar.ts
// and fr.ts are checked against, without ever pinning the type to one
// language's literal text (e.g. "Home" vs "الرئيسية").
type DeepStrings<T> = { [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]> };
export type Translations = DeepStrings<typeof en>;

// Each language file conforms to the canonical shape. If ar.ts or fr.ts
// ever drifts (missing key, wrong nesting), TypeScript will flag it right
// here instead of surfacing as a confusing mismatch deep in a component.
const typedAr: Translations = ar;
const typedFr: Translations = fr;
const typedEn: Translations = en;

export const translations: Record<Language, Translations> = { ar: typedAr, en: typedEn, fr: typedFr };
export const languageDirection: Record<Language, "rtl" | "ltr"> = { ar: "rtl", en: "ltr", fr: "ltr" };
export const DEFAULT_LANGUAGE: Language = "ar";
