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

export default async function BebidasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  const data = await getMenuData();
  const bebidasSection = data.navigation.mainSections.find(
    (s) => s.id === "bebidas",
  );

  if (!bebidasSection) {
    return <div>Sección no encontrada</div>;
  }

  return (
    <main className="min-h-screen w-full justify-center items-center flex-col py-8 px-16 max-w-md mx-auto">
      <div className="flex flex-col justify-center">
        {bebidasSection.categories
          .sort((a, b) => a.order - b.order)
          .map((category) => {
            const categoryName =
              category.translations[
                locale as keyof typeof category.translations
              ];

            return (
              <div key={category.id} className="mb-4">
                <CategoryButton
                  href={`/${locale}/menu/${category.id}`}
                  title={categoryName.toUpperCase()}
                />
              </div>
            );
          })}
      </div>
    </main>
  );
}
