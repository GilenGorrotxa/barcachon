/**
 * Función para obtener datos del menú desde la base de datos
 * - En producción: Lee desde Neon Postgres
 * - En desarrollo: Lee desde Neon Postgres
 * - Fallback: Usa menu-data.json local si hay error
 */

import type { MenuData } from "@/lib/types/menu.types";
import menuDataJson from "@/lib/menu-data.json";
import { prisma } from "@/lib/prisma";

export async function getMenuData(): Promise<MenuData> {
  try {
    console.log("📖 [getMenuData] Cargando menú desde base de datos...");

    const menuRecord = await prisma.menuData.findUnique({
      where: { id: "current" },
    });

    if (!menuRecord) {
      console.warn("⚠️ No se encontró registro en BD, usando fallback local");
      return menuDataJson as unknown as MenuData;
    }

    console.log("✅ Menú cargado desde BD");
    console.log("📊 Versión:", menuRecord.version);
    console.log("📅 Última actualización:", menuRecord.updatedAt);

    return menuRecord.data as MenuData;
  } catch (error) {
    console.error("❌ Error al leer de BD:", error);
    console.log("📁 Usando archivo local como fallback");
    return menuDataJson as unknown as MenuData;
  }
}
