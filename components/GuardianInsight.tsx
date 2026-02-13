import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface GuardianInsightProps {
  insight: string;
}

const GuardianInsight: React.FC<GuardianInsightProps> = ({ insight }) => {
  const { planLevel } = useAuth();
  if (!insight) return null;

  const isPremium = planLevel === "premium";

  return (
    <div
      className={`mt-6 border rounded-xl p-5 relative overflow-hidden animate-slide-in ${
        isPremium
          ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-900/30 shadow-sm"
          : "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30"
      }`}
    >
      <style>{`
        @keyframes slide-in-soft {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slide-in-soft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div
        className={`absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 rounded-full blur-xl opacity-50 ${
          isPremium ? "bg-amber-200 dark:bg-amber-800" : "bg-indigo-100 dark:bg-indigo-800"
        }`}
      ></div>

      <div className="flex items-start gap-4 relative z-10">
        <div className="text-2xl bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
          {isPremium ? "🦁" : "🔮"}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4
              className={`text-sm font-bold uppercase tracking-wider ${
                isPremium ? "text-amber-900 dark:text-amber-200" : "text-indigo-900 dark:text-indigo-200"
              }`}
            >
              Guardian Insight
            </h4>
            {isPremium && (
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-black border border-amber-200 dark:border-amber-800">
                PRO
              </span>
            )}
          </div>
          <p
            className={`text-sm leading-relaxed mb-3 ${
              isPremium ? "text-amber-900/80 dark:text-amber-200/80" : "text-indigo-800 dark:text-indigo-200"
            }`}
          >
            {insight}
          </p>
          {!isPremium && (
            <Link
              to="/pricing"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline flex items-center gap-1"
            >
              Desbloquear Estrategia Premium <span>→</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuardianInsight;
