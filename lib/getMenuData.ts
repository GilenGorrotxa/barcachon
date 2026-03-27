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
    const menuRecord = await prisma.menuData.findUnique({
      where: { id: "current" },
    });

    if (!menuRecord) {
      console.warn("⚠️ No se encontró registro en BD, usando fallback local");
      return menuDataJson as unknown as MenuData;
    }

    return menuRecord.data as unknown as MenuData;
  } catch (error) {
    console.error("❌ Error al leer de BD:", error);
    return menuDataJson as unknown as MenuData;
  }
}
