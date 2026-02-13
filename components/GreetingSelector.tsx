import React from "react";
import { GREETING_CATEGORIES } from "../constants";

interface GreetingSelectorProps {
  greetingMoment: string;
  setGreetingMoment: (value: string) => void;
  suggestedGreeting: string | null;
}

const GreetingSelector: React.FC<GreetingSelectorProps> = ({
  greetingMoment,
  setGreetingMoment,
  suggestedGreeting,
}) => {
  const getIcon = (moment: string | null) => {
    if (moment === "amanecer") return "🌅";
    if (moment === "tarde") return "☀️";
    if (moment === "ocaso") return "🌙";
    return "✨";
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="greeting-moment" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
          ¿En qué momento estás?
        </label>
        {greetingMoment === suggestedGreeting && (
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full flex items-center gap-1 animate-fade-in">
            <span role="img" aria-hidden="true">{getIcon(suggestedGreeting)}</span> Sugerido por la hora
          </span>
        )}
      </div>
      <select
        id="greeting-moment"
        value={greetingMoment}
        onChange={(e) => setGreetingMoment(e.target.value)}
        className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
      >
        {GREETING_CATEGORIES.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GreetingSelector;