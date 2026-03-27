import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatear precio
export function formatPrice(price: number): string {
  return price.toFixed(2).replace(".", ",");
}

// Nota: Las funciones de acceso a datos más complejas se han movido a menu-utils.ts
// Las siguientes funciones se mantienen aquí por compatibilidad con el código existente

// Re-exportar tipos para compatibilidad
export type { MenuData, MenuItem, MenuCategory, Locale } from "./types";

// Re-exportar funciones desde useMenuData para compatibilidad
export {
  getMenuData,
  getCategoriesByType,
  getItemsByCategory,
  getCategoryItems,
  getCategory,
  getMainSection,
} from "./hooks/useMenuData";

export function getItemTranslation(item: any, locale: any): any {
  return item.translations?.[locale] || item.translations?.es || {};
}

export function getCategoryTranslation(category: any, locale: any): string {
  return category.translations?.[locale] || category.translations?.es || "";
}
