
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let consent = null;
    try {
      consent = localStorage.getItem('cookie_consent');
    } catch {}

    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    try {
      localStorage.setItem('cookie_consent', 'true');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      role="region" 
      aria-live="polite" 
      aria-label="Aviso de uso de cookies"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-[100] animate-fade-in-up"
    >
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex items-start gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" aria-hidden="true">
            🍪
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Control de Cookies</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Usamos cookies para personalizar tu experiencia y analizar nuestro tráfico a través de Google AdSense. 
              Al continuar, aceptas nuestra <Link to="/privacidad" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Política de Privacidad</Link>.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={acceptCookies}
                className="flex-1 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors active:scale-[0.98]"
              >
                Aceptar todo
              </button>
              <Link 
                to="/terminos"
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
              >
                Más info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
