import React, { useState, useRef } from "react";
import { EMOTIONAL_STATES, GREETING_TONES } from "../constants";
import FeatureGuard from "./FeatureGuard";
import { Tone } from "../types";

interface ToneSelectorProps {
  isPensamiento: boolean;
  isGreeting: boolean;
  tone: Tone | string;
  setTone: (tone: any) => void;
  availableTones: { value: Tone; label: string; badge?: string }[];
  guardianWarning: string | null;
}

const EMOTIONAL_GROUPS = {
  "Energía Baja": ["tranquilo", "reflexivo", "triste", "nostalgia"],
  "Energía Alta": ["motivado", "feliz", "sorprendido"],
  Personalidad: ["neutro", "sarcastico"],
};

const ToneSelector: React.FC<ToneSelectorProps> = ({
  isPensamiento,
  isGreeting,
  tone,
  setTone,
  availableTones,
  guardianWarning,
}) => {
  const labelId = "tone-selector-label";
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const totalGroups = Object.keys(EMOTIONAL_GROUPS).length;
      // Cálculo aproximado del índice actual basado en el scroll
      const index = Math.round(
        (scrollLeft / (scrollWidth - clientWidth)) * (totalGroups - 1),
      );
      setActiveGroupIndex(Math.min(Math.max(0, index), totalGroups - 1));
    }
  };

  const getBadgeColor = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("nuevo") || lower.includes("nueva"))
      return "bg-blue-600 shadow-lg shadow-blue-600/40"; // Blue-600 para contraste con texto blanco
    if (lower.includes("actualizado") || lower.includes("actualizada"))
      return "bg-green-600 shadow-lg shadow-green-600/40"; // Green-600 para contraste
    return "bg-indigo-500 shadow-lg shadow-indigo-500/40"; // Color por defecto
  };

  return (
    <div className="animate-fade-in" role="group" aria-labelledby={labelId}>
      <label
        id={labelId}
        className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
      >
        {isPensamiento ? "Estado emocional" : isGreeting ? "Intención" : "Tono"}
      </label>

      {isPensamiento ? (
        // Renderizado agrupado para Pensamientos
        <>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto pb-2 gap-4 md:block md:space-y-3 md:w-full md:pb-0 md:gap-0 no-scrollbar snap-x"
          >
            {Object.entries(EMOTIONAL_GROUPS).map(([groupName, stateIds]) => (
              <div
                key={groupName}
                className="snap-center shrink-0 w-[85vw] max-w-[300px] md:w-full md:max-w-none flex flex-col gap-2"
              >
                <span
                  className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  id={`group-${groupName.replace(/\s+/g, "-")}`}
                >
                  {groupName}
                </span>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-labelledby={`group-${groupName.replace(/\s+/g, "-")}`}
                >
                  {stateIds.map((id) => {
                    const state = EMOTIONAL_STATES.find((s) => s.id === id);
                    if (!state) return null;
                    const isSelected = tone === state.id;
                    return (
                      <button
                        key={state.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setTone(state.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isSelected
                            ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200 shadow-md"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                        }`}
                      >
                        {state.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {/* Indicador de Puntos (Solo Móvil) */}
          <div className="flex justify-center gap-1.5 mt-1 md:hidden">
            {Object.keys(EMOTIONAL_GROUPS).map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === activeGroupIndex ? "bg-slate-800 dark:bg-slate-200 w-3" : "bg-slate-300 dark:bg-slate-700"}`}
              />
            ))}
          </div>
        </>
      ) : (
        // Carrusel en móvil (flex + overflow), Flex Wrap en escritorio (ajuste automático)
        <div className="flex overflow-x-auto pt-4 pb-2 gap-2 md:flex-wrap md:pt-2 md:pb-0 md:overflow-visible no-scrollbar snap-x">
          {isGreeting
            ? GREETING_TONES.map((t) => {
                const isSelected = tone === (t.id as any);
                return (
                  <div
                    key={t.id}
                    className="snap-center shrink-0"
                  >
                    <FeatureGuard featureKey={t.id} type="tone">
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setTone(t.id as any)}
                        className={`relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all border whitespace-nowrap w-full md:w-auto ${
                          isSelected
                            ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-md scale-105"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
                        }`}
                      >
                        {t.label}
                        {(t as any).badge && (
                          <span
                            className={`absolute -top-2 -right-1 ${getBadgeColor((t as any).badge)} text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse z-10`}
                          >
                            {(t as any).badge}
                          </span>
                        )}
                      </button>
                    </FeatureGuard>
                  </div>
                );
              })
            : availableTones.map((t) => {
                const isSelected = tone === t.value;
                return (
                  <div
                    key={t.value}
                    className="snap-center shrink-0"
                  >
                    <FeatureGuard featureKey={t.value} type="tone">
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setTone(t.value)}
                        className={`relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all border whitespace-nowrap w-full md:w-auto ${
                          isSelected
                            ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-md scale-105"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
                        }`}
                      >
                        {t.label}
                        {t.badge && (
                          <span
                            className={`absolute -top-2 -right-1 ${getBadgeColor(t.badge)} text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse z-10`}
                          >
                            {t.badge}
                          </span>
                        )}
                      </button>
                    </FeatureGuard>
                  </div>
                );
              })}
        </div>
      )}

      {guardianWarning && (
        <div
          role="alert"
          className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-200 font-medium flex items-start gap-2 animate-fade-in"
        >
          <span aria-hidden="true" className="text-lg">
            🛡️
          </span>
          <span className="leading-relaxed">{guardianWarning}</span>
        </div>
      )}
    </div>
  );
};

export default ToneSelector;
