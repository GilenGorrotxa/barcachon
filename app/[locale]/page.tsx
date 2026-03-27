import { getTranslations } from "next-intl/server";
import { CategoryButton } from "@/components/CategoryButton";
import type { MenuData } from "@/lib/types/menu.types";

// Función para obtener datos dinámicamente
async function getMenuData(): Promise<MenuData> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/menu`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch menu data");
  }

  return res.json();
}

export default async function CartaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("categories");

  const data = await getMenuData();
  const cartaSection = data.navigation.mainSections.find(
    (s) => s.id === "carta",
  );

  if (!cartaSection) {
    return <div>Sección no encontrada</div>;
  }

  // Agrupar categorías según el diseño real
  const categoryGroups = [
    {
      id: "pintxos-picar",
      title: t("pintxos-picar"),
      categories: ["pintxos", "para-picar", "brochetas", "para-compartir"],
      targetCategory: "pintxos",
    },
    {
      id: "hamburguesas-sandwiches",
      title: t("hamburguesas-sandwiches"),
      categories: ["sandwiches", "hamburguesas", "tostadas", "bocadillos"],
      targetCategory: "sandwiches",
    },
    {
      id: "platos-ensaladas",
      title: t("platos-ensaladas"),
      categories: ["platos-combinados", "ensaladas"],
      targetCategory: "platos-combinados",
    },
  ];

  return (
    <main className="min-h-screen w-full justify-center items-center flex-col py-8 px-16 max-w-md mx-auto">
      <div className="flex flex-col justify-center">
        {categoryGroups.map((group) => {
          const groupCategories = cartaSection.categories.filter((cat) =>
            group.categories.includes(cat.id),
          );

          if (groupCategories.length === 0) return null;

          // Usar la categoría objetivo definida en el grupo
          const targetCategory = groupCategories.find(
            (cat) => cat.id === group.targetCategory,
          );

          if (!targetCategory) return null;

          return (
            <div key={group.id} className="mb-4">
              <CategoryButton
                href={`/${locale}/menu/${targetCategory.id}`}
                title={group.title}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}
