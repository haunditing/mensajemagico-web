import React from "react";
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
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  onClick,
  isLoading,
  safetyError,
  user,
  remainingCredits,
  isOccasionLocked,
  isPensamiento,
  isGreeting,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || !!safetyError || (!!user && remainingCredits <= 0) || isOccasionLocked}
      className={`w-full h-14 md:h-16 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
        ${isLoading || safetyError || (!!user && remainingCredits <= 0) || isOccasionLocked ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.98]"}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" color="slate" />
          <span>
            {isPensamiento ? "Mezclando pensamientos..." : isGreeting ? "Creando saludo..." : "Generando magia..."}
          </span>
        </div>
      ) : (
        <span>
          {safetyError ? "Contenido bloqueado" : isOccasionLocked ? "Ocasión Premium 🔒" : !!user && remainingCredits <= 0 ? "Sin créditos hoy" : isPensamiento ? "Obtener mi pensamiento" : "Generar Mensaje Mágico"}
        </span>
      )}
    </button>
  );
};

export default GenerateButton;