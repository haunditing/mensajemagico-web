import React from "react";

interface RelationalHealthIndicatorProps {
  score: number; // 1-10
  className?: string;
  minimal?: boolean;
}

const RelationalHealthIndicator: React.FC<RelationalHealthIndicatorProps> = ({
  score,
  className = "",
  minimal = false,
}) => {
  // Asegurar rango 0-10
  const clampedScore = Math.max(0, Math.min(10, score));
  const percentage = (clampedScore / 10) * 100;

  // ID único para el gradiente (necesario si hay múltiples indicadores en pantalla)
  const gradientId = `heart-fill-${Math.random().toString(36).substr(2, 9)}`;

  // Determinar color y etiqueta según la salud
  let color = "#f43f5e"; // rose-500 (Saludable/Íntimo)
  let label = "Íntima";

  if (clampedScore < 4) {
    color = "#60a5fa"; // blue-400 (Fría/Distante)
    label = "Distante";
  } else if (clampedScore < 7) {
    color = "#fbbf24"; // amber-400 (Regular/Tibia)
    label = "Regular";
  }

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      title={`Salud Relacional: ${clampedScore.toFixed(1)}/10 (${label})`}
    >
      <div className="relative w-10 h-10 transition-transform hover:scale-110 duration-300 group cursor-help">
        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm">
          <defs>
            {/* Gradiente lineal vertical para simular el llenado */}
            <linearGradient id={gradientId} x1="0" x2="0" y1="1" y2="0">
              <stop offset={`${percentage}%`} stopColor={color} />
              <stop offset={`${percentage}%`} stopColor="var(--heart-empty, #e2e8f0)" />{" "}
              {/* slate-200 para la parte vacía */}
            </linearGradient>
          </defs>
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.77-8.77 1.06-1.06a5.5 5.5 0 0 0 0-7.78v0z"
            fill={`url(#${gradientId})`}
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Partículas flotantes si la salud es excelente (>= 8) */}
        {clampedScore >= 8 && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-400 rounded-full animate-ping opacity-75"></div>
        )}
      </div>

      {!minimal && (
        <div className="flex flex-col items-center mt-1">
          <span className="text-xs font-black text-slate-700">
            {clampedScore.toFixed(1)}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </span>
        </div>
      )}
    </div>
  );
};

export default RelationalHealthIndicator;
