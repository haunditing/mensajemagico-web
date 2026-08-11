import React from "react";

interface ChipProps {
  label: string;
  onRemove?: () => void;
  title?: string;
}

/**
 * Chip de dato agregado (patrón "tag input" de apps como Notion/Linear).
 * Etiqueta de marca con acción de eliminación integrada.
 */
const Chip: React.FC<ChipProps> = ({ label, onRemove, title }) => {
  const trimmed = label.length > 30 ? `${label.slice(0, 27)}...` : label;

  return (
    <span
      title={title || label}
      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-600 dark:to-indigo-600 text-white pl-3 pr-1.5 py-1.5 rounded-lg text-xs font-bold shadow-sm whitespace-nowrap animate-fade-in-up"
    >
      <span>{trimmed}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${label}`}
          className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-white/20 active:bg-white/30 transition-colors"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

interface SuggestionChipProps {
  label: string;
  onClick: () => void;
}

/**
 * Pill de sugerencia ("+ palabra"). Acción secundaria compacta.
 */
const SuggestionChip: React.FC<SuggestionChipProps> = ({ label, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-300 hover:border-brand-200 dark:hover:border-brand-700 transition-all border border-slate-200 dark:border-slate-700 whitespace-nowrap active:scale-95"
    >
      + {label}
    </button>
  );
};

export default Chip;
export { SuggestionChip };
