# Panel de Administración - Bar Cachón

## 🔐 Acceso

**URL:** `/admin/login`

**Credenciales por defecto:**

- Usuario: `admin`
- Contraseña: `cachon2024`

> ⚠️ **IMPORTANTE:** Cambiar la contraseña en `lib/admin-auth.ts` antes de poner en producción.

## 📋 Características

### 1. Dashboard Principal (`/admin/dashboard`)

Vista general con acceso rápido a todas las secciones:

- **Categorías:** Gestión de categorías del menú
- **Items del Menú:** CRUD completo de platos y bebidas
- **Menú del Día:** Configuración diaria de primeros, segundos y postres
- **Traducciones:** Acceso a edición multiidioma
- **Precios:** Actualización masiva de precios
- **Backup:** Copias de seguridad y restauración

### 2. Gestión de Categorías (`/admin/dashboard/categories`)

**Funcionalidades:**

- ✅ Ver todas las categorías organizadas por secciones
- ✅ Crear nuevas categorías
- ✅ Editar categorías existentes:
  - ID
  - Icono (emoji)
  - Orden de visualización
  - Traducciones en 4 idiomas (ES, EU, EN, FR)
- ✅ Eliminar categorías
- ✅ Guardar cambios en JSON

**Campos editables:**

- `id`: Identificador único
- `icon`: Emoji para la categoría
- `order`: Orden de visualización
- `translations.es`: Nombre en español
- `translations.eu`: Nombre en euskera
- `translations.en`: Nombre en inglés
- `translations.fr`: Nombre en francés

### 3. Gestión de Items (`/admin/dashboard/items`)

**Funcionalidades:**

- ✅ Listar todos los items del menú
- ✅ Buscar por nombre o ID
- ✅ Filtrar por categoría
- ✅ Crear nuevos items
- ✅ Editar items existentes con modal completo
- ✅ Eliminar items
- ✅ Activar/Desactivar disponibilidad
- ✅ Marcar como destacado

**Modal de edición incluye:**

- **Identificación:**
  - ID único
  - Categoría (selector)
- **Traducciones (4 idiomas):**
  - Nombre
  - Descripción
- **Precios:**
  - Unidad
  - Media ración
  - Ración completa
  - Estándar
- **Opciones:**
  - Alérgenos (separados por comas)
  - Disponible (checkbox)
  - Destacado (checkbox)
  - Orden de visualización

### 4. Menú del Día (`/admin/dashboard/daily-menu`)

**Funcionalidades:**

- ✅ Configurar precio del menú
- ✅ Establecer fecha
- ✅ Activar/Desactivar menú
- ✅ Gestionar primeros platos
- ✅ Gestionar segundos platos
- ✅ Gestionar postres
- ✅ Traducciones en español y euskera para cada plato

### 5. Gestión de Precios (`/admin/dashboard/prices`)

**Funcionalidades:**

- ✅ Ver todos los precios actuales
- ✅ Aplicar cambio porcentual masivo (aumentar/reducir)
- ✅ Editar precios individualmente
- ✅ Vista comparativa: precio actual vs nuevo precio
- ✅ Marcado visual de items modificados
- ✅ Resetear cambios antes de guardar

**Ejemplo de uso:**

1. Escribir `5` en el campo de porcentaje
2. Click en "Aplicar Cambio"
3. Todos los precios se incrementan un 5%
4. Revisar cambios
5. Guardar o resetear

### 6. Backup y Restauración (`/admin/dashboard/backup`)

**Funcionalidades:**

- ✅ Descargar backup completo en JSON
- ✅ Restaurar desde archivo JSON
- ✅ Backups automáticos al guardar cambios
- ✅ Advertencias de seguridad

**Backups automáticos:**

- Se crean en `lib/menu-data.backup.[timestamp].json`
- Se generan automáticamente antes de cada guardado
- Formato: `menu-data.backup.1234567890.json`

## 🔧 Arquitectura Técnica

### Autenticación

**Archivo:** `lib/admin-auth.ts`

- Login basado en cookies HTTP-only
- Tokens con validez de 24 horas
- Validación de credenciales hardcodeadas (cambiar en producción)

### API Routes

**`/api/admin/login` (POST)**

- Valida credenciales
- Crea token de sesión
- Establece cookie segura

**`/api/admin/logout` (POST)**

- Elimina cookie de sesión

**`/api/admin/menu` (GET)**

- Requiere autenticación
- Devuelve todo el contenido de `menu-data.json`

**`/api/admin/menu` (PUT)**

- Requiere autenticación
- Crea backup automático
- Guarda cambios en `menu-data.json`
- Formato JSON pretty-print (2 espacios)

### Protección de Rutas

**Archivo:** `app/admin/layout.tsx`

- Verifica autenticación en cada carga
- Redirección automática a `/admin/login` si no está autenticado
- Excepto para la página de login

## 🎨 Diseño

**Estilo coherente con el resto del sitio:**

- Colores: Negro y blanco
- Bordes sólidos de 2px
- Efectos hover con inversión de colores
- Responsive design
- Formularios accesibles

## 📝 Flujo de Trabajo Típico

### Añadir un nuevo plato:

1. Login en `/admin/login`
2. Ir a "Items del Menú"
3. Click en "+ Nuevo Item"
4. Rellenar:
   - ID (ej: `pintxos-011`)
   - Seleccionar categoría
   - Nombres en 4 idiomas
   - Descripciones
   - Precios
   - Alérgenos
5. Click en "Guardar Item"
6. Click en "Guardar Cambios" (verde)

### Actualizar precios masivamente:

1. Ir a "Precios"
2. Escribir porcentaje (ej: `3.5` para +3.5%)
3. Click en "Aplicar Cambio"
4. Revisar cambios en la tabla
5. Ajustar manualmente si es necesario
6. Click en "Guardar Cambios"

### Cambiar categoría de un item:

1. Ir a "Items del Menú"
2. Buscar el item
3. Click en "Editar"
4. Cambiar la categoría en el selector
5. "Guardar Item" → "Guardar Cambios"

## 🔒 Seguridad

### Recomendaciones para producción:

1. **Cambiar contraseña hardcodeada:**

   ```typescript
   // lib/admin-auth.ts
   export const ADMIN_CREDENTIALS = {
     username: "admin",
     password: "TU_CONTRASEÑA_SEGURA", // Cambiar
   };
   ```

2. **Usar variables de entorno:**

   ```env
   ADMIN_USERNAME=tu_usuario
   ADMIN_PASSWORD=contraseña_segura_hash
   ```

3. **Implementar hash de contraseñas:**
   - Usar bcrypt o similar
   - Nunca guardar contraseñas en texto plano

4. **HTTPS obligatorio:**
   - Las cookies solo se marcan como `secure` en producción
   - Asegurarse de que el dominio use HTTPS

5. **Rate limiting:**
   - Limitar intentos de login
   - Bloquear IPs después de X intentos fallidos

6. **Logs de auditoría:**
   - Registrar cambios en el menú
   - Guardar quién y cuándo se modificó

## 🐛 Troubleshooting

### "No autorizado" al acceder al admin

**Solución:**

- Verificar que iniciaste sesión en `/admin/login`
- Verificar que la cookie no ha expirado (24h)
- Cerrar sesión y volver a iniciar

### Los cambios no se guardan

**Posibles causas:**

1. Permisos de escritura en `lib/menu-data.json`
2. Error en el formato JSON
3. Sesión expirada

**Solución:**

- Revisar la consola del navegador (F12)
- Verificar permisos del archivo
- Verificar que el JSON es válido

### No aparecen las categorías en el selector

**Solución:**

- Verificar que existen categorías en `menu-data.json`
- Recargar la página
- Verificar la estructura del JSON

### Error al restaurar backup

**Solución:**

- Verificar que el archivo JSON es válido
- Verificar que tiene la estructura correcta
- Usar un backup generado por el sistema

## 📊 Estructura del JSON

```json
{
  "navigation": {
    "mainSections": [
      {
        "id": "carta",
        "type": "food",
        "categories": [...]
      }
    ]
  },
  "items": [...],
  "dailyMenu": {...}
}
```

## 🚀 Próximas Mejoras

**Potenciales características futuras:**

- [ ] Sistema de usuarios múltiples
- [ ] Roles y permisos
- [ ] Historial de cambios
- [ ] Previsualización en vivo
- [ ] Upload de imágenes
- [ ] Estadísticas de items más pedidos
- [ ] Exportar/Importar Excel
- [ ] Notificaciones push para cambios
- [ ] Multi-tenancy para múltiples bares

## 📞 Soporte

Para consultas sobre el panel de administración, revisar:

- Este documento
- Código fuente en `app/admin/`
- API routes en `app/api/admin/`
- Configuración de auth en `lib/admin-auth.ts`
