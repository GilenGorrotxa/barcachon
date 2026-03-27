"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FloatingSaveButton from "@/components/admin/FloatingSaveButton";
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges";

interface Translation {
  name: string;
  description?: string;
}

interface MenuItem {
  id: string;
  categoryId: string;
  translations: {
    es: Translation;
    eu: Translation;
    en: Translation;
    fr: Translation;
  };
  price: {
    unit?: number;
    halfPortion?: number;
    fullPortion?: number;
    standard?: number;
  };
  allergens?: string[];
  available: boolean;
  featured?: boolean;
  order?: number;
}

export default function ItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Tracking de cambios sin guardar
  const { hasUnsavedChanges, resetOriginalData } = useUnsavedChanges(
    items,
    !loading,
  );

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, filterCategory, items]);

  const loadData = async () => {
    try {
      const response = await fetch("/api/admin/menu");
      if (!response.ok) {
        router.push("/admin/login");
        return;
      }
      const data = await response.json();

      // Convertir items de objeto a array
      const itemsArray = data.items ? Object.values(data.items) : [];
      setItems(itemsArray as MenuItem[]);

      // Extraer todas las categorías
      const allCategories: any[] = [];
      if (data.navigation?.mainSections) {
        data.navigation.mainSections.forEach((section: any) => {
          section.categories.forEach((cat: any) => {
            allCategories.push({
              id: cat.id,
              name: cat.translations.es,
            });
          });
        });
      }
      setCategories(allCategories);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.translations.es.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((item) => item.categoryId === filterCategory);
    }

    setFilteredItems(filtered);
  };

  const saveData = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/menu");
      const fullData = await response.json();

      // Convertir array de items de vuelta a objeto
      const itemsObject: any = {};
      items.forEach((item) => {
        itemsObject[item.id] = item;
      });
      fullData.items = itemsObject;

      const saveResponse = await fetch("/api/admin/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullData),
      });

      if (saveResponse.ok) {
        alert("✅ Cambios guardados correctamente");
        resetOriginalData(items); // Reset tracking después de guardar
      } else {
        alert("❌ Error al guardar cambios");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("❌ Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  const createNewItem = () => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      categoryId: categories[0]?.id || "",
      translations: {
        es: { name: "Nuevo Item", description: "" },
        eu: { name: "Item Berria", description: "" },
        en: { name: "New Item", description: "" },
        fr: { name: "Nouvel Article", description: "" },
      },
      price: { standard: 0 },
      allergens: [],
      available: true,
      order: items.length + 1,
    };
    setEditingItem(newItem);
    setShowModal(true);
  };

  const editItem = (item: MenuItem) => {
    setEditingItem({ ...item });
    setShowModal(true);
  };

  const saveItem = () => {
    if (!editingItem) return;

    const existingIndex = items.findIndex((i) => i.id === editingItem.id);
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex] = editingItem;
      setItems(newItems);
    } else {
      setItems([...items, editingItem]);
    }

    setShowModal(false);
    setEditingItem(null);
  };

  const deleteItem = (itemId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este item?")) {
      return;
    }
    setItems(items.filter((i) => i.id !== itemId));
  };

  const toggleAvailability = (itemId: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item,
      ),
    );
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
              <h1 className="text-2xl font-bold">Gestión de Items del Menú</h1>
              <p className="text-sm text-gray-300">
                {filteredItems.length} de {items.length} items
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={createNewItem}
                className="bg-white text-black hover:bg-gray-200"
              >
                + Nuevo Item
              </Button>
              <Button
                onClick={saveData}
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

      {/* Filters */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Buscar por nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 focus:border-black"
              />
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 focus:border-black"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white border-2 p-4 ${
                item.available ? "border-black" : "border-gray-300 opacity-60"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">
                      {item.translations.es.name}
                    </h3>
                    {!item.available && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 border border-red-300">
                        NO DISPONIBLE
                      </span>
                    )}
                    {item.featured && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 border border-yellow-300">
                        DESTACADO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.translations.es.description}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>ID: {item.id}</span>
                    <span>
                      Categoría:{" "}
                      {categories.find((c) => c.id === item.categoryId)?.name ||
                        item.categoryId}
                    </span>
                    {item.price.standard && (
                      <span className="font-bold text-black">
                        €{item.price.standard.toFixed(2)}
                      </span>
                    )}
                    {item.price.unit && (
                      <span>Unidad: €{item.price.unit.toFixed(2)}</span>
                    )}
                    {item.allergens && item.allergens.length > 0 && (
                      <span>Alérgenos: {item.allergens.join(", ")}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleAvailability(item.id)}
                    variant="outline"
                    className="border-2"
                  >
                    {item.available
                      ? "Ocultar de la carta"
                      : "Mostrar en la carta"}
                  </Button>
                  <Button
                    onClick={() => editItem(item)}
                    className="bg-black text-white"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => deleteItem(item.id)}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Eliminar de la carta
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="bg-white border-2 border-gray-300 p-12 text-center">
              <p className="text-gray-500">
                No se encontraron items con los filtros seleccionados
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Edición */}
      {showModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {items.find((i) => i.id === editingItem.id)
                  ? "Editar Item"
                  : "Nuevo Item"}
              </h2>

              <div className="space-y-6">
                {/* ID y Categoría */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ID *
                    </label>
                    <input
                      type="text"
                      value={editingItem.id}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, id: e.target.value })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Categoría *
                    </label>
                    <select
                      value={editingItem.categoryId}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          categoryId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Traducciones ES */}
                <div className="border-2 border-gray-200 p-4">
                  <h3 className="font-bold mb-3">🇪🇸 Español</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={editingItem.translations.es.name}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            translations: {
                              ...editingItem.translations,
                              es: {
                                ...editingItem.translations.es,
                                name: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={editingItem.translations.es.description || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            translations: {
                              ...editingItem.translations,
                              es: {
                                ...editingItem.translations.es,
                                description: e.target.value,
                              },
                            },
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Traducciones EU */}
                <div className="border-2 border-gray-200 p-4">
                  <h3 className="font-bold mb-3">🏴 Euskera</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={editingItem.translations.eu.name}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            translations: {
                              ...editingItem.translations,
                              eu: {
                                ...editingItem.translations.eu,
                                name: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={editingItem.translations.eu.description || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            translations: {
                              ...editingItem.translations,
                              eu: {
                                ...editingItem.translations.eu,
                                description: e.target.value,
                              },
                            },
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Traducciones EN */}
                <div className="border-2 border-gray-200 p-4">
                  <h3 className="font-bold mb-3">🇬🇧 English</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={editingItem.translations.en.name}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            translations: {
                              ...editingItem.translations,
                              en: {
                                ...editingItem.translations.en,
                                name: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={editingItem.translations.en.description || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            translations: {
                              ...editingItem.translations,
                              en: {
                                ...editingItem.translations.en,
                                description: e.target.value,
                              },
                            },
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Traducciones FR */}
                <div className="border-2 border-gray-200 p-4">
                  <h3 className="font-bold mb-3">🇫🇷 Français</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={editingItem.translations.fr.name}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            translations: {
                              ...editingItem.translations,
                              fr: {
                                ...editingItem.translations.fr,
                                name: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={editingItem.translations.fr.description || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            translations: {
                              ...editingItem.translations,
                              fr: {
                                ...editingItem.translations.fr,
                                description: e.target.value,
                              },
                            },
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Precios */}
                <div className="border-2 border-gray-200 p-4">
                  <h3 className="font-bold mb-3">💰 Precios</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Unidad (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.price.unit || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            price: {
                              ...editingItem.price,
                              unit: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Media Ración (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.price.halfPortion || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            price: {
                              ...editingItem.price,
                              halfPortion: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Ración (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.price.fullPortion || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            price: {
                              ...editingItem.price,
                              fullPortion: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Estándar (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.price.standard || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            price: {
                              ...editingItem.price,
                              standard: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Alérgenos y opciones */}
                <div className="border-2 border-gray-200 p-4">
                  <h3 className="font-bold mb-3">⚠️ Alérgenos y Opciones</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Alérgenos (separados por comas)
                      </label>
                      <input
                        type="text"
                        value={editingItem.allergens?.join(", ") || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            allergens: e.target.value
                              .split(",")
                              .map((a) => a.trim())
                              .filter((a) => a),
                          })
                        }
                        placeholder="gluten, lactosa, frutos secos"
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      />
                    </div>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingItem.available}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              available: e.target.checked,
                            })
                          }
                          className="w-5 h-5"
                        />
                        <span>Disponible</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingItem.featured || false}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              featured: e.target.checked,
                            })
                          }
                          className="w-5 h-5"
                        />
                        <span>Destacado</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Orden
                      </label>
                      <input
                        type="number"
                        value={editingItem.order || 0}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            order: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones del modal */}
              <div className="flex gap-4 mt-6">
                <Button
                  onClick={saveItem}
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                >
                  Guardar Item
                </Button>
                <Button
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  variant="outline"
                  className="flex-1 border-2"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante de guardado */}
      <FloatingSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={saveData}
        isSaving={saving}
      />
    </div>
  );
}
