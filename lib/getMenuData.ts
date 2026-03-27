/**
 * Función universal para obtener datos del menú
 * - Durante BUILD: lee archivo local
 * - Durante RUNTIME: hace fetch a la API
 */

import type { MenuData } from "@/lib/types/menu.types";

export async function getMenuData(): Promise<MenuData> {
  // Detectar si estamos en build time (no hay headers de request)
  const isBuildTime = typeof window === "undefined" && !process.env.VERCEL;

  if (isBuildTime) {
    // Durante el build, leer directamente del archivo local
    const menuData = await import("@/lib/menu-data.json");
    return menuData.default as unknown as MenuData;
  }

  // Durante runtime, usar la API dinámica
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    // Añadir timestamp para evitar cache del navegador
    const timestamp = Date.now();
    const res = await fetch(`${baseUrl}/api/menu?t=${timestamp}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch menu data: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error(
      "Error fetching menu data, falling back to local file:",
      error,
    );
    // Fallback al archivo local si falla el fetch
    const menuData = await import("@/lib/menu-data.json");
    return menuData.default as unknown as MenuData;
  }
}
