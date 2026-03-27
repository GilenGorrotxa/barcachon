import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
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

// GET - Obtener todos los datos del menú (siempre del archivo local)
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
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
