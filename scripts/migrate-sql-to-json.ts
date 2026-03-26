/**
 * Script de migración de Base de Datos SQL a JSON
 * Convierte la estructura SQL legacy a la nueva estructura JSON optimizada
 */

import fs from "fs";
import path from "path";

// Tipos para la nueva estructura optimizada
interface MenuData {
  categories: Category[];
  items: MenuItem[];
  metadata: {
    lastUpdated: string;
    version: string;
  };
}

interface Category {
  id: string;
  type: "food" | "drink";
  icon: string;
  order: number;
  translations: Translations;
}

interface MenuItem {
  id: string;
  categoryId: string;
  translations: {
    [locale: string]: ItemTranslation;
  };
  price: Price;
  allergens?: string[];
  available: boolean;
  featured?: boolean;
  order: number;
  image?: string;
}

interface ItemTranslation {
  name: string;
  description?: string;
  extraDescription?: string;
}

interface Translations {
  es: string;
  eu: string;
  en: string;
  fr: string;
}

interface Price {
  unit?: number;
  halfPortion?: number;
  fullPortion?: number;
  standard?: number;
  small?: number;
  large?: number;
  glass?: number;
  bottle?: number;
}

// Mapeo de categorías SQL a JSON
const categoryMapping: Record<string, string> = {
  Para_picar: "para-picar",
  Pintxos: "pintxos",
  Brochetas: "brochetas",
  Para_compartir: "para-compartir",
  Tostadas: "tostadas",
  Sandwiches: "sandwiches",
  Hamburguesas: "hamburguesas",
  Bocadillos: "bocadillos",
  Ensaladas: "ensaladas",
  Platos_combinados: "platos-combinados",
  Menu_del_dia: "menu-del-dia",
  Menu_infantil: "menu-infantil",
  Postres: "postres",
  Cafes: "cafes",
  Refrescos: "refrescos",
  Cervezas: "cervezas",
  Vinos: "vinos",
  Apertitivos_digestivos_finos: "aperitivos",
  Copas: "copas-licores",
  Combinados_licores: "combinados-licores",
};

/**
 * Función principal de migración
 */
async function migrateData() {
  console.log("🚀 Iniciando migración de SQL a JSON...\n");

  // Aquí deberías cargar los datos del SQL
  // Por ahora, vamos a crear la estructura con los datos que tenemos

  const menuData: MenuData = {
    categories: createCategories(),
    items: createMenuItems(),
    metadata: {
      lastUpdated: new Date().toISOString(),
      version: "2.0.0",
    },
  };

  // Guardar el archivo JSON
  const outputPath = path.join(process.cwd(), "lib", "menu-data-migrated.json");
  fs.writeFileSync(outputPath, JSON.stringify(menuData, null, 2), "utf-8");

  console.log("✅ Migración completada!");
  console.log(`📁 Archivo guardado en: ${outputPath}`);
  console.log(`📊 Total categorías: ${menuData.categories.length}`);
  console.log(`📊 Total items: ${menuData.items.length}`);
}

function createCategories(): Category[] {
  return [
    {
      id: "para-picar",
      type: "food",
      icon: "🍽️",
      order: 1,
      translations: {
        es: "Para Picar",
        eu: "Pikoteko",
        en: "Appetizers",
        fr: "Apéritifs",
      },
    },
    {
      id: "pintxos",
      type: "food",
      icon: "🥘",
      order: 2,
      translations: {
        es: "Pintxos",
        eu: "Pintxoak",
        en: "Pintxos",
        fr: "Pintxos",
      },
    },
    {
      id: "brochetas",
      type: "food",
      icon: "�串",
      order: 3,
      translations: {
        es: "Brochetas",
        eu: "Brotxetak",
        en: "Skewers",
        fr: "Brochettes",
      },
    },
    {
      id: "para-compartir",
      type: "food",
      icon: "🍲",
      order: 4,
      translations: {
        es: "Para Compartir",
        eu: "Partekatzeko",
        en: "Sharing Plates",
        fr: "Plats à Partager",
      },
    },
    {
      id: "tostadas",
      type: "food",
      icon: "🍞",
      order: 5,
      translations: {
        es: "Tostas",
        eu: "Tostak",
        en: "Toasts",
        fr: "Tartines",
      },
    },
    {
      id: "sandwiches",
      type: "food",
      icon: "🥪",
      order: 6,
      translations: {
        es: "Sandwiches",
        eu: "Sandwiches",
        en: "Sandwiches",
        fr: "Sandwiches",
      },
    },
    {
      id: "hamburguesas",
      type: "food",
      icon: "🍔",
      order: 7,
      translations: {
        es: "Hamburguesas",
        eu: "Hanburgesak",
        en: "Burgers",
        fr: "Burgers",
      },
    },
    {
      id: "bocadillos",
      type: "food",
      icon: "🥖",
      order: 8,
      translations: {
        es: "Bocadillos",
        eu: "Ogitartekoak",
        en: "Baguettes",
        fr: "Sandwiches",
      },
    },
    {
      id: "ensaladas",
      type: "food",
      icon: "🥗",
      order: 9,
      translations: {
        es: "Ensaladas",
        eu: "Entxaladak",
        en: "Salads",
        fr: "Salades",
      },
    },
    {
      id: "platos-combinados",
      type: "food",
      icon: "🍽️",
      order: 10,
      translations: {
        es: "Platos Combinados",
        eu: "Plater Konbinatuak",
        en: "Combo Dishes",
        fr: "Plats Combinés",
      },
    },
    {
      id: "menu-del-dia",
      type: "food",
      icon: "📋",
      order: 11,
      translations: {
        es: "Menú del Día",
        eu: "Eguneko Menua",
        en: "Daily Menu",
        fr: "Menu du Jour",
      },
    },
    {
      id: "menu-infantil",
      type: "food",
      icon: "👶",
      order: 12,
      translations: {
        es: "Menú Infantil",
        eu: "Haurren Menua",
        en: "Kids Menu",
        fr: "Menu Enfant",
      },
    },
    {
      id: "postres",
      type: "food",
      icon: "🍰",
      order: 13,
      translations: {
        es: "Postres",
        eu: "Postreak",
        en: "Desserts",
        fr: "Desserts",
      },
    },
    {
      id: "cafes",
      type: "drink",
      icon: "☕",
      order: 14,
      translations: {
        es: "Cafés",
        eu: "Kafeak",
        en: "Coffees",
        fr: "Cafés",
      },
    },
    {
      id: "refrescos",
      type: "drink",
      icon: "🥤",
      order: 15,
      translations: {
        es: "Refrescos",
        eu: "Freskagarriak",
        en: "Soft Drinks",
        fr: "Rafraîchissements",
      },
    },
    {
      id: "cervezas",
      type: "drink",
      icon: "🍺",
      order: 16,
      translations: {
        es: "Cervezas",
        eu: "Garagardoak",
        en: "Beers",
        fr: "Bières",
      },
    },
    {
      id: "vinos",
      type: "drink",
      icon: "🍷",
      order: 17,
      translations: {
        es: "Vinos",
        eu: "Ardoak",
        en: "Wines",
        fr: "Vins",
      },
    },
    {
      id: "aperitivos",
      type: "drink",
      icon: "🥃",
      order: 18,
      translations: {
        es: "Aperitivos",
        eu: "Aperitiboak",
        en: "Aperitifs",
        fr: "Apéritifs",
      },
    },
    {
      id: "copas-licores",
      type: "drink",
      icon: "🍸",
      order: 19,
      translations: {
        es: "Copas y Licores",
        eu: "Kopak eta Likoreak",
        en: "Cocktails & Liquors",
        fr: "Cocktails et Liqueurs",
      },
    },
  ];
}

function createMenuItems(): MenuItem[] {
  // Aquí irían todos los items de la BD
  // Por ahora retornamos un array vacío que se poblará con los datos reales
  return [];
}

// Función para procesar datos SQL y convertirlos a JSON
function processSQLData(
  sqlData: any,
  categoryId: string,
  orderStart: number,
): MenuItem[] {
  return sqlData.map((row: any, index: number) => ({
    id: `${categoryId}-${String(row.id || index + 1).padStart(3, "0")}`,
    categoryId,
    translations: {
      es: {
        name: row.nombre_es,
        description: row.descripcion_es,
        extraDescription: row.descripcion_extra_es,
      },
      eu: {
        name: row.nombre_eusk,
        description: row.descripcion_eusk,
        extraDescription: row.descripcion_extra_eusk,
      },
      en: {
        name: row.nombre_eng,
        description: row.descripcion_eng,
        extraDescription: row.descripcion_extra_eng,
      },
      fr: {
        name: row.nombre_fr,
        description: row.descripcion_fr,
        extraDescription: row.descripcion_extra_fr,
      },
    },
    price: extractPrice(row),
    allergens: [],
    available: true,
    order: orderStart + index,
  }));
}

function extractPrice(row: any): Price {
  const price: Price = {};

  if (row.precio_unidad !== undefined) price.unit = Number(row.precio_unidad);
  if (row.precio_media_racion !== undefined)
    price.halfPortion = Number(row.precio_media_racion);
  if (row.precio_racion !== undefined)
    price.fullPortion = Number(row.precio_racion);
  if (row.precio !== undefined) price.standard = Number(row.precio);
  if (row.precio_pequenyo !== undefined)
    price.small = Number(row.precio_pequenyo);
  if (row.precio_grande !== undefined) price.large = Number(row.precio_grande);
  if (row.precio_copa !== undefined) price.glass = Number(row.precio_copa);
  if (row.precio_botella !== undefined)
    price.bottle = Number(row.precio_botella);

  return price;
}

// Ejecutar migración
if (require.main === module) {
  migrateData().catch(console.error);
}

export { migrateData, processSQLData, extractPrice };
