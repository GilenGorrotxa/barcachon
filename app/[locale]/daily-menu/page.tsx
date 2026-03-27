import { getTranslations } from "next-intl/server";
import type { MenuData, Locale } from "@/lib/types/menu.types";
import { getMenuData } from "@/lib/getMenuData";

// Forzar renderizado dinámico para reflejar cambios inmediatos
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DailyMenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("common");

  const data = await getMenuData();
  const menuSection = data.navigation.mainSections.find((s) => s.id === "menu");

  if (!menuSection) {
    return <div>Sección no encontrada</div>;
  }

  // Obtener configuración del menú del día
  const menuConfig = data.menuConfig.dailyMenu;
  const labels = menuConfig.labels[locale as Locale];

  // Obtener categorías
  const menuDelDiaCategory = menuSection.categories.find(
    (c) => c.id === "menu-del-dia",
  );
  const postresCategory = menuSection.categories.find(
    (c) => c.id === "postres",
  );

  const menuDelDiaItems =
    menuDelDiaCategory?.itemIds
      .map((id) => data.items[id])
      .filter(Boolean)
      .sort((a, b) => a.order - b.order) || [];

  // Separar primeros y segundos platos
  const primerosPlatos = menuDelDiaItems.filter(
    (item) => item.courseType === "primeros",
  );
  const segundosPlatos = menuDelDiaItems.filter(
    (item) => item.courseType === "segundos",
  );

  const postresItems =
    postresCategory?.itemIds
      .map((id) => data.items[id])
      .filter(Boolean)
      .sort((a, b) => a.order - b.order) || [];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center w-full">
      <div className="flex flex-col justify-center px-10 py-10 max-w-xl w-full">
        {/* PRIMEROS PLATOS */}
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-900">
          {labels.firstCourses}
        </h2>
        <div className="bg-white border border-gray-300 mb-8">
          {primerosPlatos
            .filter((item) => item.available)
            .map((item, index) => (
              <div
                key={`primero-${item.id}`}
                className={`py-3 px-6 ${index < primerosPlatos.filter((i) => i.available).length - 1 ? "border-b border-gray-300" : ""}`}
              >
                <p className="text-center text-black font-normal text-base">
                  {item.translations[locale as Locale]?.name || ""}
                </p>
              </div>
            ))}
        </div>

        {/* SEGUNDOS PLATOS */}
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-900">
          {labels.secondCourses}
        </h2>
        <div className="bg-white border border-gray-300 mb-8">
          {segundosPlatos
            .filter((item) => item.available)
            .map((item, index) => (
              <div
                key={`segundo-${item.id}`}
                className={`py-3 px-6 ${index < segundosPlatos.filter((i) => i.available).length - 1 ? "border-b border-gray-300" : ""}`}
              >
                <p className="text-center text-black font-normal text-base">
                  {item.translations[locale as Locale]?.name || ""}
                </p>
              </div>
            ))}
        </div>

        {/* POSTRE */}
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-900">
          {labels.desserts}
        </h2>
        <div className="bg-white border border-gray-300 mb-8">
          {postresItems.map((item, index) => (
            <div
              key={item.id}
              className={`py-3 px-6 ${index < postresItems.length - 1 ? "border-b border-gray-300" : ""}`}
            >
              <p className="text-center text-black font-normal text-base">
                {item.translations[locale as Locale]?.name || ""}
              </p>
            </div>
          ))}
        </div>

        {/* PRECIO */}
        <div className="text-center mb-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            {labels.priceLabel} {menuConfig.price.toFixed(2).replace(".", ",")}€
          </h2>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t("terraceSupplement").replace("(", "").replace(")", "")}
          </p>
        </div>
      </div>
    </main>
  );
}
