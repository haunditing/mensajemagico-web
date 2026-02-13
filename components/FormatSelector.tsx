import React from "react";

interface FormatSelectorProps {
  isForPost: boolean;
  setIsForPost: (value: boolean) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({ isForPost, setIsForPost }) => {
  const labelId = "format-selector-label";

  return (
    <div className="animate-fade-in" role="group" aria-labelledby={labelId}>
      <label id={labelId} className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
        Formato
      </label>
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-fit">
        <button
          type="button"
          aria-pressed={!isForPost}
          onClick={() => setIsForPost(false)}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${!isForPost ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-900" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
        >
          💬 Para Chat
        </button>
        <button
          type="button"
          aria-pressed={isForPost}
          onClick={() => setIsForPost(true)}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${isForPost ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
        >
          📱 Para Post
        </button>
      </div>
    </div>
  );
};

export default FormatSelector;