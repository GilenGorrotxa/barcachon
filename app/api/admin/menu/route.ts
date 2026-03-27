import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { validateAdminToken } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

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
  console.log("\n📖 [ADMIN API GET] Petición recibida");

  if (!checkAuth(request)) {
    console.error("❌ No autorizado");
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const menuRecord = await prisma.menuData.findUnique({
      where: { id: "current" },
    });

    if (!menuRecord) {
      return NextResponse.json(
        { error: "No se encontró el menú" },
        { status: 404 },
      );
    }

    console.log("✅ Menú cargado desde BD para admin");
    console.log("📊 Versión:", menuRecord.version);

    return NextResponse.json(menuRecord.data, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("❌ Error al leer menú:", error);
    return NextResponse.json(
      {
        error: "Error al cargar los datos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// PUT - Actualizar el menú
export async function PUT(request: NextRequest) {
  console.log("\n🚨 [ADMIN API PUT] Petición recibida");
  console.log("🕒 Timestamp:", new Date().toISOString());

  if (!checkAuth(request)) {
    console.error("❌ No autorizado");
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("📝 Guardando en base de datos...");

    // Actualizar o crear el registro
    const menuRecord = await prisma.menuData.upsert({
      where: { id: "current" },
      update: {
        data: body,
        version: { increment: 1 },
      },
      create: {
        id: "current",
        version: 1,
        data: body,
      },
    });

    console.log("✅ Menú guardado en BD");
    console.log("📊 Versión:", menuRecord.version);
    console.log("📅 Actualizado:", menuRecord.updatedAt);

    // Revalidar todas las rutas para regenerar páginas con ISR
    console.log("🔄 Revalidando rutas...");
    revalidatePath("/", "layout");
    console.log("✅ Rutas revalidadas");

    return NextResponse.json({
      success: true,
      message: "Datos guardados correctamente",
      version: menuRecord.version,
      timestamp: menuRecord.updatedAt,
    });
  } catch (error) {
    console.error("❌ Error al guardar menú:", error);
    return NextResponse.json(
      {
        error: "Error al guardar los datos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
