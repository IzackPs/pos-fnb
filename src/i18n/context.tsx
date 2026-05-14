"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Locale } from "./index";
import { getDictionary, type Dictionary } from "./dictionaries";

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dictionary;
}>({
  locale: "vi",
  setLocale: () => {},
  t: getDictionary("vi"),
});

const STORAGE_KEY = "pos-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");
  const [t, setT] = useState<Dictionary>(getDictionary("vi"));

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && ["vi", "en", "zh", "ko", "ja"].includes(stored)) {
      setLocaleState(stored);
      setT(getDictionary(stored));
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    setT(getDictionary(l));
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
