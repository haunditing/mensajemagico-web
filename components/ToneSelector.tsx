import React from "react";
import {
  EMOTIONAL_STATES,
  GREETING_TONES,
} from "../constants";
import FeatureGuard from "./FeatureGuard";
import { Tone } from "../types";

interface ToneSelectorProps {
  isPensamiento: boolean;
  isGreeting: boolean;
  tone: Tone | string;
  setTone: (tone: any) => void;
  availableTones: { value: Tone; label: string }[];
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

  return (
    <div role="group" aria-labelledby={labelId}>
      <label id={labelId} className="block text-sm font-bold text-slate-700 mb-2">
        {isPensamiento
          ? "Estado emocional"
          : isGreeting
            ? "Intención"
            : "Tono"}
      </label>
      <div className="flex flex-wrap gap-2">
        {isPensamiento ? (
          // Renderizado agrupado para Pensamientos
          <div className="space-y-3 w-full">
            {Object.entries(EMOTIONAL_GROUPS).map(
              ([groupName, stateIds]) => (
                <div key={groupName} className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" id={`group-${groupName.replace(/\s+/g, '-')}`}>
                    {groupName}
                  </span>
                  <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`group-${groupName.replace(/\s+/g, '-')}`}>
                    {stateIds.map((id) => {
                      const state = EMOTIONAL_STATES.find(
                        (s) => s.id === id,
                      );
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
                              ? "bg-slate-800 text-white border-slate-800 shadow-md"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          {state.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ),
            )}
          </div>
        ) : // Renderizado normal para otras ocasiones
        isGreeting ? (
          GREETING_TONES.map((t) => {
            const isSelected = tone === (t.id as any);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setTone(t.id as any)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
                }`}
              >
                {t.label}
              </button>
            );
          })
        ) : (
          availableTones.map((t) => {
            const isSelected = tone === t.value;
            return (
              <FeatureGuard
                key={t.value}
                featureKey={t.value}
                type="tone"
              >
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setTone(t.value)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
                  }`}
                >
                  {t.label}
                </button>
              </FeatureGuard>
            );
          })
        )}
      </div>
      {guardianWarning && (
        <div role="alert" className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 font-medium flex items-start gap-2 animate-fade-in">
          <span aria-hidden="true">🛡️</span>
          <span>{guardianWarning}</span>
        </div>
      )}
    </div>
  );
};

export default ToneSelector;