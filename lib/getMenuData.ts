/**
 * Función para obtener datos del menú
 * - En producción (Vercel): lee desde API → Blob Storage
 * - En desarrollo: lee archivo local
 *
 * Nota: Las páginas usan force-dynamic, así que esto SIEMPRE
 * se ejecuta en runtime, no en build time
 */

import type { MenuData } from "@/lib/types/menu.types";
import menuDataJson from "@/lib/menu-data.json";

export async function getMenuData(): Promise<MenuData> {
  console.log("\n📖 [getMenuData] Iniciando carga de menú...");
  console.log(
    "🔍 BLOB_READ_WRITE_TOKEN presente:",
    !!process.env.BLOB_READ_WRITE_TOKEN,
  );
  console.log("🔍 VERCEL_URL:", process.env.VERCEL_URL || "(no definido)");
  console.log(
    "🔍 NEXT_PUBLIC_BASE_URL:",
    process.env.NEXT_PUBLIC_BASE_URL || "(no definido)",
  );

  // En producción, siempre usar la API que lee del Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    console.log("🌐 [PRODUCCIÓN] Haciendo fetch a API...");
    console.log("🔗 URL:", `${baseUrl}/api/menu`);

    try {
      const res = await fetch(`${baseUrl}/api/menu`, {
        cache: "no-store",
      });

      console.log("📡 Respuesta de API:", res.status, res.statusText);

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Menú cargado desde Blob via API");
        console.log("📊 Items totales:", Object.keys(data.items || {}).length);
        return data;
      }

      console.error("❌ API fetch falló con status:", res.status);
    } catch (error) {
      console.error("❌ Error haciendo fetch a API:");
      console.error("📝 Detalles:", error);
    }
  }

  // En desarrollo o como fallback: archivo local
  console.log("📁 Usando archivo local como fallback");
  console.log("📊 Items totales:", Object.keys(menuDataJson.items).length);
  return menuDataJson as unknown as MenuData;
}
