import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageCode, LanguageInfo, LanguageContextType, TranslationDictionary } from "./types";
import { en } from "./translations/en";
import { hi } from "./translations/hi";
import { ta } from "./translations/ta";
import { te } from "./translations/te";
import { mr } from "./translations/mr";
import { bn } from "./translations/bn";
import { gu } from "./translations/gu";
import { kn } from "./translations/kn";
import { ml } from "./translations/ml";
import { pa } from "./translations/pa";

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
];

const translations: Record<LanguageCode, TranslationDictionary> = {
  en,
  hi,
  ta,
  te,
  mr,
  bn,
  gu,
  kn,
  ml,
  pa,
};

const STORAGE_KEY = "mediflow_language";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved as LanguageCode;
    }
    return "en";
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const getNestedValue = (obj: any, path: string): string | undefined => {
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return typeof current === "string" ? current : undefined;
  };

  const t = (path: string, params?: Record<string, string | number>): string => {
    const currentDict = translations[language] || translations.en;
    let result = getNestedValue(currentDict, path);

    // Fallback to English if not found in selected language
    if (!result && language !== "en") {
      result = getNestedValue(translations.en, path);
    }

    // Final fallback to key path itself
    if (!result) {
      result = path;
    }

    // Replace parameters if provided e.g. {name}
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        result = (result as string).replace(new RegExp(`\\{${key}\\}`, "g"), String(val));
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;
