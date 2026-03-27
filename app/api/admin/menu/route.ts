import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { validateAdminToken } from "@/lib/admin-auth";

const LOCAL_MENU_DATA_PATH = path.join(process.cwd(), "lib", "menu-data.json");
const BLOB_FILENAME = "menu-data.json";

// Verificar si estamos en producción (Vercel)
const isProduction = () => !!process.env.BLOB_READ_WRITE_TOKEN;

// Middleware para verificar autenticación
function checkAuth(request: NextRequest) {
  const token = request.cookies.get("admin-token")?.value;
  if (!token || !validateAdminToken(token)) {
    return false;
  }
  return true;
}

// GET - Obtener todos los datos del menú
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  console.log("\n📖 [ADMIN API GET] Cargando menú para admin...");
  console.log("🔍 Modo producción:", isProduction());

  try {
    if (isProduction()) {
      // PRODUCCIÓN: Leer desde Vercel Blob
      console.log("📥 [PRODUCCIÓN] Admin leyendo desde Vercel Blob...");

      const { blobs } = await list({ prefix: BLOB_FILENAME });

      console.log("📊 Blobs encontrados:", blobs.length);

      if (blobs.length === 0) {
        console.error("❌ No hay blob, usando archivo local como fallback");
        throw new Error("No se encontró el blob");
      }

      // Obtener el blob más reciente
      const latestBlob = blobs.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      )[0];

      console.log("✅ Leyendo blob más reciente:", latestBlob.url);
      console.log("📅 Subido:", latestBlob.uploadedAt);

      // Añadir timestamp anti-caché
      const blobUrl = `${latestBlob.url}?cache_bust=${Date.now()}`;

      const response = await fetch(blobUrl, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`Error al leer blob: ${response.status}`);
      }

      const menuData = await response.json();
      console.log("✅ Menú cargado desde Blob para admin");
      console.log(
        "📊 Items totales:",
        Object.keys(menuData.items || {}).length,
      );
      console.log("🕒 Hora de carga:", new Date().toISOString());

      return NextResponse.json(menuData, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    } else {
      // DESARROLLO: Leer archivo local
      console.log("📥 [DESARROLLO] Admin leyendo desde archivo local...");
      const fileContent = await fs.readFile(LOCAL_MENU_DATA_PATH, "utf-8");
      const menuData = JSON.parse(fileContent);
      console.log("✅ Menú cargado desde archivo local para admin");

      return NextResponse.json(menuData, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }
  } catch (error) {
    console.error("❌ Error al leer menu-data:", error);

    // Fallback: intentar leer archivo local
    try {
      console.log("📁 Intentando fallback a archivo local...");
      const fileContent = await fs.readFile(LOCAL_MENU_DATA_PATH, "utf-8");
      const menuData = JSON.parse(fileContent);
      return NextResponse.json(menuData, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } catch (fallbackError) {
      return NextResponse.json(
        {
          error: "Error al cargar los datos",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      );
    }
  }
}

// PUT - Actualizar el menú
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const jsonString = JSON.stringify(body, null, 2);

    console.log("📝 [ADMIN API] Iniciando guardado...");
    console.log(
      "🔍 BLOB_READ_WRITE_TOKEN presente:",
      !!process.env.BLOB_READ_WRITE_TOKEN,
    );
    console.log("🔍 Modo producción:", isProduction());

    if (isProduction()) {
      // PRODUCCIÓN: Guardar solo en Vercel Blob
      console.log("💾 [PRODUCCIÓN] Guardando en Vercel Blob...");
      console.log("📊 Tamaño del JSON:", jsonString.length, "bytes");

      const blob = await put(BLOB_FILENAME, jsonString, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      console.log("✅ Blob guardado exitosamente!");
      console.log("🔗 URL:", blob.url);
      console.log("📅 Timestamp:", new Date().toISOString());
    } else {
      // DESARROLLO: Guardar en archivo local
      console.log("💾 [DESARROLLO] Guardando en archivo local...");
      console.log("📁 Ruta:", LOCAL_MENU_DATA_PATH);
      await fs.writeFile(LOCAL_MENU_DATA_PATH, jsonString, "utf-8");
      console.log("✅ Archivo local guardado exitosamente");
    }

    // Revalidar todas las rutas
    console.log("🔄 Iniciando revalidación de rutas...");
    revalidatePath("/", "layout");
    console.log("✅ Rutas revalidadas exitosamente");

    return NextResponse.json({
      success: true,
      message: "Datos guardados correctamente",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error al guardar menu-data:", error);

    return NextResponse.json(
      {
        error: "Error al guardar los datos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
