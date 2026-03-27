# Solución: Problema de Sincronización con Vercel Blob

## Problema

Al actualizar el menú desde el panel de administración:

- El PUT a `/api/admin/menu` devolvía 200 OK ✅
- Pero el GET seguía devolviendo datos antiguos ❌

## Causa Raíz

El problema estaba en cómo se recuperaban los datos desde Vercel Blob:

1. **`list()` sin ordenación**: El código original usaba `list({ limit: 1 })` sin ordenar explícitamente los resultados
2. **Cache del navegador**: No se estaba usando cache-busting en las URLs
3. **Posibles múltiples versiones**: Si había varias versiones del archivo, no se garantizaba obtener la más reciente

## Solución Implementada

### 1. Ordenación Explícita por Fecha

```typescript
// Obtener lista con más elementos
const { blobs } = await list({
  prefix: BLOB_FILENAME,
  limit: 10,
});

// Ordenar por fecha de subida descendente
const sortedBlobs = blobs.sort(
  (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
);

const blobUrl = sortedBlobs[0].url; // El más reciente
```

### 2. Cache-Busting con Timestamp

```typescript
const timestamp = Date.now();
const urlWithCacheBuster = `${blobUrl}?t=${timestamp}`;
```

### 3. Headers Anti-Cache

```typescript
// En el GET del admin
return NextResponse.json(menuData, {
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
});
```

### 4. Revalidación de Rutas API

```typescript
revalidatePath("/api/menu");
revalidatePath("/api/admin/menu");
```

### 5. Configuración PUT Mejorada

```typescript
const blob = await put(BLOB_FILENAME, jsonString, {
  access: "public",
  addRandomSuffix: false,
  cacheControlMaxAge: 0, // No cachear
});
```

## Script de Diagnóstico

Se creó un script para diagnosticar y limpiar versiones antiguas:

```bash
# Ver estado de los blobs
npx tsx scripts/blob-cleanup.ts

# Limpiar versiones antiguas
npx tsx scripts/blob-cleanup.ts --delete
```

## Archivos Modificados

- `app/api/admin/menu/route.ts` - GET/PUT con ordenación y cache-busting
- `app/api/menu/route.ts` - GET público con la misma lógica
- `scripts/blob-cleanup.ts` - Script de diagnóstico y limpieza (nuevo)

## Verificación

Después del despliegue:

1. Hacer un cambio en el panel de admin
2. Verificar el PUT devuelve 200 OK con timestamp
3. Hacer GET a `/api/admin/menu` y verificar el cambio
4. Hacer GET a `/api/menu` (público) y verificar el cambio
5. Verificar en el frontend que los cambios aparecen

## Logs para Monitorear

El código ahora incluye logs detallados:

```
💾 Guardando en Vercel Blob...
✅ Blob guardado: https://...
📅 Timestamp: 2026-03-27T...
🔄 Rutas revalidadas

📥 Leyendo blob más reciente: https://...
📅 Subido en: 2026-03-27T...
```

## Problemas Conocidos

Si el problema persiste, ejecutar:

```bash
# Diagnosticar blobs
npx tsx scripts/blob-cleanup.ts

# Si hay múltiples versiones, limpiar
npx tsx scripts/blob-cleanup.ts --delete
```
