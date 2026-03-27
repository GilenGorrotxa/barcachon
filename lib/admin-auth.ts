// Configuración de autenticación para el panel de administración
// NOTA: En producción, usar variables de entorno y hash de contraseñas

export const ADMIN_CREDENTIALS = {
  username: "barcachon",
  password: "Martuneta69", // Cambiar esta contraseña
};

export function validateCredentials(
  username: string,
  password: string,
): boolean {
  return (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  );
}

export function createAdminToken(username: string): string {
  // Token simple codificado en base64
  const payload = {
    username,
    timestamp: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function validateAdminToken(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    // Verificar que el token no tenga más de 24 horas
    const dayInMs = 24 * 60 * 60 * 1000;
    return Date.now() - payload.timestamp < dayInMs;
  } catch {
    return false;
  }
}
