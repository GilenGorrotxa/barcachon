# Bar Cachón - Menú Digital

Proyecto de migración del menú del Bar Cachón a Next.js con TypeScript, Tailwind CSS y sistema multiidioma.

## 🚀 Tecnologías

- **Next.js 14** (App Router + Turbopack)
- **React 18**
- **TypeScript**
- **Tailwind CSS** (v4)
- **next-intl** - Sistema multiidioma (ES, EU, EN, FR)
- **shadcn/ui** - Componentes UI
- **Zustand** - Gestión de estado
- **Zod** - Validación de datos

## 📁 Estructura del Proyecto

```
barcachon/
├── app/
│   ├── [locale]/              # Rutas internacionalizadas
│   │   ├── layout.tsx         # Layout con next-intl
│   │   └── page.tsx           # Página principal
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Redirect al idioma por defecto
├── components/
│   ├── Header.tsx             # Cabecera con navegación
│   ├── LanguageSelector.tsx   # Selector de idiomas
│   └── MenuCard.tsx           # Tarjeta de item del menú
├── lib/
│   ├── menu-data.json         # "Base de datos" del menú
│   ├── types.ts               # Tipos TypeScript
│   └── utils.ts               # Utilidades
├── messages/                  # Traducciones UI
│   ├── es.json
│   ├── eu.json
│   ├── en.json
│   └── fr.json
├── public/
│   └── images/                # Logos, QR codes, etc.
├── i18n.ts                    # Configuración next-intl
└── middleware.ts              # Middleware de routing
```

## 🌐 Idiomas Soportados

- 🇪🇸 **Español** (es) - Por defecto
- 🏴 **Euskera** (eu)
- 🇬🇧 **English** (en)
- 🇫🇷 **Français** (fr)

## 📋 Estructura de Datos

### Categorías del Menú

**Comida:**

- Para Picar
- Pintxos
- Brochetas
- Para Compartir
- Tostas
- Sandwiches
- Hamburguesas
- Bocadillos
- Ensaladas
- Platos Combinados
- Postres

**Bebidas:**

- Cafés
- Refrescos
- Cervezas
- Vinos
- Aperitivos
- Copas y Licores

### Formato de Items

```typescript
{
  "id": "item-001",
  "categoryId": "para-picar",
  "translations": {
    "es": { "name": "Patatas Bravas", "description": "..." },
    "eu": { "name": "Patata Bravak", "description": "..." },
    "en": { "name": "Spicy Potatoes", "description": "..." },
    "fr": { "name": "Pommes de Terre Épicées", "description": "..." }
  },
  "price": {
    "unit": 2.5,           // Unidad
    "halfPortion": 4.0,    // Media ración
    "fullPortion": 6.5,    // Ración completa
    "standard": 10.0       // Precio estándar
  },
  "allergens": ["gluten"],
  "available": true,
  "order": 1
}
```

## 🛠️ Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Construir
npm run build

# Producción
npm start

# Linting
npm run lint
```

## ✅ FASE 1 - COMPLETADA

- [x] Proyecto Next.js + TypeScript + Tailwind configurado
- [x] shadcn/ui instalado y configurado
- [x] next-intl configurado con 4 idiomas
- [x] Estructura de datos JSON creada
- [x] Tipos TypeScript definidos
- [x] Componentes base creados (Header, LanguageSelector, MenuCard)
- [x] Layout y página principal implementados
- [x] Middleware de routing configurado
- [x] Build exitoso ✓

## 📝 Próximos Pasos (FASE 2)

### Menú Público

- [ ] Página de categorías `/[locale]/menu`
- [ ] Página de bebidas `/[locale]/drinks`
- [ ] Página de menú del día `/[locale]/daily-menu`
- [ ] Sistema de tabs para navegación entre categorías
- [ ] Filtros y búsqueda
- [ ] Diseño responsive optimizado
- [ ] Animaciones Tailwind

### FASE 3 - Admin Panel ✅ COMPLETADA

- [x] Login `/admin/login` con autenticación simple
- [x] Dashboard `/admin/dashboard` con vista general
- [x] CRUD completo de categorías `/admin/dashboard/categories`
- [x] CRUD completo de items del menú `/admin/dashboard/items`
- [x] Gestión de menú del día `/admin/dashboard/daily-menu`
- [x] Gestión masiva de precios `/admin/dashboard/prices`
- [x] Sistema de backup y restauración `/admin/dashboard/backup`
- [x] Editor multiidioma integrado (ES, EU, EN, FR)
- [x] Guardar cambios en `menu-data.json` con backups automáticos

### FASE 4 - Deploy

- [ ] Optimización de imágenes
- [ ] Meta tags SEO
- [ ] Testing en móviles
- [ ] Deploy en Vercel
- [ ] Configuración de dominio

## 🔗 URLs

### Público

- **Desarrollo:** http://localhost:3000
- **Producción:** TBD (Vercel)

### Panel de Administración

- **Login Admin:** http://localhost:3000/admin/login
- **Dashboard:** http://localhost:3000/admin/dashboard
- **Credenciales por defecto:**
  - Usuario: `barcachon`
  - Contraseña: `Martuneta69` (cambiar en `lib/admin-auth.ts`)

## 📄 Datos Antiguos

Los datos del sistema PHP antiguo están en `c:\Users\gilen\Downloads\public_html\`

## 🎨 Diseño

El diseño replica el estilo del sitio actual https://barcachon.com/ con:

- Fuente Raleway
- Colores: Negro (#000000) + Blanco (#FFFFFF)
- Botones con border sólido
- Hover states con inversión de colores
- Layout limpio y minimalista

## 📞 Soporte

Para dudas o problemas, referirse a la documentación oficial:

- [Next.js](https://nextjs.org/docs)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
