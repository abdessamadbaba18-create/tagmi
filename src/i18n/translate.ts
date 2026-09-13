import type { Locale } from "./config";
import fr from "./fr.json";
import en from "./en.json";
import ar from "./ar.json";

const translations = { fr, en, ar } as const;

export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split(".");
  let value: unknown = translations[locale];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Fallback to French
      value = translations.fr;
      for (const fk of keys) {
        if (value && typeof value === "object" && fk in value) {
          value = (value as Record<string, unknown>)[fk];
        } else {
          return key;
        }
      }
      return typeof value === "string" ? value : key;
    }
  }

  return typeof value === "string" ? value : key;
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}