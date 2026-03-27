# 🚀 Configuración de Vercel Blob para el Menú

## ✅ Listo, ya está implementado!

Ahora solo necesitas configurarlo en Vercel. Sigue estos pasos:

---

## 📝 Pasos de Configuración

### 1️⃣ Crear Blob Storage en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Click en la pestaña **"Storage"**
3. Click en **"Create Database"** → **"Blob"**
4. Dale un nombre (ej: `barcachon-menu`)
5. Click **"Create"**

### 2️⃣ Copiar el Token

Después de crear el Blob, Vercel te mostrará:

- ✅ `BLOB_READ_WRITE_TOKEN` → Cópialo

### 3️⃣ Configurar Variables de Entorno en Vercel

En tu proyecto de Vercel:

1. Ve a **Settings** → **Environment Variables**
2. Agrega: `BLOB_READ_WRITE_TOKEN` con el valor que copiaste
3. Selecciona **Production**, **Preview**, y **Development**
4. Click **"Save"**

### 4️⃣ Subir el JSON Inicial

**Opción A: Desde tu máquina local**

```bash
# Agrega el token a tu .env.local
echo "BLOB_READ_WRITE_TOKEN=tu_token_aqui" >> .env.local

# Ejecuta el script
npx tsx scripts/upload-to-blob.ts
```

El script te dará una URL como:

```
https://xxxxx.public.blob.vercel-storage.com/menu-data.json
```

**Copia esa URL** y agrégala como variable de entorno en Vercel:

- Variable: `BLOB_URL`
- Valor: la URL que te dio el script

**Opción B: Desde el admin panel después del deploy**

1. Haz deploy del proyecto (`git push`)
2. Entra al admin panel en producción
3. Haz cualquier cambio pequeño y dale "Guardar"
4. El sistema creará automáticamente el blob y guardará la URL

### 5️⃣ Redeploy

```bash
git add .
git commit -m "feat: Implementar Vercel Blob storage"
git push
```

Vercel hará redeploy automático con las nuevas variables.

---

## ✨ ¡Listo!

Ahora tu panel de admin funcionará perfectamente en producción. Los cambios se guardan en Vercel Blob y persisten entre deploys.

---

## 🧪 Probar en Local

Si quieres probar en local con Blob (opcional):

```bash
# Instala Vercel CLI
npm i -g vercel

# Vincula tu proyecto
vercel link

# Descarga las env vars
vercel env pull .env.local

# Ejecuta en dev
npm run dev
```

---

## 🔍 Solución de Problemas

**Error: "No autorizado"**

- Verifica que hayas configurado `BLOB_READ_WRITE_TOKEN` en Vercel

**Error: "Cannot read blob"**

- Asegúrate de haber subido el JSON inicial con el script
- O haz un cambio desde el admin para crear el blob

**Funciona en desarrollo pero no en producción**

- Verifica que las variables estén en **Production** en Vercel
- Haz un nuevo deploy después de agregar las variables

---

## 📊 Costos

Vercel Blob Free Tier:

- ✅ 1 GB de almacenamiento
- ✅ 100 GB de transferencia/mes

Tu JSON actual: **~50 KB** → Súper holgado para años 😎
