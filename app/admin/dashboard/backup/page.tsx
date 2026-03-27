"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BackupPage() {
  const [backups, setBackups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // En una implementación real, listaríamos los backups disponibles
    loadBackups();
  }, []);

  const loadBackups = () => {
    // Simulación - en producción, leer del sistema de archivos
    setBackups([]);
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/menu");
      if (!response.ok) {
        throw new Error("Error al obtener datos");
      }
      const data = await response.json();

      // Crear archivo de backup
      const backupData = JSON.stringify(data, null, 2);
      const blob = new Blob([backupData], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `barcachon-backup-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert("Backup creado y descargado correctamente");
    } catch (error) {
      console.error("Error al crear backup:", error);
      alert("Error al crear backup");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      !confirm(
        "¿Estás seguro de que quieres restaurar este backup? Esto sobrescribirá todos los datos actuales.",
      )
    ) {
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch("/api/admin/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Backup restaurado correctamente. La página se recargará.");
        window.location.reload();
      } else {
        alert("Error al restaurar backup");
      }
    } catch (error) {
      console.error("Error al restaurar backup:", error);
      alert("Error al procesar el archivo de backup");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img
                src="/images/logo_cachon_oficial2.png"
                alt="Bar Cachón"
                className="h-10 w-auto"
              />
              <div>
                <Link
                  href="/admin/dashboard"
                  className="text-sm text-gray-400 hover:text-white mb-2 inline-block"
                >
                  ← Volver al Dashboard
                </Link>
                <h1 className="text-xl font-semibold">Backup y Restauración</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Crear Backup */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Crear Backup</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Descarga una copia de seguridad completa de todos los datos del
            menú. Se recomienda crear backups antes de hacer cambios
            importantes.
          </p>
          <Button
            onClick={createBackup}
            disabled={loading}
            className="bg-black text-white hover:bg-gray-800 rounded-md"
          >
            {loading ? "Creando..." : "Descargar Backup"}
          </Button>
        </div>

        {/* Restaurar Backup */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Restaurar Backup</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Restaura los datos del menú desde un archivo de backup. Esto
            sobrescribirá todos los datos actuales.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Advertencia:</strong> Esta acción no se puede deshacer.
              Asegúrate de tener un backup reciente antes de restaurar.
            </p>
          </div>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-medium file:bg-white file:text-black hover:file:bg-gray-50 file:cursor-pointer"
          />
        </div>

        {/* Información */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-3">Información</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • Los backups se crean automáticamente cada vez que guardas
              cambios
            </p>
            <p>
              • Los backups automáticos se guardan en <code>lib/</code> con el
              formato <code>menu-data.backup.[timestamp].json</code>
            </p>
            <p>• Los backups incluyen categorías, items y menú del día</p>
            <p>• Se recomienda mantener backups semanales en un lugar seguro</p>
          </div>
        </div>
      </main>
    </div>
  );
}
