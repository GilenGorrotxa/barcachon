import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { validateAdminToken } from "@/lib/admin-auth";

const MENU_DATA_PATH = path.join(process.cwd(), "lib", "menu-data.json");

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
    const fileContent = await fs.readFile(MENU_DATA_PATH, "utf-8");
    const menuData = JSON.parse(fileContent);
    return NextResponse.json(menuData);
  } catch (error) {
    console.error("Error al leer menu-data.json:", error);
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

    // Actualizar backup (sobrescribe el existente)
    const fileContent = await fs.readFile(MENU_DATA_PATH, "utf-8");
    const backupPath = path.join(process.cwd(), "lib", "menu-data.backup.json");
    await fs.writeFile(backupPath, fileContent, "utf-8");

    // Guardar los nuevos datos
    await fs.writeFile(MENU_DATA_PATH, JSON.stringify(body, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Datos guardados correctamente",
    });
  } catch (error) {
    console.error("Error al guardar menu-data.json:", error);
    return NextResponse.json(
      { error: "Error al guardar los datos" },
      { status: 500 },
    );
  }
}
