"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LanguageSelector } from "./LanguageSelector";

export function Header() {
  const t = useTranslations("nav");
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;

  const isActive = (path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}` || pathname.includes("/menu");
    }
    return pathname.includes(path);
  };

  const navItemClass = (path: string) => {
    const active = isActive(path);
    return `px-4 py-2 text-sm font-medium border border-black transition-colors ${
      active ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
    }`;
  };

  return (
    <header className="bg-white my-6">
      <div className="mx-auto px-4 pt-4 max-w-4xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href={`/${locale}`}>
            <div className="relative w-64 h-20">
              <Image
                src="/images/logo_cachon_oficial2.png"
                alt="Bar Cachón"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-center text-[28px] mb-6 text-black">BAR CACHÓN</h1>

        {/* Navigation */}
        <nav className="flex flex-row items-center justify-center gap-0 flex-wrap">
          <Link href={`/${locale}`} className={navItemClass(`/${locale}`)}>
            {t("menu")}
          </Link>
          <Link
            href={`/${locale}/drinks`}
            className={navItemClass("/drinks") + " border-l-0"}
          >
            {t("drinks")}
          </Link>
          <Link
            href={`/${locale}/daily-menu`}
            className={navItemClass("/daily-menu") + " border-l-0"}
          >
            {t("dailyMenu")}
          </Link>
          <div>
            <LanguageSelector />
          </div>
        </nav>
      </div>
    </header>
  );
}
