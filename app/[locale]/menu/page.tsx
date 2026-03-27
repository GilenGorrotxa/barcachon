import { getTranslations } from "next-intl/server";
import type { MenuData } from "@/lib/types/menu.types";
import { getCategoriesByType, getItemsByCategory } from "@/lib/menu-utils";
import { getMenuData } from "@/lib/getMenuData";
import { CategorySection } from "@/components/CategorySection";
import { ScrollToTop } from "@/components/ScrollToTop";
import Link from "next/link";
import type { Locale } from "@/lib/types";

// Forzar renderizado dinámico para reflejar cambios inmediatos
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = await getTranslations();

  const menuData = await getMenuData();
  const foodCategories = getCategoriesByType(menuData, "food");

  // Categorías principales para navegación rápida
  const mainCategories = [
    { id: "pintxos-picar", label: t("categories.pintxos-picar") },
    {
      id: "hamburguesas-sandwiches",
      label: t("categories.hamburguesas-sandwiches"),
    },
    { id: "platos-ensaladas", label: t("categories.platos-ensaladas") },
  ];

  return (
    <div className="min-h-screen w-full justify-center items-center flex-col py-8 px-16 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/${locale}`}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              ← {t("common.back")}
            </Link>
            <h1 className="text-3xl font-bold tracking-widest">CARTA</h1>
            <div className="w-16"></div>
          </div>

          {/* Quick Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {mainCategories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="px-4 py-2 text-sm font-medium border border-black bg-white hover:bg-black hover:text-white transition-colors whitespace-nowrap"
              >
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center px-16 py-6 max-w-sm">
        {/* Para Picar y Pintxos */}
        <div id="pintxos-picar" className="mb-16 scroll-mt-32">
          <div className="grid gap-8">
            {foodCategories
              .filter((cat) =>
                [
                  "para-picar",
                  "pintxos",
                  "brochetas",
                  "para-compartir",
                ].includes(cat.id),
              )
              .map((category) => {
                const items = getItemsByCategory(menuData, category.id);
                return (
                  <CategorySection
                    key={category.id}
                    category={category}
                    items={items}
                    locale={locale as Locale}
                  />
                );
              })}
          </div>
        </div>

        {/* Hamburguesas y Sandwiches */}
        <div id="hamburguesas-sandwiches" className="mb-16 scroll-mt-32">
          <div className="grid gap-8">
            {foodCategories
              .filter((cat) =>
                [
                  "tostadas",
                  "sandwiches",
                  "hamburguesas",
                  "bocadillos",
                ].includes(cat.id),
              )
              .map((category) => {
                const items = getItemsByCategory(menuData, category.id);
                const subtitle =
                  category.id === "hamburguesas"
                    ? t("sections.hamburguesas-subtitle")
                    : undefined;
                return (
                  <CategorySection
                    key={category.id}
                    category={category}
                    items={items}
                    locale={locale as Locale}
                    showSubtitle={subtitle}
                  />
                );
              })}
          </div>
        </div>

        {/* Platos y Ensaladas */}
        <div id="platos-ensaladas" className="mb-16 scroll-mt-32">
          <div className="grid gap-8">
            {foodCategories
              .filter((cat) =>
                ["ensaladas", "platos-combinados", "postres"].includes(cat.id),
              )
              .map((category) => {
                const items = getItemsByCategory(menuData, category.id);
                return (
                  <CategorySection
                    key={category.id}
                    category={category}
                    items={items}
                    locale={locale as Locale}
                  />
                );
              })}
          </div>
        </div>

        {/* Terrace Supplement Note */}
        <div className="text-center mt-12 mb-8">
          <p className="text-lg font-semibold text-gray-700">
            {t("common.terraceSupplement")}
          </p>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
