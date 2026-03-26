"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { locales } from "@/i18n";
import { useState, useRef, useEffect } from "react";

const languageLabels = {
  es: "ES",
  eu: "EU",
  en: "EN",
  fr: "FR",
};

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("nav");

  const currentLocale = pathname.split("/")[1] as keyof typeof languageLabels;

  const handleLanguageChange = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "");
    router.push(`/${newLocale}${pathWithoutLocale}`);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-1 py-2 text-sm font-medium border-r border-t border-b border-black bg-white transition-colors min-w-22"
      >
        {t("languages")} ▾
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-black shadow-lg z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLanguageChange(locale)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                locale === currentLocale ? "bg-gray-50 font-medium" : ""
              }`}
            >
              {languageLabels[locale as keyof typeof languageLabels]} -{" "}
              {locale === "es"
                ? "Español"
                : locale === "eu"
                  ? "Euskera"
                  : locale === "en"
                    ? "English"
                    : "Français"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
