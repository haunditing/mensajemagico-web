import React from "react";
import { useFeature } from "../hooks/useFeature";

interface PlanBadgeProps {
  /** La ruta de la característica en el objeto de configuración (ej. 'monetization.show_ads') */
  feature: string;
  /** El valor que debe tener la característica para mostrar el badge. Por defecto comprueba si es truthy. */
  expectedValue?: any;
  /** Texto a mostrar en el badge. Por defecto "PRO". */
  label?: string;
  /** Clases adicionales para el estilo. */
  className?: string;
  /** Invierte la lógica: muestra el badge si el valor NO coincide. */
  invert?: boolean;
}

const PlanBadge: React.FC<PlanBadgeProps> = ({
  feature,
  expectedValue = true,
  label = "PRO",
  className = "",
  invert = false,
}) => {
  const currentValue = useFeature(feature);

  let matches = false;

  if (expectedValue === true) {
    // Si esperamos true (por defecto), verificamos que el valor sea truthy
    matches = !!currentValue;
  } else {
    // Comparación estricta para otros valores
    matches = currentValue === expectedValue;
  }

  // Aplicar inversión si es necesario (ej. mostrar si show_ads es false)
  const shouldRender = invert ? !matches : matches;

  if (!shouldRender) return null;

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-gradient-to-r from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 text-white shadow-sm ${className}`}
    >
      {label}
    </span>
  );
};

export default PlanBadge;
