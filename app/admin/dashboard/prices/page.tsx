"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FloatingSaveButton from "@/components/admin/FloatingSaveButton";
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges";

interface PriceUpdate {
  id: string;
  name: string;
  categoryId: string;
  currentPrices: any;
  newPrices: any;
}

export default function PricesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [priceUpdates, setPriceUpdates] = useState<PriceUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [percentageChange, setPercentageChange] = useState<number>(0);
  const router = useRouter();

  // Tracking de cambios sin guardar
  const { hasUnsavedChanges, resetOriginalData } = useUnsavedChanges(
    priceUpdates,
    !loading,
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("/api/admin/menu");
      if (!response.ok) {
        router.push("/admin/login");
        return [];
      }
      const data = await response.json();

      // Convertir items de objeto a array
      const itemsArray = data.items ? Object.values(data.items) : [];
      setItems(itemsArray);

      // Inicializar updates
      const updates = itemsArray.map((item: any) => ({
        id: item.id,
        name: item.translations.es.name,
        categoryId: item.categoryId,
        currentPrices: { ...item.price },
        newPrices: { ...item.price },
      }));
      setPriceUpdates(updates);

      return updates as PriceUpdate[];
    } catch (error) {
      console.error("Error al cargar datos:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const applyPercentageChange = () => {
    if (percentageChange === 0) return;

    const factor = 1 + percentageChange / 100;
    const updates = priceUpdates.map((update) => ({
      ...update,
      newPrices: {
        unit: update.currentPrices.unit
          ? Math.round(update.currentPrices.unit * factor * 100) / 100
          : undefined,
        halfPortion: update.currentPrices.halfPortion
          ? Math.round(update.currentPrices.halfPortion * factor * 100) / 100
          : undefined,
        fullPortion: update.currentPrices.fullPortion
          ? Math.round(update.currentPrices.fullPortion * factor * 100) / 100
          : undefined,
        standard: update.currentPrices.standard
          ? Math.round(update.currentPrices.standard * factor * 100) / 100
          : undefined,
      },
    }));
    setPriceUpdates(updates);
  };

  const resetPrices = () => {
    const updates = priceUpdates.map((update) => ({
      ...update,
      newPrices: { ...update.currentPrices },
    }));
    setPriceUpdates(updates);
    setPercentageChange(0);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/menu");
      const fullData = await response.json();

      // Convertir items a array si no lo es, actualizar precios y volver a objeto
      const itemsArray = Object.values(fullData.items || {});
      const updatedItems: any = {};

      itemsArray.forEach((item: any) => {
        const update = priceUpdates.find((u) => u.id === item.id);
        if (update) {
          updatedItems[item.id] = { ...item, price: update.newPrices };
        } else {
          updatedItems[item.id] = item;
        }
      });

      fullData.items = updatedItems;

      const saveResponse = await fetch("/api/admin/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullData),
      });

      if (saveResponse.ok) {
        alert("✅ Precios actualizados correctamente");

        // Recargar datos desde el servidor para tener el estado actualizado
        const updatedPrices = await loadData();

        // Resetear tracking de cambios con los datos recién cargados
        resetOriginalData(updatedPrices);
      } else {
        const errorData = await saveResponse.json();
        console.error("Error al guardar:", errorData);
        alert(
          `❌ Error al guardar cambios: ${errorData.details || errorData.error}`,
        );
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold">Gestión de Precios</h1>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={saveChanges}
                disabled={saving}
                className={`
                  text-white transition-all duration-300
                  ${
                    hasUnsavedChanges
                      ? "bg-orange-600 hover:bg-orange-700 shadow-lg animate-pulse"
                      : "bg-green-600 hover:bg-green-700"
                  }
                `}
              >
                {saving ? (
                  "💾 Guardando..."
                ) : hasUnsavedChanges ? (
                  <span className="flex items-center gap-2">
                    ⚠️ Guardar Cambios
                  </span>
                ) : (
                  "✓ Todo Guardado"
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Bulk Update */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h2 className="text-lg font-bold mb-4">
            Actualización Masiva por Porcentaje
          </h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Cambio de Precio (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={percentageChange}
                onChange={(e) =>
                  setPercentageChange(parseFloat(e.target.value) || 0)
                }
                className="w-full px-4 py-2 border-2 border-gray-300 focus:border-black"
                placeholder="Ej: 5 para aumentar 5%, -10 para reducir 10%"
              />
            </div>
            <Button
              onClick={applyPercentageChange}
              className="bg-black text-white"
            >
              Aplicar Cambio
            </Button>
            <Button
              onClick={resetPrices}
              variant="outline"
              className="border-2"
            >
              Resetear
            </Button>
          </div>
        </div>
      </div>

      {/* Price List */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border-2 border-black">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-black">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Item</th>
                <th className="px-4 py-3 text-center font-bold">
                  Precio Actual
                </th>
                <th className="px-4 py-3 text-center font-bold">
                  Nuevo Precio
                </th>
                <th className="px-4 py-3 text-center font-bold">Cambio</th>
              </tr>
            </thead>
            <tbody>
              {priceUpdates.map((update, index) => {
                const hasChange =
                  JSON.stringify(update.currentPrices) !==
                  JSON.stringify(update.newPrices);

                return (
                  <tr
                    key={update.id}
                    className={`border-b border-gray-200 ${
                      hasChange ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{update.name}</div>
                      <div className="text-xs text-gray-500">{update.id}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm space-y-1">
                        {update.currentPrices.standard && (
                          <div>€{update.currentPrices.standard.toFixed(2)}</div>
                        )}
                        {update.currentPrices.unit && (
                          <div className="text-xs text-gray-600">
                            U: €{update.currentPrices.unit.toFixed(2)}
                          </div>
                        )}
                        {update.currentPrices.halfPortion && (
                          <div className="text-xs text-gray-600">
                            M: €{update.currentPrices.halfPortion.toFixed(2)}
                          </div>
                        )}
                        {update.currentPrices.fullPortion && (
                          <div className="text-xs text-gray-600">
                            R: €{update.currentPrices.fullPortion.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm space-y-1">
                        {update.newPrices.standard !== undefined && (
                          <input
                            type="number"
                            step="0.01"
                            value={update.newPrices.standard || ""}
                            onChange={(e) => {
                              const updates = [...priceUpdates];
                              updates[index].newPrices.standard = parseFloat(
                                e.target.value,
                              );
                              setPriceUpdates(updates);
                            }}
                            className="w-20 px-2 py-1 border border-gray-300 text-center"
                          />
                        )}
                        {update.newPrices.unit !== undefined && (
                          <div>
                            <input
                              type="number"
                              step="0.01"
                              value={update.newPrices.unit || ""}
                              onChange={(e) => {
                                const updates = [...priceUpdates];
                                updates[index].newPrices.unit = parseFloat(
                                  e.target.value,
                                );
                                setPriceUpdates(updates);
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 text-center text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasChange ? (
                        <span className="text-xs bg-yellow-200 px-2 py-1 border border-yellow-400">
                          Modificado
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Sin cambios
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Botón flotante de guardado */}
      <FloatingSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={saveChanges}
        isSaving={saving}
      />
    </div>
  );
}
