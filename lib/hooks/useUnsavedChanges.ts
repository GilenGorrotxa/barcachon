import { useEffect, useState, useRef } from "react";

/**
 * Hook para detectar cambios sin guardar y mostrar confirmación antes de salir
 * @param data - Datos actuales que se están editando
 * @param hasLoadedInitialData - Flag que indica si ya se cargaron los datos iniciales
 * @returns objeto con hasUnsavedChanges y resetOriginalData
 */
export function useUnsavedChanges<T>(
  data: T,
  hasLoadedInitialData: boolean = true,
) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalDataRef = useRef<string | null>(null);
  const isFirstLoadRef = useRef(true);

  // Guardar snapshot inicial cuando se cargan los datos
  useEffect(() => {
    if (hasLoadedInitialData && isFirstLoadRef.current) {
      originalDataRef.current = JSON.stringify(data);
      isFirstLoadRef.current = false;
      setHasUnsavedChanges(false);
    }
  }, [hasLoadedInitialData, data]);

  // Detectar cambios comparando con el snapshot original
  useEffect(() => {
    if (!hasLoadedInitialData || isFirstLoadRef.current) return;

    const currentDataString = JSON.stringify(data);
    const hasChanges = currentDataString !== originalDataRef.current;
    setHasUnsavedChanges(hasChanges);
  }, [data, hasLoadedInitialData]);

  // Confirmación antes de salir de la página
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Función para resetear el estado después de guardar
  const resetOriginalData = (newData: T) => {
    originalDataRef.current = JSON.stringify(newData);
    setHasUnsavedChanges(false);
  };

  return {
    hasUnsavedChanges,
    resetOriginalData,
  };
}
