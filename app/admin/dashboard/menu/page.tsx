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
  mainSectionId?: string;
  translations: {
    es: Translation;
    eu: Translation;
    en: Translation;
    fr: Translation;
  };
  price?: any;
  pricing?: any;
  allergens?: string[];
  available: boolean;
  featured?: boolean;
  order?: number;
}

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

export default function MenuManagementPage() {
  const [sections, setSections] = useState<MainSection[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const router = useRouter();

  // Tracking de cambios sin guardar
  const { hasUnsavedChanges, resetOriginalData } = useUnsavedChanges(
    { sections, items },
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

      // Solo cargar secciones que NO son "menu" (menú del día)
      const cartaSections = data.navigation.mainSections.filter(
        (s: any) => s.id !== "menu",
      );
      setSections(cartaSections);

      // Solo cargar items que pertenecen a secciones de carta/bebidas
      const itemsArray = data.items ? Object.values(data.items) : [];
      const cartaItems = (itemsArray as MenuItem[]).filter(
        (item) => item.mainSectionId !== "menu",
      );
      setItems(cartaItems);

      // Expandir primera sección por defecto
      if (cartaSections.length > 0) {
        setExpandedSections(new Set([cartaSections[0].id]));
      }
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

      // Mantener items del menú del día (no los modificamos desde este panel)
      const menuItems = Object.values(fullData.items).filter(
        (item: any) => item.mainSectionId === "menu",
      );

      // Actualizar solo las secciones de carta/bebidas
      fullData.navigation.mainSections = fullData.navigation.mainSections.map(
        (section: any) => {
          if (section.id === "menu") {
            // No modificar la sección de menú del día
            return section;
          }
          // Actualizar secciones de carta/bebidas
          const updatedSection = sections.find((s) => s.id === section.id);
          if (updatedSection) {
            return {
              ...updatedSection,
              categories: updatedSection.categories.map((category) => {
                const categoryItems = items
                  .filter((item) => item.categoryId === category.id)
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((item) => item.id);

                return {
                  ...category,
                  itemIds: categoryItems,
                };
              }),
            };
          }
          return section;
        },
      );

      // Convertir items array a objeto, preservando items del menú del día
      const itemsObject: any = {};

      // Primero añadir items del menú del día
      menuItems.forEach((item: any) => {
        itemsObject[item.id] = item;
      });

      // Luego añadir/actualizar items de carta/bebidas
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
        loadData();
        // Resetear tracking después de recargar
        setTimeout(() => resetOriginalData({ sections, items }), 100);
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

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getItemsByCategory = (categoryId: string) => {
    return items.filter((item) => item.categoryId === categoryId);
  };

  const addNewItem = (categoryId: string) => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      categoryId,
      translations: {
        es: { name: "Nuevo Plato", description: "" },
        eu: { name: "Plater Berria", description: "" },
        en: { name: "New Dish", description: "" },
        fr: { name: "Nouveau Plat", description: "" },
      },
      pricing: {
        type: "unit-portion",
        currency: "EUR",
        values: { fullPortion: 0 },
      },
      available: true,
      order: items.filter((i) => i.categoryId === categoryId).length + 1,
    };
    setEditingItem(newItem);
    setShowItemModal(true);
  };

  const editItem = (item: MenuItem) => {
    setEditingItem({ ...item });
    setShowItemModal(true);
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

    setShowItemModal(false);
    setEditingItem(null);
  };

  const deleteItem = (itemId: string) => {
    if (!confirm("¿Eliminar este item?")) return;
    setItems(items.filter((i) => i.id !== itemId));
  };

  const toggleItemAvailability = (itemId: string) => {
    setItems(
      items.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item,
      ),
    );
  };

  const addNewCategory = (sectionIndex: number) => {
    const newCategory: Category = {
      id: `category-${Date.now()}`,
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
    setEditingCategory(newCategory);
    setShowCategoryModal(true);
  };

  const saveCategory = () => {
    if (!editingCategory) return;

    const newSections = [...sections];
    const sectionIndex = newSections.findIndex((s) =>
      s.categories.some((c) => c.id === editingCategory.id),
    );

    if (sectionIndex >= 0) {
      const categoryIndex = newSections[sectionIndex].categories.findIndex(
        (c) => c.id === editingCategory.id,
      );
      newSections[sectionIndex].categories[categoryIndex] = editingCategory;
    } else {
      // Nueva categoría, añadir a primera sección
      newSections[0].categories.push(editingCategory);
    }

    setSections(newSections);
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando menú...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white shadow-lg border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
                <img
                  src="/images/logo_cachon_oficial2.png"
                  alt="Bar Cachón"
                  className="h-10 w-auto"
                />
              </Link>
              <div>
                <Link
                  href="/admin/dashboard"
                  className="text-sm text-gray-400 hover:text-white mb-1 inline-block transition-colors"
                >
                  ← Volver al Dashboard
                </Link>
                <h1 className="text-lg font-semibold">
                  Gestión de Carta y Bebidas
                </h1>
              </div>
            </div>
            <Button
              onClick={saveData}
              disabled={saving}
              className={`
                border-0 transition-all duration-300 rounded-md font-medium
                ${
                  hasUnsavedChanges
                    ? "bg-orange-600 text-white hover:bg-orange-700 animate-pulse"
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="mb-6">
            {/* Section Header */}
            <div
              onClick={() => toggleSection(section.id)}
              className="bg-gray-900 text-white p-4 cursor-pointer hover:bg-gray-800 transition-colors rounded-t-lg shadow-sm border border-gray-800"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">{section.icon}</span>
                  <span>{section.translations.es}</span>
                  <span className="text-xs ml-2 text-gray-400 bg-gray-800 px-2.5 py-1 rounded">
                    {section.categories.length} categorías
                  </span>
                </h2>
                <div className="flex gap-2 items-center">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addNewCategory(sectionIndex);
                    }}
                    className="bg-white text-black hover:bg-gray-200 rounded-md font-medium text-sm"
                    size="sm"
                  >
                    Añadir Categoría
                  </Button>
                  <span className="text-lg">
                    {expandedSections.has(section.id) ? "▼" : "▶"}
                  </span>
                </div>
              </div>
            </div>

            {/* Categories */}
            {expandedSections.has(section.id) && (
              <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 border-t-0">
                {section.categories.map((category) => (
                  <div
                    key={category.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    {/* Category Header */}
                    <div
                      onClick={() => toggleCategory(category.id)}
                      className="bg-gray-100 p-3 cursor-pointer hover:bg-gray-200 transition-colors flex justify-between items-center"
                    >
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <span>{category.translations.es}</span>
                        <span className="text-xs ml-2 text-gray-600 bg-gray-200 px-2 py-0.5 rounded">
                          {getItemsByCategory(category.id).length} items
                        </span>
                      </h3>
                      <div className="flex gap-2 items-center">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            addNewItem(category.id);
                          }}
                          size="sm"
                          className="bg-black text-white hover:bg-gray-800 rounded-md text-sm"
                        >
                          Añadir Item
                        </Button>
                        <span className="text-gray-600">
                          {expandedCategories.has(category.id) ? "▼" : "▶"}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    {expandedCategories.has(category.id) && (
                      <div className="p-4 space-y-3 bg-white">
                        {getItemsByCategory(category.id).length === 0 ? (
                          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md border border-dashed border-gray-300">
                            <div className="text-sm font-medium mb-1">
                              Sin items
                            </div>
                            <div className="text-xs">
                              Haz clic en "Añadir Item" para crear uno
                            </div>
                          </div>
                        ) : (
                          getItemsByCategory(category.id).map((item) => (
                            <div
                              key={item.id}
                              className={`rounded-md p-3.5 flex justify-between items-start transition-all ${
                                item.available
                                  ? "border border-gray-300 bg-white hover:border-gray-900"
                                  : "border border-gray-200 bg-gray-50 opacity-60"
                              }`}
                            >
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 text-sm">
                                  {item.translations.es.name}
                                  {!item.available && (
                                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                      NO DISPONIBLE
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600 mt-0.5">
                                  {item.translations.es.description}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {item.id}
                                </div>
                              </div>
                              <div className="flex gap-1.5 ml-4">
                                <Button
                                  onClick={() => editItem(item)}
                                  size="sm"
                                  className="bg-black text-white hover:bg-gray-800 text-xs"
                                >
                                  Editar información
                                </Button>
                                <Button
                                  onClick={() =>
                                    toggleItemAvailability(item.id)
                                  }
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-300 text-gray-700 hover:bg-gray-100 text-xs"
                                >
                                  {item.available
                                    ? "Ocultar de la carta"
                                    : "Mostrar en la carta"}
                                </Button>
                                <Button
                                  onClick={() => deleteItem(item.id)}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                                >
                                  Eliminar de la carta
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </main>

      {/* Modal: Editar Item */}
      {showItemModal && editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="px-8 py-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {items.find((i) => i.id === editingItem.id)
                  ? "Editar información"
                  : "Nuevo Item"}
              </h2>
            </div>

            <div className="px-8 py-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Español */}
              <div className="border-2 border-gray-200 rounded-xl p-5 bg-linear-to-br from-white to-gray-50 hover:border-gray-300 transition-all">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🇪🇸</span> Español (ES)
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                      placeholder="Ej: Croquetas caseras"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                      placeholder="Descripción opcional"
                    />
                  </div>
                </div>
              </div>

              {/* Euskera */}
              <div className="border-2 border-gray-200 rounded-xl p-5 bg-linear-to-br from-white to-gray-50 hover:border-gray-300 transition-all">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🏴</span> Euskera (EU)
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Izena
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                      placeholder="Adib: Kroketa etxekoak"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Deskribapena
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                      placeholder="Aukerazko deskribapena"
                    />
                  </div>
                </div>
              </div>

              {/* English */}
              <div className="border-2 border-gray-200 rounded-xl p-5 bg-linear-to-br from-white to-gray-50 hover:border-gray-300 transition-all">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🇬🇧</span> English (EN)
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Name
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                      placeholder="Ex: Homemade croquettes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                      placeholder="Optional description"
                    />
                  </div>
                </div>
              </div>

              {/* Français */}
              <div className="border-2 border-gray-200 rounded-xl p-5 bg-linear-to-br from-white to-gray-50 hover:border-gray-300 transition-all">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🇫🇷</span> Français (FR)
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Nom
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                      placeholder="Ex: Croquettes maison"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                      placeholder="Description facultative"
                    />
                  </div>
                </div>
              </div>

              {/* Precio */}
              <div className="border-2 border-gray-200 rounded-xl p-5 bg-linear-to-br from-white to-gray-50">
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  💰 Precio
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Precio (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={
                      editingItem.pricing?.values?.fullPortion ||
                      editingItem.pricing?.values?.standard ||
                      editingItem.pricing?.values?.single ||
                      editingItem.pricing?.values?.unit ||
                      editingItem.pricing?.values?.small ||
                      editingItem.pricing?.values?.glass ||
                      editingItem.pricing?.values?.menu ||
                      editingItem.price?.standard ||
                      0
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (editingItem.pricing) {
                        const pricingType = editingItem.pricing.type;
                        let priceKey = "standard";

                        if (pricingType === "unit-portion") {
                          priceKey = "fullPortion";
                        } else if (pricingType === "single") {
                          priceKey = "single";
                        } else if (pricingType === "small-large") {
                          priceKey = "small";
                        } else if (pricingType === "glass-bottle") {
                          priceKey = "glass";
                        } else if (pricingType === "menu") {
                          priceKey = "menu";
                        }

                        setEditingItem({
                          ...editingItem,
                          pricing: {
                            ...editingItem.pricing,
                            values: {
                              ...editingItem.pricing.values,
                              [priceKey]: value,
                            },
                          },
                        });
                      } else {
                        setEditingItem({
                          ...editingItem,
                          price: { ...editingItem.price, standard: value },
                        });
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Tipo: {editingItem.pricing?.type || "standard"}
                    {editingItem.pricing?.type === "unit-portion" &&
                      " (Precio por ración)"}
                    {editingItem.pricing?.type === "small-large" &&
                      " (Precio pequeño)"}
                    {editingItem.pricing?.type === "glass-bottle" &&
                      " (Precio copa)"}
                  </p>
                </div>
              </div>

              {/* Disponibilidad */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  id="available"
                  checked={editingItem.available}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      available: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <label
                  htmlFor="available"
                  className="text-sm font-semibold text-gray-800"
                >
                  Disponible para los clientes
                </label>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <Button
                onClick={() => {
                  setShowItemModal(false);
                  setEditingItem(null);
                }}
                variant="outline"
                className="border-2 border-gray-300 hover:bg-white hover:border-gray-400 px-6 transition-all"
              >
                Cancelar
              </Button>
              <Button
                onClick={saveItem}
                className="bg-linear-to-r from-gray-900 to-black text-white hover:from-gray-800 hover:to-gray-900 px-6 shadow-lg transition-all"
              >
                Guardar Cambios
              </Button>
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
