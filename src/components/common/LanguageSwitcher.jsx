import React, { useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { Languages, Check } from "lucide-react";

const languages = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
  },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const [languageOpen, setLanguageOpen] = useState(false);

  const languageRef = useRef(null);

  const currentLanguage =
    languages.find((language) => language.code === i18n.language) ||
    languages[0];

  const toggleLanguage = () => {
    setLanguageOpen((prev) => !prev);
  };

  const handleChange = (language) => {
    i18n.changeLanguage(language.code);

    setLanguageOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target)
      ) {
        setLanguageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={languageRef}
      className="relative"
    >
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label="Language"
        aria-expanded={languageOpen}
        className={`rounded-lg p-2.5 transition ${
          languageOpen
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <Languages size={20} />
      </button>

      {languageOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">
              Language
            </p>

            <p className="mt-0.5 text-xs text-gray-500">
              {currentLanguage.nativeName}
            </p>
          </div>

          <div className="p-1.5">
            {languages.map((language) => {
              const isSelected =
                i18n.language === language.code;

              return (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => handleChange(language)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition ${
                    isSelected
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {language.nativeName}
                    </span>

                    <span className="text-xs text-gray-400">
                      {language.name}
                    </span>
                  </div>

                  {isSelected && (
                    <Check
                      size={17}
                      className="text-gray-700"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;