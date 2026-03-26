// Tipos para el sistema de menú multiidioma
export type Locale = "es" | "eu" | "en" | "fr";

export interface Translation {
  name: string;
  description?: string;
}

export interface MenuItemTranslations {
  es: Translation;
  eu: Translation;
  en: Translation;
  fr: Translation;
}

export interface MenuItemPrice {
  unit?: number; // precio_unidad
  halfPortion?: number; // precio_media_racion
  fullPortion?: number; // precio_racion
  standard?: number; // precio
}

export interface MenuItem {
  id: string;
  categoryId: string;
  translations: MenuItemTranslations;
  price: MenuItemPrice;
  allergens?: string[];
  available: boolean;
  featured?: boolean;
  order?: number;
}

export interface MenuCategory {
  id: string;
  type: "food" | "drink" | "daily-menu";
  icon?: string;
  order: number;
  translations: {
    es: string;
    eu: string;
    en: string;
    fr: string;
  };
}

export interface DailyMenuCourse {
  translations: MenuItemTranslations;
}

export interface DailyMenu {
  id: string;
  date?: string;
  firstCourses: DailyMenuCourse[];
  secondCourses: DailyMenuCourse[];
  desserts?: DailyMenuCourse[];
  price: number;
  available: boolean;
}

export interface MenuData {
  categories: MenuCategory[];
  items: MenuItem[];
  dailyMenu?: DailyMenu;
}

// Tipos para el Admin
export interface AdminCredentials {
  username: string;
  password: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  username?: string;
}
