import React from "react";
import { Link } from "react-router-dom";

interface GuardianInsightProps {
  insight: string;
}

const GuardianInsight: React.FC<GuardianInsightProps> = ({ insight }) => {
  if (!insight) return null;

  return (
    <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden animate-slide-in">
      <style>{`
        @keyframes slide-in-soft {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slide-in-soft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-indigo-100 rounded-full blur-xl opacity-50"></div>
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="text-2xl bg-white p-2 rounded-lg shadow-sm">🔮</div>
        <div>
          <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-1">Guardian Insight</h4>
          <p className="text-indigo-800 text-sm leading-relaxed mb-3">{insight}</p>
          <Link to="/pricing" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1">
            Desbloquear Estrategia Premium <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuardianInsight;