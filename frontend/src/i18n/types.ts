export type LanguageCode = 
  | "en" // English
  | "hi" // Hindi (हिंदी)
  | "ta" // Tamil (தமிழ்)
  | "te" // Telugu (తెలుగు)
  | "mr" // Marathi (मराठी)
  | "bn" // Bengali (বাংলা)
  | "gu" // Gujarati (ગુજરાતી)
  | "kn" // Kannada (ಕನ್ನಡ)
  | "ml" // Malayalam (മലയാളം)
  | "pa"; // Punjabi (ਪੰਜਾਬੀ)

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export type TranslationDictionary = {
  [key: string]: string | TranslationDictionary;
};

export interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  supportedLanguages: LanguageInfo[];
}
