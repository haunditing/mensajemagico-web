import React, { useMemo } from "react";

interface HistoryItem {
  date: string;
  sentimentScore?: number;
}

interface RelationalHealthChartProps {
  currentHealth: number;
  history: HistoryItem[];
  className?: string;
}

const RelationalHealthChart: React.FC<RelationalHealthChartProps> = ({
  currentHealth,
  history,
  className = "",
}) => {
  const dataPoints = useMemo(() => {
    // Reconstruir la historia de salud hacia atrás
    let health = currentHealth;
    const points = [{ date: "Ahora", value: health }];

    // Iterar desde el más reciente hacia atrás
    // Asumimos que history[history.length - 1] es el más reciente
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const item of sortedHistory) {
      if (item.sentimentScore !== undefined) {
        health -= item.sentimentScore; // Restamos el score para saber cuánto tenía antes
        health = Math.max(1, Math.min(10, health)); // Clamp 1-10
        points.push({ 
          date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 
          value: health 
        });
      }
    }

    return points.reverse(); // Ordenar cronológicamente (antiguo -> nuevo)
  }, [currentHealth, history]);

  if (dataPoints.length < 2) {
    return (
      <div className={`flex items-center justify-center h-32 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-xs ${className}`}>
        Necesitas más interacciones para ver la evolución.
      </div>
    );
  }

  // Configuración del gráfico
  const width = 100;
  const height = 50;
  const padding = 5;
  const maxVal = 10;
  const minVal = 1;

  const getX = (index: number) => (index / (dataPoints.length - 1)) * (width - padding * 2) + padding;
  const getY = (value: number) => height - padding - ((value - minVal) / (maxVal - minVal)) * (height - padding * 2);

  const pointsString = dataPoints.map((p, i) => `${getX(i)},${getY(p.value)}`).join(" ");

  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full aspect-[2/1] bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Líneas guía */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-10 pointer-events-none">
          <div className="border-t border-slate-900 w-full"></div>
          <div className="border-t border-slate-900 w-full"></div>
          <div className="border-t border-slate-900 w-full"></div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          {/* Área bajo la curva */}
          <path
            d={`M ${getX(0)},${height} L ${pointsString} L ${getX(dataPoints.length - 1)},${height} Z`}
            fill="url(#gradientHealth)"
            opacity="0.2"
          />
          {/* Línea */}
          <polyline
            points={pointsString}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="gradientHealth" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-2">
        <span>{dataPoints[0].date}</span>
        <span>{dataPoints[dataPoints.length - 1].date}</span>
      </div>
    </div>
  );
};

export default RelationalHealthChart;