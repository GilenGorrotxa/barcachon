/**
 * Script para subir el menu-data.json inicial a Vercel Blob
 *
 * Uso:
 * 1. Asegúrate de tener BLOB_READ_WRITE_TOKEN en tu .env.local
 * 2. Ejecuta: npx tsx scripts/upload-to-blob.ts
 */

import { put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

async function uploadInitialData() {
  try {
    console.log("📦 Subiendo menu-data.json a Vercel Blob...");

    // Leer el archivo local
    const menuDataPath = path.join(process.cwd(), "lib", "menu-data.json");
    const fileContent = await fs.readFile(menuDataPath, "utf-8");

    // Validar que sea JSON válido
    JSON.parse(fileContent);

    // Subir a Vercel Blob
    const blob = await put("menu-data.json", fileContent, {
      access: "public",
      addRandomSuffix: false,
    });

    console.log("✅ Archivo subido exitosamente!");
    console.log("📍 URL del blob:", blob.url);
    console.log("\n🔧 Agrega esta variable de entorno en Vercel:");
    console.log(`BLOB_URL=${blob.url}`);
  } catch (error) {
    console.error("❌ Error al subir archivo:", error);

    if (error instanceof Error && error.message.includes("token")) {
      console.log(
        "\n💡 Asegúrate de tener BLOB_READ_WRITE_TOKEN en tu .env.local",
      );
      console.log(
        "   Obtén el token desde: https://vercel.com/dashboard/stores",
      );
    }

    process.exit(1);
  }
}

uploadInitialData();
