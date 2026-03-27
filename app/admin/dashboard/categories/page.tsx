"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FloatingSaveButton from "@/components/admin/FloatingSaveButton";
import { useUnsavedChanges } from "@/lib/hooks/useUnsavedChanges";

interface Category {
  id: string;
  icon?: string;
  order: number;
  translations: {
    es: string;
    eu: string;
    en: string;
    fr: string;
  };
  itemIds?: string[];
}

interface MainSection {
  id: string;
  type: string;
  icon?: string;
  order: number;
  translations: {
    es: string;
    eu: string;
    en: string;
    fr: string;
  };
  categories: Category[];
}

export default function CategoriesPage() {
  const [sections, setSections] = useState<MainSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    sectionIndex: number;
    categoryIndex: number;
  } | null>(null);
  const router = useRouter();

  // Tracking de cambios sin guardar
  const { hasUnsavedChanges, resetOriginalData } = useUnsavedChanges(
    sections,
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
        return;
      }
      const data = await response.json();
      setSections(data.navigation.mainSections);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/menu");
      const fullData = await response.json();
      fullData.navigation.mainSections = sections;

      const saveResponse = await fetch("/api/admin/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullData),
      });

      if (saveResponse.ok) {
        alert("✅ Cambios guardados correctamente");

        // Recargar datos desde el servidor para tener el estado actualizado
        await loadData();
      } else {
        const errorData = await saveResponse.json();
        console.error("Error al guardar:", errorData);
        alert(
          `❌ Error al guardar cambios: ${errorData.details || errorData.error}`,
        );
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("❌ Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  const addCategory = (sectionIndex: number) => {
    const newCategory: Category = {
      id: `new-category-${Date.now()}`,
      icon: "🍽️",
      order: sections[sectionIndex].categories.length + 1,
      translations: {
        es: "Nueva Categoría",
        eu: "Kategoria Berria",
        en: "New Category",
        fr: "Nouvelle Catégorie",
      },
      itemIds: [],
    };

    const newSections = [...sections];
    newSections[sectionIndex].categories.push(newCategory);
    setSections(newSections);
  };

  const deleteCategory = (sectionIndex: number, categoryIndex: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta categoría?")) {
      return;
    }

    const newSections = [...sections];
    newSections[sectionIndex].categories.splice(categoryIndex, 1);
    setSections(newSections);
  };

  const updateCategory = (
    sectionIndex: number,
    categoryIndex: number,
    field: string,
    value: any,
    locale?: "es" | "eu" | "en" | "fr",
  ) => {
    const newSections = [...sections];
    if (locale) {
      const translations = newSections[sectionIndex].categories[categoryIndex]
        .translations as Record<string, string>;
      translations[locale] = value;
    } else {
      (newSections[sectionIndex].categories[categoryIndex] as any)[field] =
        value;
    }
    setSections(newSections);
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
              <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={saveData}
                disabled={saving}
                className={`
                  transition-all duration-300
                  ${
                    hasUnsavedChanges
                      ? "bg-orange-600 text-white hover:bg-orange-700 shadow-lg animate-pulse"
                      : "bg-white text-black hover:bg-gray-200"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.id}
            className="mb-12 bg-white border-2 border-black p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {section.icon} {section.translations.es}
              </h2>
              <Button
                onClick={() => addCategory(sectionIndex)}
                className="bg-black text-white hover:bg-gray-800"
              >
                + Añadir Categoría
              </Button>
            </div>

            <div className="space-y-4">
              {section.categories.map((category, categoryIndex) => (
                <div key={category.id} className="border-2 border-gray-300 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        ID
                      </label>
                      <input
                        type="text"
                        value={category.id}
                        onChange={(e) =>
                          updateCategory(
                            sectionIndex,
                            categoryIndex,
                            "id",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Icono (emoji)
                      </label>
                      <input
                        type="text"
                        value={category.icon || ""}
                        onChange={(e) =>
                          updateCategory(
                            sectionIndex,
                            categoryIndex,
                            "icon",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Orden
                      </label>
                      <input
                        type="number"
                        value={category.order}
                        onChange={(e) =>
                          updateCategory(
                            sectionIndex,
                            categoryIndex,
                            "order",
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Items ({category.itemIds?.length || 0})
                      </label>
                      <div className="px-3 py-2 border-2 border-gray-300 bg-gray-50">
                        {category.itemIds?.length || 0} items
                      </div>
                    </div>

                    {/* Traducciones */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold mb-2">
                        Traducciones
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            🇪🇸 Español
                          </label>
                          <input
                            type="text"
                            value={category.translations.es}
                            onChange={(e) =>
                              updateCategory(
                                sectionIndex,
                                categoryIndex,
                                "translations",
                                e.target.value,
                                "es",
                              )
                            }
                            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            🏴 Euskera
                          </label>
                          <input
                            type="text"
                            value={category.translations.eu}
                            onChange={(e) =>
                              updateCategory(
                                sectionIndex,
                                categoryIndex,
                                "translations",
                                e.target.value,
                                "eu",
                              )
                            }
                            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            🇬🇧 English
                          </label>
                          <input
                            type="text"
                            value={category.translations.en}
                            onChange={(e) =>
                              updateCategory(
                                sectionIndex,
                                categoryIndex,
                                "translations",
                                e.target.value,
                                "en",
                              )
                            }
                            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            🇫🇷 Français
                          </label>
                          <input
                            type="text"
                            value={category.translations.fr}
                            onChange={(e) =>
                              updateCategory(
                                sectionIndex,
                                categoryIndex,
                                "translations",
                                e.target.value,
                                "fr",
                              )
                            }
                            className="w-full px-3 py-2 border-2 border-gray-300 focus:border-black"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() =>
                        deleteCategory(sectionIndex, categoryIndex)
                      }
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Eliminar Categoría
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}{" "}
      </main>

      {/* Botón flotante de guardado */}
      <FloatingSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={saveData}
        isSaving={saving}
      />
    </div>
  );
}
