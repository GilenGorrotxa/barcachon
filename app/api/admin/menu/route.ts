import { NextRequest, NextResponse } from "next/server";
import { put, head } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { validateAdminToken } from "@/lib/admin-auth";

const BLOB_FILENAME = "menu-data.json";
const BACKUP_BLOB_FILENAME = "menu-data.backup.json";
const LOCAL_MENU_DATA_PATH = path.join(process.cwd(), "lib", "menu-data.json");

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

  try {
    // Intentar obtener desde Vercel Blob
    const blobUrl = process.env.BLOB_URL;

    if (blobUrl) {
      // En producción: leer desde Blob
      const response = await fetch(blobUrl);
      if (response.ok) {
        const menuData = await response.json();
        return NextResponse.json(menuData);
      }
    }

    // Fallback a archivo local (desarrollo)
    const fileContent = await fs.readFile(LOCAL_MENU_DATA_PATH, "utf-8");
    const menuData = JSON.parse(fileContent);
    return NextResponse.json(menuData);
  } catch (error) {
    console.error("Error al leer menu-data:", error);
    return NextResponse.json(
      { error: "Error al cargar los datos" },
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

    // Verificar si estamos en producción (con Vercel Blob)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // 1. Crear backup del blob actual
      try {
        const blobUrl = process.env.BLOB_URL;
        if (blobUrl) {
          const currentData = await fetch(blobUrl);
          if (currentData.ok) {
            const currentJson = await currentData.text();
            await put(BACKUP_BLOB_FILENAME, currentJson, {
              access: "public",
              addRandomSuffix: false,
            });
          }
        }
      } catch (backupError) {
        console.warn("No se pudo crear backup:", backupError);
      }

      // 2. Guardar nuevos datos en blob
      const blob = await put(BLOB_FILENAME, jsonString, {
        access: "public",
        addRandomSuffix: false,
      });

      // 3. Actualizar variable de entorno en memoria (para siguiente request)
      process.env.BLOB_URL = blob.url;

      return NextResponse.json({
        success: true,
        message: "Datos guardados correctamente en Vercel Blob",
        blobUrl: blob.url,
      });
    } else {
      // Desarrollo: guardar en archivo local
      const backupPath = path.join(
        process.cwd(),
        "lib",
        "menu-data.backup.json",
      );
      const fileContent = await fs.readFile(LOCAL_MENU_DATA_PATH, "utf-8");
      await fs.writeFile(backupPath, fileContent, "utf-8");
      await fs.writeFile(LOCAL_MENU_DATA_PATH, jsonString, "utf-8");

      return NextResponse.json({
        success: true,
        message: "Datos guardados correctamente (modo desarrollo)",
      });
    }
  } catch (error) {
    console.error("Error al guardar menu-data:", error);
    return NextResponse.json(
      { error: "Error al guardar los datos" },
      { status: 500 },
    );
  }
}
