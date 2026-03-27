/**
 * Sistema de tipos para el menú de Bar Cachón
 * Estructura optimizada híbrida para Next.js
 */

// ============================================================================
// TIPOS PRINCIPALES
// ============================================================================

export interface MenuData {
  navigation: NavigationStructure;
  menuConfig: MenuConfig;
  items: Record<string, MenuItem>;
  metadata: Metadata;
}

export interface NavigationStructure {
  mainSections: MainSection[];
}

// ============================================================================
// CONFIGURACIÓN DEL MENÚ
// ============================================================================

export interface MenuConfig {
  dailyMenu: DailyMenuConfig;
}

export interface DailyMenuConfig {
  price: number;
  labels: {
    es: DailyMenuLabels;
    eu: DailyMenuLabels;
    en: DailyMenuLabels;
    fr: DailyMenuLabels;
  };
}

export interface DailyMenuLabels {
  firstCourses: string;
  secondCourses: string;
  desserts: string;
  priceLabel: string;
}

// ============================================================================
// NAVEGACIÓN
// ============================================================================

export interface MainSection {
  id: string; // 'carta' | 'bebidas' | 'menu'
  type: "food" | "drink" | "daily-menu";
  icon: string;
  order: number;
  translations: MultiLangText;
  categories: Category[];
}

export interface Category {
  id: string; // 'pintxos', 'hamburguesas', etc.
  icon: string;
  order: number;
  translations: MultiLangText;
  itemIds: string[]; // Referencias a items en el Record
}

// ============================================================================
// ITEMS DEL MENÚ
// ============================================================================

export interface MenuItem {
  id: string; // 'pintxo-001'
  slug: string; // 'cachoncitos'
  categoryId: string; // Referencia a categoría
  mainSectionId: string; // Referencia a sección principal
  courseType?: string; // 'primeros' | 'segundos' (solo para menú del día)
  translations: MultiLangItem;
  pricing: PricingConfig;
  options?: ItemOption[]; // Extras opcionales (+0.50€)
  allergens?: Allergen[];
  tags?: ItemTag[];
  image?: string;
  available: boolean;
  featured: boolean;
  order: number;
}

export interface MultiLangItem {
  es: ItemTranslation;
  eu: ItemTranslation;
  en: ItemTranslation;
  fr: ItemTranslation;
}

export interface ItemTranslation {
  name: string;
  description?: string; // Descripción principal
  extras?: string; // Texto de extras/opciones
}

// ============================================================================
// SISTEMA DE PRECIOS
// ============================================================================

export type PricingType =
  | "single" // Precio único
  | "unit-portion" // Unidad + Ración (pintxos)
  | "unit-half-full" // Unidad + Media + Ración completa (para picar)
  | "small-large" // Pequeño + Grande (cervezas)
  | "glass-bottle" // Copa + Botella (vinos)
  | "dual" // Dos tamaños genéricos
  | "menu"; // Precio de menú del día

export interface PricingConfig {
  type: PricingType;
  currency: "EUR";
  values: PriceValues;
}

export interface PriceValues {
  // Precio único
  single?: number;

  // Pintxos y raciones
  unit?: number; // Precio por unidad (1 pintxo)
  halfPortion?: number; // Media ración (varios pintxos)
  fullPortion?: number; // Ración completa

  // Bebidas
  small?: number; // Pequeño/Zurito
  large?: number; // Grande/Caña

  // Vinos y cavas
  glass?: number; // Copa
  bottle?: number; // Botella

  // Menú del día
  menu?: number; // Precio del menú completo
}

// ============================================================================
// EXTRAS Y OPCIONES
// ============================================================================

export interface ItemOption {
  id: string;
  translations: MultiLangText;
  priceModifier: number; // +0.50, +1.00, etc.
  type: "add" | "replace"; // Añadir o reemplazar
  available: boolean;
}

// ============================================================================
// ALÉRGENOS Y TAGS
// ============================================================================

export type Allergen =
  | "gluten"
  | "dairy"
  | "eggs"
  | "fish"
  | "shellfish"
  | "nuts"
  | "peanuts"
  | "soy"
  | "celery"
  | "mustard"
  | "sesame"
  | "sulfites"
  | "lupin"
  | "mollusks";

export type ItemTag =
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "spicy"
  | "new"
  | "signature"
  | "popular"
  | "seasonal";

// ============================================================================
// TRADUCCIONES
// ============================================================================

export interface MultiLangText {
  es: string;
  eu: string;
  en: string;
  fr: string;
}

// ============================================================================
// METADATA
// ============================================================================

export interface Metadata {
  version: string;
  lastUpdated: string; // ISO 8601
  languages: string[];
  defaultLanguage: string;
  restaurantInfo: RestaurantInfo;
}

export interface RestaurantInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

// ============================================================================
// UTILIDADES DE TIPO
// ============================================================================

export type Locale = "es" | "eu" | "en" | "fr";

export type MainSectionId = "carta" | "bebidas" | "menu";

// Helper para extraer el precio correcto según el tipo
export type ExtractPrice<T extends PricingType> = T extends "single"
  ? number
  : T extends "unit-portion"
    ? { unit?: number; portion?: number }
    : T extends "glass-bottle"
      ? { glass?: number; bottle?: number }
      : number | { [key: string]: number };

// ============================================================================
// CONSTANTES
// ============================================================================

export const SUPPORTED_LANGUAGES: readonly Locale[] = [
  "es",
  "eu",
  "en",
  "fr",
] as const;

export const ALLERGEN_ICONS: Record<Allergen, string> = {
  gluten: "🌾",
  dairy: "🥛",
  eggs: "🥚",
  fish: "🐟",
  shellfish: "🦐",
  nuts: "🌰",
  peanuts: "🥜",
  soy: "🫘",
  celery: "🥬",
  mustard: "🟡",
  sesame: "⚪",
  sulfites: "🍷",
  lupin: "🫘",
  mollusks: "🐚",
};

export const TAG_ICONS: Record<ItemTag, string> = {
  vegetarian: "🥗",
  vegan: "🌱",
  "gluten-free": "🌾🚫",
  spicy: "🌶️",
  new: "🆕",
  signature: "⭐",
  popular: "🔥",
  seasonal: "🍂",
};
