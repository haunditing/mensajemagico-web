import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFeature } from "../hooks/useFeature";

const UsageBar: React.FC = () => {
  const { user, remainingCredits } = useAuth();
  const dailyLimit = useFeature("access.daily_limit", 0);
  const [animateText, setAnimateText] = useState(false);

  useEffect(() => {
    setAnimateText(true);
    const timer = setTimeout(() => setAnimateText(false), 300);
    return () => clearTimeout(timer);
  }, [remainingCredits]);

  // Ocultar el componente visualmente, manteniendo la lógica existente
  return null;

  // Solo mostrar para usuarios logueados
  if (!user) return null;

  // Si el límite es muy alto (Premium ilimitado), mostrar un badge especial
  if (dailyLimit > 100)
    return (
      <div className="w-full mb-6 text-center text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 py-2 rounded-lg border border-blue-100 dark:border-blue-900/50">
        ✨ Créditos Ilimitados
      </div>
    );

  const percentage =
    dailyLimit > 0
      ? Math.max(0, Math.min(100, (remainingCredits / dailyLimit) * 100))
      : 0;

  // Determinar color basado en porcentaje
  let barColor = "bg-gradient-to-r from-blue-500 to-indigo-600";
  if (percentage <= 25) {
    barColor = "bg-gradient-to-r from-red-500 to-pink-600";
  } else if (percentage <= 50) {
    barColor = "bg-gradient-to-r from-amber-400 to-orange-500";
  }

  return (
    <div className="w-full mb-6 animate-fade-in-up">
      <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
        <span>Créditos diarios</span>
        <span
          className={`transition-transform duration-300 ${animateText ? "scale-125 text-slate-800 dark:text-slate-200" : ""}`}
        >
          {remainingCredits} / {dailyLimit}
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
        <div
          className={`h-full transition-all duration-700 ease-out ${barColor} relative`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-white/20"></div>
        </div>
      </div>
    </div>
  );
};

export default UsageBar;
