# 📋 Propuesta de Estructura de Datos - Bar Cachón

## 🎯 Objetivo

Diseñar una estructura de datos eficiente, escalable y fácil de mantener que refleje la organización real del sitio web.

## 🔍 Análisis de Requisitos

### Navegación del Sitio

1. **Nivel 1**: Secciones Principales (Carta, Bebidas, Menú)
2. **Nivel 2**: Categorías (Pintxos, Hamburguesas, Cafés, etc.)
3. **Nivel 3**: Items individuales

### Tipos de Precios Identificados

- **Precio único**: `5.5 €` (mayoría de platos)
- **Unidad + Ración**: `3.4 € / 8.9 €` (pintxos)
- **Pequeño + Grande**: `2.90 € / 3.40 €` (cervezas)
- **Copa + Botella**: `2.0 € / 12.5 €` (vinos)
- **Con extras opcionales**: `+0.50€`, `+1€`

### Características Especiales

- ✅ Multi-idioma (4 idiomas: es, eu, en, fr)
- ✅ Descripciones opcionales
- ✅ Extras/opciones con precio adicional
- ✅ Control de disponibilidad
- ✅ Items destacados
- ✅ Orden personalizado

---

## 🏗️ Estructura Propuesta

### Opción A: JSON Jerárquico (Recomendado para este caso)

```typescript
interface MenuData {
  mainSections: MainSection[];
  metadata: Metadata;
}

interface MainSection {
  id: string; // 'carta', 'bebidas', 'menu'
  type: "food" | "drink" | "menu";
  icon: string;
  order: number;
  translations: MultiLangText;
  categories: Category[]; // Categorías anidadas
}

interface Category {
  id: string; // 'pintxos', 'hamburguesas', etc.
  icon: string;
  order: number;
  translations: MultiLangText;
  items: MenuItem[]; // Items anidados
}

interface MenuItem {
  id: string;
  slug: string; // URL-friendly
  translations: MultiLangItem;
  pricing: PricingConfig;
  options?: ItemOption[]; // Extras opcionales
  allergens?: string[];
  tags?: string[]; // 'vegetarian', 'spicy', 'new', etc.
  image?: string;
  available: boolean;
  featured: boolean;
  order: number;
}

interface MultiLangItem {
  [locale: string]: {
    name: string;
    description?: string;
    extras?: string; // Texto de extras/opciones
  };
}

interface PricingConfig {
  type: "single" | "unit-portion" | "small-large" | "glass-bottle";
  currency: string; // 'EUR'
  values: {
    single?: number; // Precio único
    unit?: number; // Precio unidad
    portion?: number; // Precio ración
    halfPortion?: number; // Media ración
    small?: number; // Pequeño
    large?: number; // Grande
    glass?: number; // Copa
    bottle?: number; // Botella
  };
}

interface ItemOption {
  id: string;
  translations: MultiLangText;
  priceModifier: number; // +0.50, +1.00, etc.
  type: "add" | "replace";
}

interface MultiLangText {
  es: string;
  eu: string;
  en: string;
  fr: string;
}

interface Metadata {
  version: string;
  lastUpdated: string;
  languages: string[];
  defaultLanguage: string;
}
```

**Ventajas:**
✅ Estructura jerárquica clara que refleja la navegación
✅ Fácil de recorrer y renderizar
✅ Un solo archivo, fácil de versionar
✅ Ideal para sitios estáticos/SSG
✅ No requiere BD para cambios

**Desventajas:**
❌ Archivo grande si hay muchos items
❌ Difícil de editar para no-técnicos

---

### Opción B: JSON Normalizado (Relacional)

```typescript
interface MenuData {
  mainSections: MainSection[];
  categories: Category[];
  items: MenuItem[];
  metadata: Metadata;
}

interface MainSection {
  id: string;
  type: "food" | "drink" | "menu";
  icon: string;
  order: number;
  translations: MultiLangText;
  categoryIds: string[]; // Referencias a categorías
}

interface Category {
  id: string;
  mainSectionId: string; // FK a mainSection
  icon: string;
  order: number;
  translations: MultiLangText;
}

interface MenuItem {
  id: string;
  categoryId: string; // FK a category
  // ... resto igual que Opción A
}
```

**Ventajas:**
✅ Fácil de actualizar items sin duplicación
✅ Queries más eficientes
✅ Fácil migrar a BD después
✅ Menos redundancia

**Desventajas:**
❌ Requiere joins/lookups en el código
❌ Más complejo de renderizar

---

### Opción C: Híbrida (RECOMENDADA ⭐)

Combina lo mejor de ambas:

- **Estructura jerárquica** para navegación
- **Items normalizados** para facilitar gestión

```typescript
interface MenuData {
  navigation: NavigationStructure;
  items: Record<string, MenuItem>;
  metadata: Metadata;
}

interface NavigationStructure {
  mainSections: MainSectionNav[];
}

interface MainSectionNav {
  id: string;
  type: "food" | "drink" | "menu";
  icon: string;
  order: number;
  translations: MultiLangText;
  categories: CategoryNav[];
}

interface CategoryNav {
  id: string;
  icon: string;
  order: number;
  translations: MultiLangText;
  itemIds: string[]; // Referencias a items
}

interface MenuItem {
  id: string;
  slug: string;
  categoryId: string;
  mainSectionId: string;
  translations: MultiLangItem;
  pricing: PricingConfig;
  options?: ItemOption[];
  allergens?: string[];
  tags?: string[];
  image?: string;
  available: boolean;
  featured: boolean;
  order: number;
}
```

**Ventajas:**
✅ Navegación jerárquica clara
✅ Items fáciles de actualizar
✅ Búsqueda rápida por ID
✅ Flexible y escalable
✅ Permite filtros y búsquedas eficientes

---

## 📝 Ejemplo Práctico

```json
{
  "navigation": {
    "mainSections": [
      {
        "id": "carta",
        "type": "food",
        "icon": "🍽️",
        "order": 1,
        "translations": {
          "es": "Carta",
          "eu": "Karta",
          "en": "Menu",
          "fr": "Carte"
        },
        "categories": [
          {
            "id": "pintxos",
            "icon": "🥘",
            "order": 1,
            "translations": {
              "es": "Pintxos",
              "eu": "Pintxoak",
              "en": "Pintxos",
              "fr": "Pintxos"
            },
            "itemIds": ["pintxo-001", "pintxo-002", "pintxo-003"]
          }
        ]
      }
    ]
  },
  "items": {
    "pintxo-001": {
      "id": "pintxo-001",
      "slug": "cachoncitos",
      "categoryId": "pintxos",
      "mainSectionId": "carta",
      "translations": {
        "es": {
          "name": "Cachoncitos",
          "description": "Pechuga de pollo, pim. verde, queso y bechamel"
        },
        "eu": {
          "name": "Katxon txikiak",
          "description": "Oilasko bularkia, piper berdea, gazta eta bexamel"
        },
        "en": {
          "name": "Cachoncitos",
          "description": "Chicken with green pepper, cheese and bechamel"
        },
        "fr": {
          "name": "Cachoncitos",
          "description": "Blanc de poulet, poivron vert, fromage et béchamel"
        }
      },
      "pricing": {
        "type": "unit-portion",
        "currency": "EUR",
        "values": {
          "portion": 3.9
        }
      },
      "allergens": ["dairy", "gluten"],
      "tags": ["signature"],
      "available": true,
      "featured": false,
      "order": 1
    },
    "bocadillo-001": {
      "id": "bocadillo-001",
      "slug": "a-tu-gusto",
      "categoryId": "bocadillos",
      "mainSectionId": "carta",
      "translations": {
        "es": {
          "name": "A tu gusto",
          "description": "Pollo o Lomo. Añadir extras por 0,50€ (Queso/pimientos/setas/bacon)",
          "extras": "+ Queso/pimientos/setas/bacon"
        },
        "eu": {
          "name": "Zure guztokoa",
          "description": "Oilasko - Solomo - Hirugiharra. Gehitu estrak 0,50 euroren truke",
          "extras": "+ Gazta/piperrak/perretxikoak"
        }
      },
      "pricing": {
        "type": "single",
        "currency": "EUR",
        "values": {
          "single": 5.5
        }
      },
      "options": [
        {
          "id": "opt-queso",
          "translations": {
            "es": "Queso",
            "eu": "Gazta",
            "en": "Cheese",
            "fr": "Fromage"
          },
          "priceModifier": 0.5,
          "type": "add"
        },
        {
          "id": "opt-pimientos",
          "translations": {
            "es": "Pimientos",
            "eu": "Piperrak",
            "en": "Peppers",
            "fr": "Poivrons"
          },
          "priceModifier": 0.5,
          "type": "add"
        }
      ],
      "available": true,
      "featured": false,
      "order": 1
    }
  },
  "metadata": {
    "version": "2.0.0",
    "lastUpdated": "2026-03-26T00:00:00Z",
    "languages": ["es", "eu", "en", "fr"],
    "defaultLanguage": "es"
  }
}
```

---

## 🎨 Beneficios de la Estructura Híbrida

### Para Desarrollo

- ✅ Fácil de iterar en el render (sigue el árbol de navegación)
- ✅ Items fáciles de buscar/filtrar por ID
- ✅ TypeScript proporciona validación completa
- ✅ Fácil implementar búsqueda global

### Para Mantenimiento

- ✅ Agregar categoría = agregar nodo en navigation + items
- ✅ Modificar item = cambiar solo en un lugar
- ✅ Reorganizar = cambiar solo el array itemIds
- ✅ Multi-idioma centralizado

### Para Escalabilidad

- ✅ Fácil migrar a CMS después
- ✅ Puede generarse desde BD
- ✅ Permite caché granular
- ✅ Compatible con ISR/SSG de Next.js

---

## 🔄 Estrategia de Migración

1. **Fase 1**: Generar JSON híbrido desde SQL
2. **Fase 2**: Implementar TypeScript types
3. **Fase 3**: Crear utilidades de acceso (hooks/functions)
4. **Fase 4**: Migrar componentes a nueva estructura
5. **Fase 5** (futuro): Migrar a CMS como Sanity/Strapi si se necesita

---

## 💡 Recomendación Final

**Usar Estructura Híbrida (Opción C)** porque:

1. ✅ Representa fielmente la navegación del sitio
2. ✅ Flexible para diferentes tipos de precios
3. ✅ Fácil de mantener sin BD
4. ✅ Óptima para Next.js con SSG
5. ✅ Preparada para escalar a CMS después

¿Procedemos con esta estructura?
