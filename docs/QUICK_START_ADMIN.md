# 🚀 Inicio Rápido - Panel de Administración

## ✅ Sistema Completado

El panel de administración está **100% funcional** y listo para usar.

## 🔐 Acceder al Panel

1. **Iniciar el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

2. **Abrir el navegador en:**

   ```
   http://localhost:3000/admin/login
   ```

3. **Credenciales de acceso:**
   - Usuario: `admin`
   - Contraseña: `cachon2024`

## 📋 Funcionalidades Disponibles

### ✅ Dashboard Principal (`/admin/dashboard`)

- Vista general con acceso a todas las secciones
- Cards clicables para cada módulo

### ✅ Gestión de Categorías (`/admin/dashboard/categories`)

- Ver todas las categorías organizadas por secciones (Carta, Bebidas)
- Crear nuevas categorías
- Editar:
  - ID, Icono, Orden
  - Traducciones en 4 idiomas (🇪🇸 🏴 🇬🇧 🇫🇷)
- Eliminar categorías
- Guardar cambios en JSON

### ✅ Gestión de Items (`/admin/dashboard/items`)

- Listar, buscar y filtrar todos los items
- Crear/Editar items con modal completo:
  - Identificación (ID, Categoría)
  - Traducciones completas (nombre + descripción en 4 idiomas)
  - 4 tipos de precios (unidad, media ración, ración, estándar)
  - Alérgenos
  - Disponibilidad y destacados
- Eliminar items
- Activar/desactivar disponibilidad rápidamente

### ✅ Menú del Día (`/admin/dashboard/daily-menu`)

- Configurar precio y fecha
- Gestionar primeros platos
- Gestionar segundos platos
- Gestionar postres
- Traducciones en español y euskera

### ✅ Gestión de Precios (`/admin/dashboard/prices`)

- Ver todos los precios en tabla
- Aplicar cambio porcentual masivo
- Editar precios individuales
- Vista comparativa antes de guardar

### ✅ Backup (`/admin/dashboard/backup`)

- Descargar backup completo en JSON
- Restaurar desde archivo JSON
- Backups automáticos al guardar

## 🎯 Casos de Uso Comunes

### Añadir un nuevo plato

1. Login → "Items del Menú"
2. Click "+ Nuevo Item"
3. Rellenar formulario (ID, categoría, nombres, precios)
4. "Guardar Item" → "Guardar Cambios"

### Cambiar precios en 5%

1. Login → "Precios"
2. Escribir `5` en porcentaje
3. "Aplicar Cambio"
4. Revisar → "Guardar Cambios"

### Desactivar un plato temporalmente

1. Login → "Items del Menú"
2. Buscar el item
3. Click "Desactivar"
4. "Guardar Cambios"

### Actualizar el menú del día

1. Login → "Menú del Día"
2. Cambiar primeros/segundos/postres
3. "Guardar Cambios"

## 🔒 Seguridad

### ⚠️ IMPORTANTE para producción:

**Cambiar la contraseña hardcodeada:**

Editar el archivo `lib/admin-auth.ts`:

```typescript
export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "TU_CONTRASEÑA_SEGURA", // ← Cambiar esto
};
```

### Recomendaciones adicionales:

- Usar variables de entorno en producción
- Implementar hash de contraseñas (bcrypt)
- HTTPS obligatorio
- Rate limiting en el login
- Logs de auditoría

## 💾 Sistema de Backups

### Backups Automáticos

- Se crean automáticamente antes de cada guardado
- Ubicación: `lib/menu-data.backup.[timestamp].json`
- Formato: `menu-data.backup.1234567890.json`

### Backups Manuales

- Usar la opción "Descargar Backup" en el panel
- Guardar en un lugar seguro
- Crear backups semanales recomendado

## 🎨 Diseño

- Estilo coherente: Negro y blanco
- Responsive design
- Formularios accesibles
- Efectos hover elegantes
- Bordes sólidos característicos de Bar Cachón

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Desktop y tablet
- ⚠️ Móvil (funcional pero mejor en tablet/desktop)

## 🐛 Solución de Problemas

### "No autorizado" al acceder

- Verificar que iniciaste sesión
- La sesión dura 24 horas
- Cerrar sesión y volver a entrar

### Los cambios no se guardan

- Verificar permisos del archivo `menu-data.json`
- Ver la consola del navegador (F12)
- Verificar que el JSON es válido

### No aparecen las categorías

- Verificar `menu-data.json` tiene estructura correcta
- Recargar la página
- Revisar console para errores

## 📖 Documentación Completa

Ver `docs/ADMIN_PANEL.md` para documentación técnica detallada.

## 🚀 Siguiente Paso

```bash
npm run dev
```

Luego abrir: **http://localhost:3000/admin/login**

---

**¿Necesitas ayuda?** Revisa `docs/ADMIN_PANEL.md` o la documentación del README.md
