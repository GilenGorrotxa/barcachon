import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import menuData from "./menu-data.json";
import type { MenuData, MenuItem, MenuCategory, Locale } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cargar datos del menú
export function getMenuData(): MenuData {
  return menuData as MenuData;
}

// Obtener categorías por tipo
export function getCategoriesByType(
  type: "food" | "drink" | "daily-menu",
): MenuCategory[] {
  const data = getMenuData();
  return data.categories
    .filter((cat) => cat.type === type)
    .sort((a, b) => a.order - b.order);
}

// Obtener items por categoría
export function getItemsByCategory(categoryId: string): MenuItem[] {
  const data = getMenuData();
  return data.items
    .filter((item) => item.categoryId === categoryId && item.available)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Formatear precio
export function formatPrice(price: number): string {
  return price.toFixed(2).replace(".", ",");
}

// Obtener traducción de un item
export function getItemTranslation(item: MenuItem, locale: Locale) {
  return item.translations[locale] || item.translations.es;
}

// Obtener traducción de una categoría
export function getCategoryTranslation(category: MenuCategory, locale: Locale) {
  return category.translations[locale] || category.translations.es;
}

// Guardar datos del menú (para el admin)
export async function saveMenuData(data: MenuData): Promise<boolean> {
  try {
    const response = await fetch("/api/admin/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error("Error saving menu data:", error);
    return false;
  }
}
