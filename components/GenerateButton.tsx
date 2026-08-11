import React, { useMemo } from "react";
import Button from "./ui/Button";
import { getLockedOccasionLabel } from "../services/accessCopy";

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
  isPremium?: boolean;
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
  isPremium = false,
}) => {
  const buttonLabel = useMemo(() => {
    const options = isPensamiento ? THOUGHT_TEXTS : MAGIC_TEXTS;
    return options[Math.floor(Math.random() * options.length)];
  }, [isPensamiento]);

  const hasCredits = isPremium || !user || remainingCredits > 0;

  // Bloqueo "duro": El botón no hace nada (loading, sin créditos, etc.)
  const isDomDisabled = isLoading || !!safetyError || !hasCredits || isOccasionLocked;

  // Bloqueo "visual": Incluye el estado 'disabled' (falta texto) para mostrarlo gris.
  const isVisuallyDisabled = isDomDisabled || disabled;

  const label = safetyError
    ? "Contenido bloqueado"
    : isOccasionLocked
      ? getLockedOccasionLabel(!user)
      : !hasCredits
        ? "Sin créditos hoy"
        : disabled && disabledLabel
          ? disabledLabel
          : isLoading
            ? isPensamiento
              ? "Mezclando pensamientos..."
              : isGreeting
                ? "Creando saludo..."
                : "Generando magia..."
            : buttonLabel;

  return (
    <Button
      variant="primary"
      size="lg"
      fullWidth
      onClick={onClick}
      isLoading={isLoading}
      disabled={isVisuallyDisabled}
      className="text-sm sm:text-base md:text-lg"
    >
      {label}
    </Button>
  );
};

export default GenerateButton;
