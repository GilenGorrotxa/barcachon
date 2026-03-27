"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface FloatingSaveButtonProps {
  hasUnsavedChanges: boolean;
  onSave: () => void;
  isSaving: boolean;
  changeCount?: number;
}

export default function FloatingSaveButton({
  hasUnsavedChanges,
  onSave,
  isSaving,
  changeCount,
}: FloatingSaveButtonProps) {
  const [shake, setShake] = useState(false);

  // Animación de shake cada 30 segundos si hay cambios
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const interval = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }, 30000);

    return () => clearInterval(interval);
  }, [hasUnsavedChanges]);

  if (!hasUnsavedChanges) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="relative">
        {/* Badge de contador de cambios */}
        {changeCount !== undefined && changeCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {changeCount}
          </div>
        )}

        {/* Botón principal con animación */}
        <Button
          onClick={onSave}
          disabled={isSaving}
          className={`
            bg-orange-600 hover:bg-orange-700 text-white
            px-6 py-6 text-lg font-bold
            shadow-2xl hover:shadow-orange-500/50
            transition-all duration-300
            ${shake ? "animate-shake" : ""}
            ${hasUnsavedChanges ? "animate-pulse-slow" : ""}
          `}
          style={{
            borderRadius: "50px",
            minWidth: "180px",
            animation:
              hasUnsavedChanges && !shake
                ? "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                : undefined,
          }}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Guardando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              💾 Guardar Ahora
              {changeCount !== undefined && changeCount > 0 && (
                <span className="text-sm opacity-80">
                  ({changeCount} cambios)
                </span>
              )}
            </span>
          )}
        </Button>
      </div>

      {/* Indicador de cambios sin guardar */}
      <div className="mt-2 text-center">
        <span className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full shadow-md">
          ⚠️ Cambios sin guardar
        </span>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(234, 88, 12, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 30px rgba(234, 88, 12, 0.6);
            transform: scale(1.05);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-shake {
          animation: shake 0.5s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
