import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { validateAdminToken } from "@/lib/admin-auth";

const BLOB_FILENAME = "menu-data.json";
const LOCAL_MENU_DATA_PATH = path.join(process.cwd(), "lib", "menu-data.json");

// Middleware para verificar autenticación
function checkAuth(request: NextRequest) {
  const token = request.cookies.get("admin-token")?.value;
  if (!token || !validateAdminToken(token)) {
    return false;
  }
  return true;
}

// Verificar si estamos en modo producción con Blob
function isUsingBlob() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// GET - Obtener todos los datos del menú
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // En producción con Blob
    if (isUsingBlob()) {
      // Obtener la lista de blobs ordenada por fecha de subida (más reciente primero)
      const { blobs } = await list({
        prefix: BLOB_FILENAME,
        limit: 10, // Aumentar para ver todos los archivos
      });

      if (blobs.length === 0) {
        throw new Error(
          "No se encontró el archivo menu-data.json en Vercel Blob",
        );
      }

      // Ordenar por fecha de subida descendente (más reciente primero)
      const sortedBlobs = blobs.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      );

      const blobUrl = sortedBlobs[0].url;

      console.log(`📥 Leyendo blob más reciente: ${blobUrl}`);
      console.log(`📅 Subido en: ${sortedBlobs[0].uploadedAt}`);

      // Añadir timestamp para evitar cache del navegador
      const timestamp = Date.now();
      const urlWithCacheBuster = `${blobUrl}?t=${timestamp}`;

      const response = await fetch(urlWithCacheBuster, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (response.ok) {
        const menuData = await response.json();
        return NextResponse.json(menuData, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });
      }

      throw new Error(
        `Blob fetch failed: ${response.status} ${response.statusText}`,
      );
    }

    // Desarrollo: leer archivo local
    const fileContent = await fs.readFile(LOCAL_MENU_DATA_PATH, "utf-8");
    const menuData = JSON.parse(fileContent);
    return NextResponse.json(menuData, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error al leer menu-data:", error);
    return NextResponse.json(
      {
        error: "Error al cargar los datos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// PUT - Actualizar todo el archivo JSON
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const jsonString = JSON.stringify(body, null, 2);

    // Producción con Vercel Blob
    if (isUsingBlob()) {
      console.log("💾 Guardando en Vercel Blob...");

      const blob = await put(BLOB_FILENAME, jsonString, {
        access: "public",
        addRandomSuffix: false,
        cacheControlMaxAge: 0, // No cachear
      });

      console.log("✅ Blob guardado:", blob.url);
      console.log("📅 Timestamp:", new Date().toISOString());

      // Revalidar todas las rutas que dependen del menú
      revalidatePath("/[locale]", "layout");
      revalidatePath("/[locale]/menu", "page");
      revalidatePath("/[locale]/menu/[category]", "page");
      revalidatePath("/[locale]/daily-menu", "page");
      revalidatePath("/[locale]/drinks", "page");
      revalidatePath("/api/menu");
      revalidatePath("/api/admin/menu");

      console.log("🔄 Rutas revalidadas");

      return NextResponse.json({
        success: true,
        message: "Datos guardados correctamente en Vercel Blob",
        blobUrl: blob.url,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Desarrollo: guardar en archivo local
      console.log("💾 Guardando en archivo local...");

      await fs.writeFile(LOCAL_MENU_DATA_PATH, jsonString, "utf-8");

      console.log("✅ Archivo local guardado");

      // Revalidar todas las rutas que dependen del menú
      revalidatePath("/[locale]", "layout");
      revalidatePath("/[locale]/menu", "page");
      revalidatePath("/[locale]/menu/[category]", "page");
      revalidatePath("/[locale]/daily-menu", "page");
      revalidatePath("/[locale]/drinks", "page");

      console.log("🔄 Rutas revalidadas");

      return NextResponse.json({
        success: true,
        message: "Datos guardados correctamente (modo desarrollo)",
      });
    }
  } catch (error) {
    console.error("❌ Error al guardar menu-data:", error);

    // Devolver detalles del error para debugging
    return NextResponse.json(
      {
        error: "Error al guardar los datos",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
