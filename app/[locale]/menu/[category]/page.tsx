import { notFound } from "next/navigation";
import { MenuItemCard } from "@/components/MenuItemCard";
import { CategoryButton } from "@/components/CategoryButton";
import menuData from "@/lib/menu-data.json";
import type { MenuData, Locale } from "@/lib/types/menu.types";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: categoryId } = await params;
  const data = menuData as unknown as MenuData;
  const t = await getTranslations("sections");
  const tCommon = await getTranslations("common");

  // Encontrar la categoría
  let category;
  let mainSection;

  for (const section of data.navigation.mainSections) {
    const found = section.categories.find((cat) => cat.id === categoryId);
    if (found) {
      category = found;
      mainSection = section;
      break;
    }
  }

  if (!category || !mainSection) {
    notFound();
  }

  // Definir grupos de categorías relacionadas
  const groupedCategories =
    categoryId === "pintxos" || categoryId === "para-picar"
      ? ["pintxos", "para-picar", "brochetas", "para-compartir"]
      : categoryId === "sandwiches"
        ? ["sandwiches", "hamburguesas", "tostadas", "bocadillos"]
        : categoryId === "ensaladas" || categoryId === "platos-combinados"
          ? ["platos-combinados", "ensaladas"]
          : [categoryId];

  // Obtener todas las categorías del grupo
  const categoriesToShow = mainSection.categories
    .filter((cat) => groupedCategories.includes(cat.id))
    .sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen w-full justify-center items-center flex-col py-8 px-8 max-w-md mx-auto">
      <div className="flex flex-col justify-center">
        {/* Botón Volver */}
        <div className="mb-10 flex justify-center ">
          <Link
            href={`/${locale}${mainSection.id === "carta" ? "" : `/${mainSection.id === "menu" ? "daily-menu" : "drinks"}`}`}
            className="inline-block w-full bg-black text-white px-8 py-2 text-center hover:bg-gray-800 transition-colors rounded-sm"
          >
            ← {tCommon("back")}
          </Link>
        </div>

        {/* Mostrar todas las categorías del grupo */}
        {categoriesToShow.map((cat) => {
          const items = cat.itemIds
            .map((id) => data.items[id])
            .filter(Boolean)
            .sort((a, b) => a.order - b.order);

          if (items.length === 0) return null;

          const categoryTranslations = cat.translations[locale as Locale];

          return (
            <div key={cat.id} className="mb-8">
              {/* Título de la categoría */}
              <div className="text-center mb-6 ">
                <h2 className="text-2xl text-gray-900 uppercase">
                  {categoryTranslations}
                  {cat.id === "tostadas" && (
                    <span className="text-sm ml-2 font-bold text-red-500">
                      {t("tostadas-new")}
                    </span>
                  )}
                </h2>
                {cat.id === "hamburguesas" && (
                  <p className="text-blue-500 font-bold text-sm mt-2">
                    {t("hamburguesas-subtitle")}
                  </p>
                )}
              </div>

              {/* Lista de items */}
              <div className="bg-white border border-gray-300 divide-y divide-gray-200 p-4 shadow-sm">
                {items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    locale={locale as Locale}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

// Generar rutas estáticas para todas las categorías
export async function generateStaticParams() {
  const data = menuData as unknown as MenuData;
  const params: { locale: string; category: string }[] = [];

  const locales = ["es", "eu", "en", "fr"];

  for (const section of data.navigation.mainSections) {
    for (const category of section.categories) {
      for (const locale of locales) {
        params.push({
          locale,
          category: category.id,
        });
      }
    }
  }

  return params;
}
