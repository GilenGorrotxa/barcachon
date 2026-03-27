import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

const BLOB_FILENAME = "menu-data.json";
const LOCAL_MENU_DATA_PATH = path.join(process.cwd(), "lib", "menu-data.json");

// Verificar si estamos en modo producción con Blob
function isUsingBlob() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// GET público - Obtener todos los datos del menú
export async function GET(request: NextRequest) {
  try {
    // En producción con Blob
    if (isUsingBlob()) {
      // Obtener la URL más reciente del blob usando list()
      const { blobs } = await list({
        prefix: BLOB_FILENAME,
        limit: 1,
      });

      if (blobs.length === 0) {
        // Si no hay blob, intentar leer el archivo local como fallback
        console.warn("No se encontró blob, usando archivo local como fallback");
        const fileContent = await fs.readFile(LOCAL_MENU_DATA_PATH, "utf-8");
        const menuData = JSON.parse(fileContent);
        return NextResponse.json(menuData, {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        });
      }

      const blobUrl = blobs[0].url;

      const response = await fetch(blobUrl, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Blob fetch failed: ${response.status} ${response.statusText}`,
        );
      }

      const menuData = await response.json();

      // Cache público corto para balance entre performance y actualización
      return NextResponse.json(menuData, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    }

    // Desarrollo: leer archivo local
    const fileContent = await fs.readFile(LOCAL_MENU_DATA_PATH, "utf-8");
    const menuData = JSON.parse(fileContent);

    return NextResponse.json(menuData, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("❌ Error al leer menu-data:", error);

    return NextResponse.json(
      {
        error: "Error al cargar los datos del menú",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
