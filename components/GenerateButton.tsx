import React, { useMemo } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  safetyError: string | null;
  user: any;
  remainingCredits: number;
  isOccasionLocked: boolean;
  isPensamiento: boolean;
  isGreeting: boolean;
  disabled?: boolean;
  disabledLabel?: string;
}

const MAGIC_TEXTS = [
  "Generar Mensaje Mágico",
  "Crear Magia ✨",
  "Inspirarme Ahora",
  "Sorpréndeme",
  "Redactar por mí",
];

const THOUGHT_TEXTS = [
  "Obtener mi pensamiento",
  "Reflexionar ahora",
  "Inspirar mi día",
  "Descubrir mensaje",
];

const GenerateButton: React.FC<GenerateButtonProps> = ({
  onClick,
  isLoading,
  safetyError,
  user,
  remainingCredits,
  isOccasionLocked,
  isPensamiento,
  isGreeting,
  disabled = false,
  disabledLabel,
}) => {
  const buttonLabel = useMemo(() => {
    const options = isPensamiento ? THOUGHT_TEXTS : MAGIC_TEXTS;
    return options[Math.floor(Math.random() * options.length)];
  }, [isPensamiento]);

  // Bloqueo "duro": El botón no hace nada (loading, sin créditos, etc.)
  const isDomDisabled = isLoading || !!safetyError || (!!user && remainingCredits <= 0) || isOccasionLocked;
  
  // Bloqueo "visual": Incluye el estado 'disabled' (falta texto) para mostrarlo gris.
  const isVisuallyDisabled = isDomDisabled || disabled;

  return (
    <button
      onClick={onClick}
      disabled={isVisuallyDisabled}
      className={`w-full h-14 md:h-16 rounded-xl font-bold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 md:gap-3 transition-all relative overflow-hidden group
        ${isVisuallyDisabled ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700" : "bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500 shadow-lg shadow-blue-600/20 dark:shadow-blue-900/30 active:scale-[0.98]"}`}
    >
      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .animate-shine {
          animation: shine 3s infinite linear;
        }
      `}</style>
      {!isVisuallyDisabled && !isLoading && (
        <div className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shine pointer-events-none" />
      )}

      {isLoading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" color="slate" />
          <span>
            {isPensamiento ? "Mezclando pensamientos..." : isGreeting ? "Creando saludo..." : "Generando magia..."}
          </span>
        </div>
      ) : (
        <span>
          {safetyError
            ? "Contenido bloqueado"
            : isOccasionLocked
              ? "Ocasión Premium 🔒"
              : !!user && remainingCredits <= 0
                ? "Sin créditos hoy"
                : disabled && disabledLabel
                  ? disabledLabel
                  : buttonLabel}
        </span>
      )}
    </button>
  );
};

export default GenerateButton;