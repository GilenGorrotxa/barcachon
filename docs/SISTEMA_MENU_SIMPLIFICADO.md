# Sistema de Menú Simplificado

## 🎯 Cómo funciona

El sistema funciona de manera **híbrida** para ser compatible con Vercel:

### 📍 DESARROLLO (localhost)

- **Admin guarda** → Escribe en `lib/menu-data.json`
- **Páginas leen** → Directamente del archivo local
- **Renderizado** → Dinámico (`force-dynamic`) para reflejar cambios inmediatos

### ☁️ PRODUCCIÓN (Vercel)

- **Admin guarda** → Escribe en **Vercel Blob Storage** (filesystem es read-only)
- **Páginas leen** → Desde la API → que lee del **Blob Storage**
- **Renderizado** → Dinámico (`force-dynamic`) para leer siempre del Blob actualizado

**⚠️ IMPORTANTE**: Las páginas usan `force-dynamic` porque:

- Sin esto, las páginas se generan en build time y quedan congeladas
- Con `force-dynamic`, se generan en cada request y leen del Blob actualizado
- Esto es necesario porque el filesystem en Vercel es de solo lectura en producción

---

## ⚙️ Configuración requerida

### Variables de entorno en Vercel:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx  # Token de Vercel Blob
NEXT_PUBLIC_BASE_URL=https://tudominio.com
ADMIN_PASSWORD=tu_password_seguro
```

---

## 🔄 Flujo de actualización

### En PRODUCCIÓN (Vercel):

1. **Admin edita el menú** en `/admin/dashboard/*`
2. **Guarda los cambios** → Se escribe en **Vercel Blob Storage**
3. **Usuario visita la página** → La página se genera dinámicamente
4. **getMenuData()** → Hace fetch a `/api/menu` → Lee del Blob
5. **Los cambios aparecen** inmediatamente en la próxima visita

### En DESARROLLO:

1. **Admin edita el menú** en `/admin/dashboard/*`
2. **Guarda los cambios** → Se escribe en `lib/menu-data.json`
3. **getMenuData()** → Lee directamente del archivo local
4. **Los cambios aparecen** inmediatamente

---

## ✅ Ventajas

- ✅ **Simple**: Un solo archivo JSON como fuente de verdad
- ✅ **Compatible con Vercel**: Usa Blob Storage en producción
- ✅ **Funciona local**: Desarrollo sin necesidad de Blob
- ✅ **Actualización inmediata**: `force-dynamic` garantiza datos frescos
- ✅ **Sin base de datos**: Todo en un JSON

---

## 🐛 Resolución de problemas

### Los cambios no aparecen en la carta digital

**En PRODUCCIÓN:**

1. Verifica que `BLOB_READ_WRITE_TOKEN` esté configurado
2. Verifica en los logs de Vercel que el guardado fue exitoso
3. Verifica en los logs que `getMenuData()` dice "✅ Menú cargado desde Blob"
4. Si dice "📁 Menú cargado desde archivo local", el Blob no está configurado

**En DESARROLLO:**

1. Verifica que el archivo `lib/menu-data.json` se haya actualizado
2. Recarga la página con Ctrl+Shift+R

### Error al guardar en producción

- Verifica que `BLOB_READ_WRITE_TOKEN` esté configurado en Vercel
- Verifica que el token tenga permisos de escritura
- Revisa los logs de Vercel para ver el error exacto

### Performance en producción

- Las páginas se generan en cada request (por `force-dynamic`)
- Esto es necesario para leer siempre del Blob actualizado
- Vercel cachea las respuestas automáticamente en su CDN
- El rendimiento sigue siendo muy bueno gracias al edge caching
