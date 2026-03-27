/**
 * Script para diagnosticar y limpiar versiones antiguas de menu-data.json en Vercel Blob
 * Uso: npx tsx scripts/blob-cleanup.ts
 */

import { list, del } from "@vercel/blob";

const BLOB_FILENAME = "menu-data.json";

async function main() {
  console.log("🔍 Listando todos los archivos en Vercel Blob...\n");

  try {
    const { blobs } = await list({
      prefix: BLOB_FILENAME,
      limit: 100,
    });

    if (blobs.length === 0) {
      console.log("❌ No se encontraron archivos con el nombre menu-data.json");
      return;
    }

    console.log(`📦 Se encontraron ${blobs.length} archivo(s):\n`);

    // Ordenar por fecha de subida descendente
    const sortedBlobs = blobs.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );

    // Mostrar información de cada blob
    sortedBlobs.forEach((blob, index) => {
      const isLatest = index === 0;
      console.log(
        `${isLatest ? "✅" : "⚠️"} ${isLatest ? "[MÁS RECIENTE]" : "[ANTIGUO]"}`,
      );
      console.log(`   URL: ${blob.url}`);
      console.log(`   Subido: ${new Date(blob.uploadedAt).toLocaleString()}`);
      console.log(`   Tamaño: ${(blob.size / 1024).toFixed(2)} KB`);
      console.log("");
    });

    // Si hay más de un archivo, ofrecer limpiar los antiguos
    if (blobs.length > 1) {
      const oldBlobs = sortedBlobs.slice(1);
      console.log(
        `⚠️  Hay ${oldBlobs.length} versión(es) antigua(s) que pueden causar problemas.\n`,
      );

      // En un entorno de producción, descomenta esto para eliminar automáticamente:
      console.log("💡 Para eliminar las versiones antiguas, ejecuta:");
      console.log("   npx tsx scripts/blob-cleanup.ts --delete\n");

      // Si se pasa el flag --delete, eliminar las versiones antiguas
      if (process.argv.includes("--delete")) {
        console.log("🗑️  Eliminando versiones antiguas...\n");

        for (const blob of oldBlobs) {
          try {
            await del(blob.url);
            console.log(`✅ Eliminado: ${blob.url}`);
          } catch (error) {
            console.error(
              `❌ Error al eliminar ${blob.url}:`,
              error instanceof Error ? error.message : String(error),
            );
          }
        }

        console.log("\n✨ Limpieza completada");
      }
    } else {
      console.log("✅ Solo hay una versión del archivo. Todo está bien.");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    console.error(
      "\n💡 Asegúrate de tener la variable BLOB_READ_WRITE_TOKEN configurada.",
    );
    process.exit(1);
  }
}

main();
