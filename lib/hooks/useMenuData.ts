/**
 * Utilidades para cargar y acceder a los datos del menú
 */

import menuData from "@/lib/menu-data.json";
import type {
  MenuData,
  MenuItem,
  Category,
  MainSection,
  Locale,
} from "@/lib/types/menu.types";

export function getMenuData() {
  return menuData as unknown as MenuData;
}

export function getMainSection(sectionId: string) {
  const data = getMenuData();
  return data.navigation.mainSections.find(
    (section) => section.id === sectionId,
  );
}

export function getCategory(categoryId: string) {
  const data = getMenuData();
  for (const section of data.navigation.mainSections) {
    const category = section.categories.find((cat) => cat.id === categoryId);
    if (category) return category;
  }
  return undefined;
}

export function getCategoryItems(categoryId: string) {
  const data = getMenuData();
  const category = getCategory(categoryId);

  if (!category) return [];

  return category.itemIds
    .map((id) => data.items[id])
    .filter((item) => item && item.available) // Solo items disponibles
    .sort((a, b) => a.order - b.order);
}

export function getMainSectionCategories(sectionId: string) {
  const section = getMainSection(sectionId);
  return section?.categories || [];
}

export function getCategoriesByType(type: "food" | "drink" | "daily-menu") {
  const data = getMenuData();
  const sections = data.navigation.mainSections.filter(
    (section) => section.type === type,
  );

  const categories: Category[] = [];
  sections.forEach((section) => {
    categories.push(...section.categories);
  });

  return categories.sort((a, b) => a.order - b.order);
}

export function getItemsByCategory(categoryId: string) {
  const data = getMenuData();

  return Object.values(data.items)
    .filter((item) => item.categoryId === categoryId && item.available) // Solo items disponibles
    .sort((a, b) => a.order - b.order);
}
