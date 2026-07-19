import { createContext, useContext, useState, type ReactNode } from "react";
import type { LanguageCode } from "../lib/types";
import { t as translate, translations } from "../lib/i18n";

type TranslationKey = keyof typeof translations.en;

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: ReactNode;
  initialLanguage?: LanguageCode;
}) {
  const [language, setLanguageState] = useState<LanguageCode>(initialLanguage);

  function setLanguage(lang: LanguageCode) {
    setLanguageState(lang);
  }

  function t(key: TranslationKey): string {
    return translate(key, language);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
