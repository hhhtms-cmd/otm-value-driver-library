/* Design reminder: language changes preserve the same evidence-led archive system; they never change the underlying ROI data. */
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Language = "zh" | "en" | "es";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const storageKey = "otm-value-driver-library.language.v1";

const isLanguage = (value: string | null): value is Language => value === "zh" || value === "en" || value === "es";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = typeof window === "undefined" ? null : window.localStorage.getItem(storageKey);
    return isLanguage(stored) ? stored : "zh";
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
