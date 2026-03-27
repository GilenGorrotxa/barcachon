import { NextRequest, NextResponse } from "next/server";
import { validateCredentials, createAdminToken } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username y password son requeridos" },
        { status: 400 },
      );
    }

    if (validateCredentials(username, password)) {
      const token = createAdminToken(username);

      const response = NextResponse.json(
        { success: true, username },
        { status: 200 },
      );

      // Configurar cookie con el token
      response.cookies.set("admin-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 horas
        path: "/",
      });

      return response;
    } else {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 },
    );
  }
}
