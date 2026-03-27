import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

const LOCAL_MENU_DATA_PATH = path.join(process.cwd(), "lib", "menu-data.json");
const BLOB_FILENAME = "menu-data.json";

const isProduction = () => !!process.env.BLOB_READ_WRITE_TOKEN;

// GET público - Obtener todos los datos del menú
export async function GET() {
  console.log("\n🌐 [API MENU] Nueva petición recibida");
  console.log(
    "🔍 BLOB_READ_WRITE_TOKEN presente:",
    !!process.env.BLOB_READ_WRITE_TOKEN,
  );
  console.log("🔍 Modo producción:", isProduction());

  try {
    if (isProduction()) {
      // PRODUCCIÓN: Leer desde Vercel Blob
      console.log("📥 [PRODUCCIÓN] Leyendo desde Vercel Blob...");
      console.log("🔍 Buscando blobs con prefix:", BLOB_FILENAME);

      const { blobs } = await list({ prefix: BLOB_FILENAME });

      console.log("📊 Blobs encontrados:", blobs.length);

      if (blobs.length === 0) {
        console.error("❌ No se encontró ningún blob!");
        throw new Error("No se encontró el archivo en Vercel Blob");
      }

      // Obtener el blob más reciente
      const latestBlob = blobs.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      )[0];

      console.log("✅ Blob más reciente:");
      console.log("  - URL:", latestBlob.url);
      console.log("  - Subido:", latestBlob.uploadedAt);
      console.log("  - Tamaño:", latestBlob.size, "bytes");

      const response = await fetch(latestBlob.url, { cache: "no-store" });

      if (!response.ok) {
        console.error("❌ Error al hacer fetch del blob:", response.status);
        throw new Error(`Error al leer blob: ${response.status}`);
      }

      const menuData = await response.json();
      console.log("✅ Menú cargado desde Blob exitosamente");
      console.log("📊 Categorías:", menuData.categories?.length || 0);
      console.log("📊 Items:", menuData.items?.length || 0);

      return NextResponse.json(menuData, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    } else {
      // DESARROLLO: Leer desde archivo local
      console.log("📥 [DESARROLLO] Leyendo desde archivo local...");
      console.log("📁 Ruta:", LOCAL_MENU_DATA_PATH);
      const fileContent = await fs.readFile(LOCAL_MENU_DATA_PATH, "utf-8");
      const menuData = JSON.parse(fileContent);
      console.log("✅ Menú cargado desde archivo local");
      console.log("📊 Categorías:", menuData.categories?.length || 0);
      console.log("📊 Items:", menuData.items?.length || 0);

      return NextResponse.json(menuData, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      });
    }
  } catch (error) {
    console.error("❌ [ERROR] Error al leer menu-data:");
    console.error("📝 Detalles:", error);

    // Fallback al archivo local
    try {
      const fileContent = await fs.readFile(LOCAL_MENU_DATA_PATH, "utf-8");
      const menuData = JSON.parse(fileContent);
      return NextResponse.json(menuData);
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
