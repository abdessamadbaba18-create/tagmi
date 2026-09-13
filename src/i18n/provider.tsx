"use client";

import { createContext, useContext, useCallback } from "react";
import type { Locale } from "./config";
import { getTranslation, getDirection } from "./translate";

type TranslationKey = string;

interface I18nContextType {
  locale: Locale;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export {
  getTranslation,
  getDirection,
  I18nContext,
};