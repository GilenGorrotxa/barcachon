/**
 * Utilidad para hacer fetch al API del admin con cache-busting automático
 */

/**
 * Fetch de datos del menú con cache-busting para evitar cache del navegador
 * @returns Promise con los datos del menú
 */
export async function fetchAdminMenu() {
  const timestamp = Date.now();
  const response = await fetch(`/api/admin/menu?t=${timestamp}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch admin menu: ${response.status}`);
  }

  return response.json();
}

/**
 * Guardar datos del menú con manejo de errores mejorado
 * @param data - Datos completos del menú a guardar
 * @returns Promise con la respuesta del servidor
 */
export async function saveAdminMenu(data: any) {
  const response = await fetch("/api/admin/menu", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.details || errorData.error || "Error al guardar");
  }

  return response.json();
}
