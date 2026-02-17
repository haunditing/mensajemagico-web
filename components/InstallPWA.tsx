import React, { useEffect, useState } from "react";

const InstallPWA: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    // @ts-ignore
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
      setSupportsPWA(true); // Habilitamos el botón para iOS también
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };

  if (!supportsPWA) {
    return null;
  }

  return (
    <>
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowIOSInstructions(false)}>
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative overflow-hidden animate-slide-up-mobile sm:animate-fade-in-up border border-slate-100 dark:border-slate-800" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Instalar en iOS</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
                Para instalar esta aplicación en tu iPhone o iPad:
              </p>
              <ol className="text-left text-sm text-slate-600 dark:text-slate-300 space-y-4 mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <li className="flex items-start gap-3">
                  <span className="bg-slate-200 dark:bg-slate-700 w-5 h-5 flex items-center justify-center rounded-full font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Toca el botón <strong>Compartir</strong> <span className="inline-block align-middle"><svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></span> en la barra inferior del navegador.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-slate-200 dark:bg-slate-700 w-5 h-5 flex items-center justify-center rounded-full font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Desliza hacia abajo y selecciona <strong>"Agregar a Inicio"</strong>.</span>
                </li>
              </ol>
              <button 
                onClick={() => setShowIOSInstructions(false)}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        className="fixed bottom-6 right-6 z-40 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-3 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 font-bold flex items-center gap-3 hover:scale-105 transition-all animate-fade-in-up group"
        id="setup_button"
        aria-label="Instalar aplicación"
        onClick={onClick}
      >
        <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 text-blue-600 dark:text-blue-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        </div>
        <span className="pr-1">Instalar App</span>
      </button>
    </>
  );
};

export default InstallPWA;