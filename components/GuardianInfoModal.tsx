// c:\Users\marvi\OneDrive\Escritorio\Personal\mensajemagico-web\components\GuardianInfoModal.tsx

import React from "react";

interface GuardianInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuardianInfoModal: React.FC<GuardianInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guardian-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-4xl w-full relative overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con Gradiente */}
        <div className="relative bg-slate-900 text-white p-8 md:p-10 overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors backdrop-blur-sm z-20"
            aria-label="Cerrar información"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center text-4xl shadow-xl border border-white/30 shrink-0">
              🛡️
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest mb-2 border border-white/20">
                Nueva Funcionalidad
              </div>
              <h2 id="guardian-modal-title" className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                El Guardián de Relaciones
              </h2>
              <p className="text-indigo-100 text-base md:text-lg font-medium max-w-xl leading-relaxed">
                Tu asistente de inteligencia emocional que aprende y evoluciona contigo en cada mensaje.
              </p>
            </div>
          </div>
        </div>

        {/* Contenido Scrollable */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-8">
          <div className="grid gap-6 md:grid-cols-3 items-stretch">
            {/* Paso 1 */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                ❤️
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Salud Relacional
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Analiza el tono emocional de tus interacciones. Si detecta
                frialdad o distancia, te sugerirá acercarte.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-800 transition-colors group">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🧬
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                ADN Léxico
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Aprende tus palabras favoritas y muletillas. Con el tiempo,
                dejará de sonar como un robot y sonará 100% a ti.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors group">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                ✏️
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Aprendizaje Activo
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                ¿Editaste un mensaje generado? ¡Genial! El Guardián toma nota de
                tus correcciones para mejorar la próxima vez.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center text-xl shrink-0">
              🔒
            </div>
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-100 text-sm mb-1">
                Privacidad Primero
              </h4>
              <p className="text-amber-800 dark:text-amber-200/80 text-xs leading-relaxed">
                El análisis es automático y privado. Tus datos se usan
                únicamente para personalizar tu experiencia y nunca se venden a
                terceros.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 flex justify-center md:justify-end">
          <button
            onClick={onClose}
            className="w-full md:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuardianInfoModal;
