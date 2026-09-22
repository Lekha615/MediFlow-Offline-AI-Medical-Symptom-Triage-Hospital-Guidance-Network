import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useTranslation, LanguageCode } from "../../i18n";

export interface LanguageSelectorProps {
  variant?: "header" | "compact" | "auth";
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = "header",
  className = "",
}) => {
  const { language, setLanguage, supportedLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangInfo = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 border shadow-xs ${
          variant === "auth"
            ? "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/80 backdrop-blur-md"
            : "bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/80 backdrop-blur-md"
        }`}
        title="Select Language / भाषा चुनें"
        aria-label="Language selector"
      >
        <Globe className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {currentLangInfo.nativeName}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xl backdrop-blur-xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Select Language
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            {supportedLanguages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-xs">{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-500 dark:text-teal-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
