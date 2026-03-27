"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TranslationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/admin/dashboard"
                className="text-sm text-gray-300 hover:text-white mb-2 inline-block"
              >
                ← Volver al Dashboard
              </Link>
              <h1 className="text-2xl font-bold">Gestión de Traducciones</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border-2 border-black p-12 text-center">
          <div className="text-6xl mb-6">🌍</div>
          <h2 className="text-2xl font-bold mb-4">
            Las traducciones se gestionan directamente en cada item
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Para editar las traducciones de los items del menú, ve a la sección
            de "Items del Menú" donde podrás editar los nombres y descripciones
            en los 4 idiomas: Español, Euskera, Inglés y Francés.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/admin/dashboard/items">
              <Button className="bg-black text-white hover:bg-gray-800">
                Ir a Items del Menú
              </Button>
            </Link>
            <Link href="/admin/dashboard/categories">
              <Button variant="outline" className="border-2">
                Ir a Categorías
              </Button>
            </Link>
          </div>

          <div className="mt-12 bg-gray-50 border-2 border-gray-300 p-6 text-left max-w-2xl mx-auto">
            <h3 className="font-bold mb-3">💡 Consejo</h3>
            <p className="text-sm text-gray-700">
              Las traducciones están integradas en cada elemento del sistema. Al
              crear o editar un item o categoría, puedes modificar su nombre y
              descripción en todos los idiomas soportados simultáneamente.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
