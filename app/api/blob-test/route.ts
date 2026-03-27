import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

// Endpoint de prueba para listar blobs
export async function GET() {
  try {
    console.log("🔍 Listando todos los blobs...");

    const { blobs } = await list();

    console.log(`📊 Total de blobs encontrados: ${blobs.length}`);

    const blobList = blobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));

    return NextResponse.json({
      success: true,
      count: blobs.length,
      blobs: blobList,
    });
  } catch (error) {
    console.error("❌ Error listando blobs:", error);
    return NextResponse.json(
      {
        error: "Error al listar blobs",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
