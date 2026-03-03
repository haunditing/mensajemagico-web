import React, { useState, useEffect } from 'react';
import { EssenceProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useUpsell } from '../context/UpsellContext';
import { Link } from 'react-router-dom';

interface EssenceToggleProps {
  essenceProfile: EssenceProfile | null;
  essenceCompleted: boolean;
  applyEssence: boolean;
  setApplyEssence: (apply: boolean) => void;
}

const EssenceToggle: React.FC<EssenceToggleProps> = ({
  essenceProfile,
  essenceCompleted,
  applyEssence,
  setApplyEssence,
}) => {
  const { planLevel } = useAuth();
  const { triggerUpsell } = useUpsell();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // Helper para interpretar la esencia de forma narrativa
  const getEssenceDescription = (profile: EssenceProfile) => {
    const styleMap: Record<string, string> = {
      direct: "Directo y Transparente",
      indirect: "Sutil y Diplomático",
      romantic: "Cálido y Romántico",
      firm: "Firme y Seguro",
    };

    const intensityMap: Record<string, string> = {
      soft: "suave",
      balanced: "equilibrada",
      intense: "vibrante",
    };

    const expressivenessMap: Record<string, string> = {
      low: "reservada",
      medium: "natural",
      high: "efusiva",
    };

    const s = styleMap[profile.style] || "Definido";
    const i = intensityMap[profile.intensity] || "media";
    const e = expressivenessMap[profile.expressiveness] || "media";

    return `${s}, con energía ${i} y expresión ${e}.`;
  };

  // Explicaciones detalladas para el modal
  const explanations: Record<string, Record<string, string>> = {
    style: {
      direct: "Vas al grano sin rodeos.",
      indirect: "Prefieres la sutileza y la diplomacia.",
      romantic: "Usas un lenguaje soñador y poético.",
      firm: "Te comunicas con autoridad y seguridad.",
    },
    intensity: {
      soft: "Usas palabras suaves y gentiles.",
      balanced: "Mantienes un peso emocional estable.",
      intense: "Usas vocabulario fuerte y apasionado.",
    },
    expressiveness: {
      low: "Eres reservado y conciso.",
      medium: "Equilibras detalle y brevedad.",
      high: "Eres muy descriptivo y emotivo.",
    },
    pride: {
      low: "Priorizas la humildad y la apertura.",
      medium: "Mantienes un autorespeto saludable.",
      high: "Proyectas alta dignidad y compostura.",
    }
  };

  if (!essenceCompleted) {
    return (
      <div className="my-4 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl text-center">
        <p className="font-bold text-blue-800 dark:text-blue-300 mb-2">¿Quieres que tus mensajes reflejen tu personalidad?</p>
        <Link to="/esencia" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
          ¡Completa el test de Esencia y descúbrelo!
        </Link>
      </div>
    );
  }

  const handleToggle = () => {
    if (!isOnline) return;
    if (planLevel === 'premium') {
      setApplyEssence(!applyEssence);
    } else {
      triggerUpsell('Mejora a Premium para aplicar tu Esencia a los mensajes.');
    }
  };

  const isActive = applyEssence && planLevel === 'premium';

  return (
    <div className={`my-4 p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl transition-opacity duration-300 ${!isOnline ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <p className="font-bold text-slate-800 dark:text-white">Tu Esencia</p>
                {planLevel === 'premium' && (
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-200 dark:border-indigo-800">
                        PRO
                    </span>
                )}
            </div>
            {essenceProfile && (
                <button 
                  onClick={() => setShowExplanation(true)}
                  className="text-left group focus:outline-none"
                >
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 leading-relaxed font-medium group-hover:underline decoration-indigo-300 underline-offset-2 transition-all">
                        {getEssenceDescription(essenceProfile)}
                        <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">ℹ️</span>
                    </p>
                </button>
            )}
        </div>
        
        <button
          onClick={handleToggle}
          disabled={!isOnline}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shrink-0 ${
            isActive ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
          } ${!isOnline ? 'cursor-not-allowed opacity-50' : ''}`}
          aria-pressed={isActive}
          title={!isOnline ? "Sin conexión a internet" : (isActive ? "Desactivar Esencia" : "Activar Esencia")}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
              isActive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      {!isOnline ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
          <span>📡</span>
          <span>Sin conexión. La esencia requiere internet.</span>
        </div>
      ) : planLevel !== 'premium' && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
          <span>🔒</span>
          <span>Disponible en Premium. <button onClick={() => triggerUpsell('Desbloquea tu esencia')} className="underline font-bold hover:text-amber-700 dark:hover:text-amber-300">Mejorar plan</button></span>
        </div>
      )}

      {/* Modal de Explicación de Esencia */}
      {showExplanation && essenceProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowExplanation(false)}>
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-xs w-full relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowExplanation(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">✕</button>
              
              <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                <span>🧬</span> Análisis de Esencia
              </h4>
              
              <div className="space-y-3">
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">Estilo</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{explanations.style[essenceProfile.style]}</p>
                 </div>
                 <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">Intensidad</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{explanations.intensity[essenceProfile.intensity]}</p>
                 </div>
                 <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider block mb-1">Expresividad</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{explanations.expressiveness[essenceProfile.expressiveness]}</p>
                 </div>
                 <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">Orgullo</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{explanations.pride[essenceProfile.pride]}</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EssenceToggle;
