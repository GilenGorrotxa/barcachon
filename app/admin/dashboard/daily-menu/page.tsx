"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MenuItem {
  id: string;
  slug: string;
  categoryId: string;
  mainSectionId: string;
  courseType?: string;
  translations: {
    es: { name: string; description?: string };
    eu: { name: string; description?: string };
    en: { name: string; description?: string };
    fr: { name: string; description?: string };
  };
  pricing: {
    type: string;
    currency: string;
    values: { [key: string]: number };
  };
  available: boolean;
  featured: boolean;
  order: number;
}

interface MenuData {
  navigation: any;
  items: { [key: string]: MenuItem };
}

export default function DailyMenuPage() {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [primerosPlatos, setPrimerosPlatos] = useState<MenuItem[]>([]);
  const [segundosPlatos, setSegundosPlatos] = useState<MenuItem[]>([]);
  const [postresItems, setPostresItems] = useState<MenuItem[]>([]);
  const [price, setPrice] = useState(17.5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["primeros", "segundos", "postres"]),
  );
  const router = useRouter();

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

      setMenuData(data);

      // Extraer items del menú del día
      const menuItems = Object.values(data.items).filter(
        (item: any) => item.categoryId === "menu-del-dia",
      ) as MenuItem[];

      // Separar primeros y segundos platos
      const primeros = menuItems.filter(
        (item) => item.courseType === "primeros",
      );
      primeros.sort((a, b) => a.order - b.order);
      setPrimerosPlatos(primeros);

      const segundos = menuItems.filter(
        (item) => item.courseType === "segundos",
      );
      segundos.sort((a, b) => a.order - b.order);
      setSegundosPlatos(segundos);

      // Extraer postres
      const postres = Object.values(data.items).filter(
        (item: any) => item.categoryId === "postres",
      ) as MenuItem[];
      postres.sort((a, b) => a.order - b.order);
      setPostresItems(postres);

      // Obtener precio del menú del día
      if (data.menuConfig?.dailyMenu?.price) {
        setPrice(data.menuConfig.dailyMenu.price);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    if (!menuData) return;

    setSaving(true);
    try {
      // Mantener items que NO son del menú del día ni postres
      const otherItems: any = {};
      Object.keys(menuData.items).forEach((itemId) => {
        const item = menuData.items[itemId];
        if (item.mainSectionId !== "menu") {
          otherItems[itemId] = item;
        }
      });

      // Construir objeto de items actualizado: otros items + items actuales del menú
      const updatedItems = { ...otherItems };

      // Añadir items actuales del menú del día (primeros y segundos) y postres
      primerosPlatos.forEach((item) => {
        updatedItems[item.id] = item;
      });
      segundosPlatos.forEach((item) => {
        updatedItems[item.id] = item;
      });
      postresItems.forEach((item) => {
        updatedItems[item.id] = item;
      });

      // Actualizar los itemIds en navigation
      const updatedNavigation = { ...menuData.navigation };
      const menuSection = updatedNavigation.mainSections.find(
        (s: any) => s.id === "menu",
      );

      if (menuSection) {
        // Actualizar itemIds de menu-del-dia (primeros + segundos juntos)
        const menuDelDiaCategory = menuSection.categories.find(
          (c: any) => c.id === "menu-del-dia",
        );
        if (menuDelDiaCategory) {
          menuDelDiaCategory.itemIds = [
            ...primerosPlatos.map((item) => item.id),
            ...segundosPlatos.map((item) => item.id),
          ];
        }

        // Actualizar itemIds de postres
        const postresCategory = menuSection.categories.find(
          (c: any) => c.id === "postres",
        );
        if (postresCategory) {
          postresCategory.itemIds = postresItems.map((item) => item.id);
        }
      }

      const updatedData: any = {
        ...menuData,
        items: updatedItems,
        navigation: updatedNavigation,
      };

      // Actualizar también el precio del menú del día
      if (!updatedData.menuConfig) {
        updatedData.menuConfig = { dailyMenu: { price: 17.5, labels: {} } };
      }
      if (!updatedData.menuConfig.dailyMenu) {
        updatedData.menuConfig.dailyMenu = { price: 17.5, labels: {} };
      }
      updatedData.menuConfig.dailyMenu.price = price;

      const saveResponse = await fetch("/api/admin/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (saveResponse.ok) {
        alert("✅ Menú del día guardado correctamente");
        loadData();
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

  const addNewPrimerPlato = () => {
    const newId = `menu-del-dia-primeros-${String(primerosPlatos.length + 1).padStart(3, "0")}`;
    const newItem: MenuItem = {
      id: newId,
      slug: `primer-plato-${primerosPlatos.length + 1}`,
      categoryId: "menu-del-dia",
      mainSectionId: "menu",
      courseType: "primeros",
      translations: {
        es: { name: "" },
        eu: { name: "" },
        en: { name: "" },
        fr: { name: "" },
      },
      pricing: {
        type: "menu",
        currency: "EUR",
        values: { menu: price },
      },
      available: true,
      featured: false,
      order: primerosPlatos.length + 1,
    };
    setEditingItem(newItem);
    setShowItemModal(true);
  };

  const addNewSegundoPlato = () => {
    const newId = `menu-del-dia-segundos-${String(segundosPlatos.length + 1).padStart(3, "0")}`;
    const newItem: MenuItem = {
      id: newId,
      slug: `segundo-plato-${segundosPlatos.length + 1}`,
      categoryId: "menu-del-dia",
      mainSectionId: "menu",
      courseType: "segundos",
      translations: {
        es: { name: "" },
        eu: { name: "" },
        en: { name: "" },
        fr: { name: "" },
      },
      pricing: {
        type: "menu",
        currency: "EUR",
        values: { menu: price },
      },
      available: true,
      featured: false,
      order: segundosPlatos.length + 1,
    };
    setEditingItem(newItem);
    setShowItemModal(true);
  };

  const addNewPostre = () => {
    const newId = `postres-${String(postresItems.length + 1).padStart(3, "0")}`;
    const newItem: MenuItem = {
      id: newId,
      slug: `postre-${postresItems.length + 1}`,
      categoryId: "postres",
      mainSectionId: "menu",
      translations: {
        es: { name: "" },
        eu: { name: "" },
        en: { name: "" },
        fr: { name: "" },
      },
      pricing: {
        type: "menu",
        currency: "EUR",
        values: { menu: 0 },
      },
      available: true,
      featured: false,
      order: postresItems.length + 1,
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

    if (editingItem.categoryId === "menu-del-dia") {
      if (editingItem.courseType === "primeros") {
        const existingIndex = primerosPlatos.findIndex(
          (i) => i.id === editingItem.id,
        );
        if (existingIndex >= 0) {
          const newItems = [...primerosPlatos];
          newItems[existingIndex] = editingItem;
          setPrimerosPlatos(newItems);
        } else {
          setPrimerosPlatos([...primerosPlatos, editingItem]);
        }
      } else if (editingItem.courseType === "segundos") {
        const existingIndex = segundosPlatos.findIndex(
          (i) => i.id === editingItem.id,
        );
        if (existingIndex >= 0) {
          const newItems = [...segundosPlatos];
          newItems[existingIndex] = editingItem;
          setSegundosPlatos(newItems);
        } else {
          setSegundosPlatos([...segundosPlatos, editingItem]);
        }
      }
    } else if (editingItem.categoryId === "postres") {
      const existingIndex = postresItems.findIndex(
        (i) => i.id === editingItem.id,
      );
      if (existingIndex >= 0) {
        const newItems = [...postresItems];
        newItems[existingIndex] = editingItem;
        setPostresItems(newItems);
      } else {
        setPostresItems([...postresItems, editingItem]);
      }
    }

    setShowItemModal(false);
    setEditingItem(null);
  };

  const deleteItem = (itemId: string, courseType: string) => {
    if (!confirm("¿Eliminar este item?")) return;

    if (courseType === "primeros") {
      setPrimerosPlatos(primerosPlatos.filter((i) => i.id !== itemId));
    } else if (courseType === "segundos") {
      setSegundosPlatos(segundosPlatos.filter((i) => i.id !== itemId));
    } else if (courseType === "postres") {
      setPostresItems(postresItems.filter((i) => i.id !== itemId));
    }
  };

  const toggleItemAvailability = (itemId: string, courseType: string) => {
    if (courseType === "primeros") {
      setPrimerosPlatos(
        primerosPlatos.map((item) =>
          item.id === itemId ? { ...item, available: !item.available } : item,
        ),
      );
    } else if (courseType === "segundos") {
      setSegundosPlatos(
        segundosPlatos.map((item) =>
          item.id === itemId ? { ...item, available: !item.available } : item,
        ),
      );
    } else if (courseType === "postres") {
      setPostresItems(
        postresItems.map((item) =>
          item.id === itemId ? { ...item, available: !item.available } : item,
        ),
      );
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
      <header className="bg-black text-white shadow-lg border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
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
                <h1 className="text-lg font-semibold">Menú del Día</h1>
              </div>
            </div>
            <Button
              onClick={saveData}
              disabled={saving}
              className="bg-white text-black hover:bg-gray-200 border-0 transition-colors rounded-md font-medium"
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Configuración del Precio */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Precio del Menú
          </h2>
          <div className="flex items-center gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Precio (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="px-4 py-2 rounded-md border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-lg font-semibold w-32 transition-all"
            />
          </div>
        </div>

        {/* PRIMEROS PLATOS */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection("primeros")}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-xl">🥗</span>
              <span>Primeros Platos</span>
              <span className="text-xs text-gray-600 bg-gray-200 px-2.5 py-1 rounded">
                {primerosPlatos.length}
              </span>
            </h2>
            <span className="text-gray-600">
              {expandedSections.has("primeros") ? "▼" : "▶"}
            </span>
          </button>

          {expandedSections.has("primeros") && (
            <div className="px-6 pb-6">
              <Button
                onClick={addNewPrimerPlato}
                className="mb-4 bg-black text-white hover:bg-gray-800 rounded-md text-sm"
                size="sm"
              >
                Añadir Primer Plato
              </Button>

              <div className="space-y-3">
                {primerosPlatos.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-300 rounded-md hover:border-gray-900 transition-colors"
                  >
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.translations.es.name || "Sin nombre"}
                      </h3>
                      <p className="text-xs text-gray-600">ID: {item.id}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => editItem(item)}
                        size="sm"
                        variant="outline"
                        className="border border-gray-300 hover:bg-gray-100 text-xs"
                      >
                        Editar información
                      </Button>
                      <Button
                        onClick={() =>
                          toggleItemAvailability(
                            item.id,
                            item.courseType || "primeros",
                          )
                        }
                        size="sm"
                        variant="outline"
                        className={`text-xs border ${
                          item.available
                            ? "border-green-300 text-green-700 hover:bg-green-50"
                            : "border-red-300 text-red-700 hover:bg-red-50"
                        }`}
                      >
                        {item.available
                          ? "Ocultar de la carta"
                          : "Mostrar en la carta"}
                      </Button>
                      <Button
                        onClick={() =>
                          deleteItem(item.id, item.courseType || "primeros")
                        }
                        size="sm"
                        variant="outline"
                        className="border border-red-300 text-red-600 hover:bg-red-50 text-xs"
                      >
                        Eliminar de la carta
                      </Button>
                    </div>
                  </div>
                ))}

                {primerosPlatos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No hay primeros platos</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SEGUNDOS PLATOS */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection("segundos")}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-xl">🍖</span>
              <span>Segundos Platos</span>
              <span className="text-xs text-gray-600 bg-gray-200 px-2.5 py-1 rounded">
                {segundosPlatos.length}
              </span>
            </h2>
            <span className="text-gray-600">
              {expandedSections.has("segundos") ? "▼" : "▶"}
            </span>
          </button>

          {expandedSections.has("segundos") && (
            <div className="px-6 pb-6">
              <Button
                onClick={addNewSegundoPlato}
                className="mb-4 bg-black text-white hover:bg-gray-800 rounded-md text-sm"
                size="sm"
              >
                Añadir Segundo Plato
              </Button>

              <div className="space-y-3">
                {segundosPlatos.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-300 rounded-md hover:border-gray-900 transition-colors"
                  >
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.translations.es.name || "Sin nombre"}
                      </h3>
                      <p className="text-xs text-gray-600">ID: {item.id}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => editItem(item)}
                        size="sm"
                        variant="outline"
                        className="border border-gray-300 hover:bg-gray-100 text-xs"
                      >
                        Editar información
                      </Button>
                      <Button
                        onClick={() =>
                          toggleItemAvailability(
                            item.id,
                            item.courseType || "segundos",
                          )
                        }
                        size="sm"
                        variant="outline"
                        className={`text-xs border ${
                          item.available
                            ? "border-green-300 text-green-700 hover:bg-green-50"
                            : "border-red-300 text-red-700 hover:bg-red-50"
                        }`}
                      >
                        {item.available
                          ? "Ocultar de la carta"
                          : "Mostrar en la carta"}
                      </Button>
                      <Button
                        onClick={() =>
                          deleteItem(item.id, item.courseType || "segundos")
                        }
                        size="sm"
                        variant="outline"
                        className="border border-red-300 text-red-600 hover:bg-red-50 text-xs"
                      >
                        Eliminar de la carta
                      </Button>
                    </div>
                  </div>
                ))}

                {segundosPlatos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No hay segundos platos</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* POSTRES */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection("postres")}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-xl">🍰</span>
              <span>Postres</span>
              <span className="text-xs text-gray-600 bg-gray-200 px-2.5 py-1 rounded">
                {postresItems.length}
              </span>
            </h2>
            <span className="text-gray-600">
              {expandedSections.has("postres") ? "▼" : "▶"}
            </span>
          </button>

          {expandedSections.has("postres") && (
            <div className="px-6 pb-6">
              <Button
                onClick={addNewPostre}
                className="mb-4 bg-black text-white hover:bg-gray-800 rounded-md text-sm"
                size="sm"
              >
                Añadir Item
              </Button>

              <div className="space-y-3">
                {postresItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-300 rounded-md hover:border-gray-900 transition-colors"
                  >
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.translations.es.name || "Sin nombre"}
                      </h3>
                      <p className="text-xs text-gray-600">ID: {item.id}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => editItem(item)}
                        size="sm"
                        variant="outline"
                        className="border border-gray-300 hover:bg-gray-100 text-xs"
                      >
                        Editar información
                      </Button>
                      <Button
                        onClick={() =>
                          toggleItemAvailability(item.id, "postres")
                        }
                        size="sm"
                        variant="outline"
                        className={`text-xs border ${
                          item.available
                            ? "border-green-300 text-green-700 hover:bg-green-50"
                            : "border-red-300 text-red-700 hover:bg-red-50"
                        }`}
                      >
                        {item.available
                          ? "Ocultar de la carta"
                          : "Mostrar en la carta"}
                      </Button>
                      <Button
                        onClick={() => deleteItem(item.id, "postres")}
                        size="sm"
                        variant="outline"
                        className="border border-red-300 text-red-600 hover:bg-red-50 text-xs"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}

                {postresItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No hay postres</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Edición */}
      {showItemModal && editingItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="px-8 py-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingItem.id.startsWith("menu-del-dia-") &&
                !menuData?.items[editingItem.id]
                  ? "Nuevo Primer Plato"
                  : editingItem.id.startsWith("postres-") &&
                      !menuData?.items[editingItem.id]
                    ? "Nuevo Postre"
                    : "Editar información"}
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
                      {editingItem.categoryId === "menu-del-dia"
                        ? "Primer Plato"
                        : "Nombre"}
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
                      placeholder="Ej: Ensalada mixta"
                    />
                  </div>
                  {editingItem.categoryId === "menu-del-dia" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Segundo Plato
                      </label>
                      <input
                        type="text"
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                        placeholder="Ej: Merluza a la plancha"
                      />
                    </div>
                  )}
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
                      {editingItem.categoryId === "menu-del-dia"
                        ? "Primer Plato"
                        : "Nombre"}
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
                      placeholder="Adib: Entsalada mistoa"
                    />
                  </div>
                  {editingItem.categoryId === "menu-del-dia" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Segundo Plato
                      </label>
                      <input
                        type="text"
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                        placeholder="Adib: Legatza planxan"
                      />
                    </div>
                  )}
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
                      {editingItem.categoryId === "menu-del-dia"
                        ? "First Course"
                        : "Name"}
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
                      placeholder="Ex: Mixed salad"
                    />
                  </div>
                  {editingItem.categoryId === "menu-del-dia" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Second Course
                      </label>
                      <input
                        type="text"
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                        placeholder="Ex: Grilled hake"
                      />
                    </div>
                  )}
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
                      {editingItem.categoryId === "menu-del-dia"
                        ? "Premier Plat"
                        : "Nom"}
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
                      placeholder="Ex: Salade mixte"
                    />
                  </div>
                  {editingItem.categoryId === "menu-del-dia" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Deuxième Plat
                      </label>
                      <input
                        type="text"
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all"
                        placeholder="Ex: Merlu grillé"
                      />
                    </div>
                  )}
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
    </div>
  );
}
