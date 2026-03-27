"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 cursor-pointer">
              <img
                src="/images/logo_cachon_oficial2.png"
                alt="Bar Cachón"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  BAR CACHÓN
                </h1>
                <p className="text-sm text-gray-400">Panel de Administración</p>
              </div>
            </div>
            <div className="flex gap-3">
              {/* <Link href="/admin/dashboard/backup">
                <Button
                  variant="outline"
                  className="bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 rounded-md transition-colors"
                >
                  Backup
                </Button>
              </Link> */}
              <Button
                onClick={handleLogout}
                className="bg-white text-black border-0 hover:bg-gray-200 rounded-md transition-colors font-medium"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto flex flex-col align-middle h-full justify-center items-center px-6 py-10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold uppercase text-gray-900 mb-2">
            Gestión de la carta digital
          </h2>
          <p className="text-gray-600 text-base">
            Administra platos, categorías y el menú del día
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Gestión del Menú por Categorías */}
          <Link href="/admin/dashboard/menu">
            <div className="group bg-white rounded-lg shadow-sm hover:shadow-md p-6 transition-all duration-200 cursor-pointer h-full border border-gray-200 hover:border-gray-900">
              <div className="mb-4 flex flex-row-reverse justify-between">
                <img
                  src="/images/logo_cachon_oficial2.png"
                  alt="Bar Cachón"
                  className="h-8 w-auto"
                />
                <div className="h-fit inline-block bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-md mb-3 uppercase tracking-wide">
                  Carta
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Carta y Bebidas
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Gestionar platos, pintxos, bebidas y todas las categorías de la
                carta
              </p>
              <div className="space-y-2.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                  <span>Añadir/Editar/Eliminar items</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                  <span>Gestionar categorías</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                  <span>Editar traducciones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                  <span>Actualizar precios</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Card: Menú del Día */}
          <Link href="/admin/dashboard/daily-menu">
            <div className="group bg-white rounded-lg shadow-sm hover:shadow-md p-6 transition-all duration-200 cursor-pointer h-full border border-gray-200 hover:border-gray-900">
              <div className="mb-4 flex flex-row-reverse justify-between">
                <img
                  src="/images/logo_cachon_oficial2.png"
                  alt="Bar Cachón"
                  className="h-8 w-auto"
                />
                <div className="inline-block bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-md mb-3 uppercase tracking-wide">
                  Menú del Día
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Menú del Día
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Configurar el menú diario con primeros, segundos, postres y
                precio
              </p>
              <div className="space-y-2.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                  <span>Primeros platos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                  <span>Segundos platos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                  <span>Postres</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                  <span>Precio del menú</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Info adicional */}
        <div className="mt-8 bg-white border-l-4 border-gray-900 p-5 rounded-lg shadow-sm">
          <p className="text-sm text-gray-700">
            <strong className="text-gray-900">Nota:</strong> Los cambios se
            guardan al hacer clic en "Guardar". Se crea un backup antes de cada
            guardado.
          </p>
        </div>
      </main>
    </div>
  );
}
