import React from "react";
import { GUARDIAN_INTENTIONS } from "../constants";

interface GuardianObjectiveSelectorProps {
  intention: string;
  setIntention: (value: string) => void;
  setManualIntentionOverride: (value: boolean) => void;
  planLevel: string;
  manualIntentionOverride: boolean;
  guardianDescription: string | undefined;
}

const GuardianObjectiveSelector: React.FC<GuardianObjectiveSelectorProps> = ({
  intention,
  setIntention,
  setManualIntentionOverride,
  planLevel,
  manualIntentionOverride,
  guardianDescription,
}) => {
  const labelId = "guardian-objective-label";

  return (
    <div className="animate-fade-in-up" role="group" aria-labelledby={labelId}>
      <div className="flex items-center justify-between mb-2">
        <label id={labelId} className="block text-sm font-bold text-slate-700 dark:text-slate-300">
          Objetivo del Guardián
        </label>
        {planLevel === "premium" && !manualIntentionOverride && (
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
            ✨ IA Ajustando
          </span>
        )}
      </div>
      
      {/* Carrusel en móvil (flex + overflow), Grid en escritorio (md:grid) */}
      <div className="flex overflow-x-auto pb-2 gap-2 md:flex md:flex-wrap md:pb-0 no-scrollbar snap-x mb-2">
        {GUARDIAN_INTENTIONS.map((int) => {
          const isSelected = intention === int.id;
          return (
            <div key={int.id} className="snap-center shrink-0">
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setIntention(int.id);
                  setManualIntentionOverride(true);
                }}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 w-full md:w-auto whitespace-nowrap ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105 ring-2 ring-indigo-100 dark:ring-indigo-900"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <span>{int.label}</span>
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 italic min-h-[1.5em] transition-all text-center md:text-left">
        {guardianDescription}
      </p>
    </div>
  );
};

export default GuardianObjectiveSelector;