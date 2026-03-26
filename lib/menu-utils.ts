/**
 * Utilidades para trabajar con el menú
 */

import type {
  MenuData,
  MenuItem,
  Category,
  MainSection,
  Locale,
  PricingConfig,
  MultiLangText,
} from "@/lib/types/menu.types";

// ============================================================================
// FUNCIONES DE ACCESO A DATOS
// ============================================================================

/**
 * Obtiene un item por su ID
 */
export function getItemById(
  menuData: MenuData,
  itemId: string,
): MenuItem | undefined {
  return menuData.items[itemId];
}

/**
 * Obtiene todos los items de una categoría
 */
export function getItemsByCategory(
  menuData: MenuData,
  categoryId: string,
): MenuItem[] {
  return Object.values(menuData.items)
    .filter((item) => item.categoryId === categoryId)
    .sort((a, b) => a.order - b.order);
}

/**
 * Obtiene todos los items de una sección principal
 */
export function getItemsByMainSection(
  menuData: MenuData,
  mainSectionId: string,
): MenuItem[] {
  return Object.values(menuData.items)
    .filter((item) => item.mainSectionId === mainSectionId)
    .sort((a, b) => a.order - b.order);
}

/**
 * Obtiene una categoría por su ID
 */
export function getCategoryById(
  menuData: MenuData,
  categoryId: string,
): Category | undefined {
  for (const section of menuData.navigation.mainSections) {
    const category = section.categories.find((cat) => cat.id === categoryId);
    if (category) return category;
  }
  return undefined;
}

/**
 * Obtiene una sección principal por su ID
 */
export function getMainSectionById(
  menuData: MenuData,
  sectionId: string,
): MainSection | undefined {
  return menuData.navigation.mainSections.find(
    (section) => section.id === sectionId,
  );
}

/**
 * Obtiene items destacados
 */
export function getFeaturedItems(menuData: MenuData): MenuItem[] {
  return Object.values(menuData.items)
    .filter((item) => item.featured && item.available)
    .sort((a, b) => a.order - b.order);
}

/**
 * Busca items por texto (nombre o descripción)
 */
export function searchItems(
  menuData: MenuData,
  query: string,
  locale: Locale = "es",
): MenuItem[] {
  const lowerQuery = query.toLowerCase();

  return Object.values(menuData.items)
    .filter((item) => {
      const translation = item.translations[locale];
      return (
        translation.name.toLowerCase().includes(lowerQuery) ||
        translation.description?.toLowerCase().includes(lowerQuery) ||
        false
      );
    })
    .sort((a, b) => a.order - b.order);
}

// ============================================================================
// FUNCIONES DE FORMATO DE PRECIOS
// ============================================================================

/**
 * Formatea un precio según la configuración
 */
export function formatPrice(
  price: number,
  currency: string = "EUR",
  locale: Locale = "es",
): string {
  const localeMap: Record<Locale, string> = {
    es: "es-ES",
    eu: "eu-ES",
    en: "en-GB",
    fr: "fr-FR",
  };

  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Obtiene el texto de precio completo para un item
 */
export function getPriceDisplay(
  pricing: PricingConfig,
  locale: Locale = "es",
): string {
  const { type, values, currency } = pricing;

  switch (type) {
    case "single":
      return values.single ? formatPrice(values.single, currency, locale) : "";

    case "unit-portion":
      if (values.unit && values.fullPortion) {
        return `${formatPrice(values.unit, currency, locale)} / ${formatPrice(values.fullPortion, currency, locale)}`;
      }
      if (values.fullPortion) {
        return formatPrice(values.fullPortion, currency, locale);
      }
      return values.unit ? formatPrice(values.unit, currency, locale) : "";

    case "unit-half-full":
      const prices = [];
      if (values.unit) prices.push(formatPrice(values.unit, currency, locale));
      if (values.halfPortion)
        prices.push(formatPrice(values.halfPortion, currency, locale));
      if (values.fullPortion)
        prices.push(formatPrice(values.fullPortion, currency, locale));
      return prices.join(" / ");

    case "small-large":
      if (values.small && values.large) {
        return `${formatPrice(values.small, currency, locale)} / ${formatPrice(values.large, currency, locale)}`;
      }
      return values.small ? formatPrice(values.small, currency, locale) : "";

    case "glass-bottle":
      if (values.glass && values.bottle) {
        return `${formatPrice(values.glass, currency, locale)} / ${formatPrice(values.bottle, currency, locale)}`;
      }
      if (values.glass) return formatPrice(values.glass, currency, locale);
      if (values.bottle) return formatPrice(values.bottle, currency, locale);
      return "";

    case "menu":
      return values.menu ? formatPrice(values.menu, currency, locale) : "";

    default:
      return "";
  }
}

/**
 * Obtiene el precio mínimo de un item
 */
export function getMinPrice(pricing: PricingConfig): number {
  const values = Object.values(pricing.values).filter(
    (v): v is number => typeof v === "number",
  );
  return values.length > 0 ? Math.min(...values) : 0;
}

// ============================================================================
// FUNCIONES DE TRADUCCIÓN
// ============================================================================

/**
 * Obtiene el texto traducido
 */
export function getTranslation(text: MultiLangText, locale: Locale): string {
  return text[locale] || text.es;
}

/**
 * Obtiene el nombre traducido de un item
 */
export function getItemName(item: MenuItem, locale: Locale): string {
  return item.translations[locale]?.name || item.translations.es.name;
}

/**
 * Obtiene la descripción traducida de un item
 */
export function getItemDescription(
  item: MenuItem,
  locale: Locale,
): string | undefined {
  return (
    item.translations[locale]?.description || item.translations.es.description
  );
}

// ============================================================================
// FUNCIONES DE FILTRADO
// ============================================================================

/**
 * Filtra items por tags
 */
export function filterItemsByTags(
  menuData: MenuData,
  tags: string[],
): MenuItem[] {
  return Object.values(menuData.items)
    .filter((item) => item.tags?.some((tag) => tags.includes(tag)))
    .sort((a, b) => a.order - b.order);
}

/**
 * Filtra items sin alérgenos específicos
 */
export function filterItemsByAllergens(
  menuData: MenuData,
  excludeAllergens: string[],
): MenuItem[] {
  return Object.values(menuData.items)
    .filter((item) => {
      if (!item.allergens || item.allergens.length === 0) return true;
      return !item.allergens.some((allergen) =>
        excludeAllergens.includes(allergen),
      );
    })
    .sort((a, b) => a.order - b.order);
}

/**
 * Filtra items disponibles
 */
export function getAvailableItems(menuData: MenuData): MenuItem[] {
  return Object.values(menuData.items)
    .filter((item) => item.available)
    .sort((a, b) => a.order - b.order);
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Valida que un locale sea soportado
 */
export function isValidLocale(locale: string): locale is Locale {
  return ["es", "eu", "en", "fr"].includes(locale);
}

/**
 * Obtiene el locale por defecto si el proporcionado no es válido
 */
export function getSafeLocale(
  locale: string | undefined,
  defaultLocale: Locale = "es",
): Locale {
  return locale && isValidLocale(locale) ? locale : defaultLocale;
}
