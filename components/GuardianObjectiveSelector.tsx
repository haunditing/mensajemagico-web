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
        <label id={labelId} className="block text-sm font-bold text-slate-700">
          Objetivo del Guardián
        </label>
        {planLevel === "premium" && !manualIntentionOverride && (
          <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
            ✨ IA Ajustando
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
        {GUARDIAN_INTENTIONS.map((int) => {
          const isSelected = intention === int.id;
          return (
            <button
              key={int.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                setIntention(int.id);
                setManualIntentionOverride(true);
              }}
              className={`px-2 py-2 rounded-lg text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105 ring-2 ring-indigo-100"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
              }`}
            >
              <span>{int.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-500 italic min-h-[1.5em] transition-all text-center sm:text-left">
        {guardianDescription}
      </p>
    </div>
  );
};

export default GuardianObjectiveSelector;