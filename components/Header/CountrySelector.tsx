import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../../context/LocalizationContext';
import { CountryCode } from '../../types';

/**
 * Selector de país/región
 * Responsabilidad: Permitir seleccionar la región y ajustar contenido dinámico
 * Características:
 * - Dropdown responsive (móvil = bottom sheet, desktop = menú)
 * - Accesibilidad ARIA
 */
const CountrySelector: React.FC = () => {
  const { country: currentCountry, setCountry } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  const countries: { code: CountryCode; label: string; flag: string }[] = [
    { code: 'MX', label: 'México', flag: '🇲🇽' },
    { code: 'CO', label: 'Colombia', flag: '🇨🇴' },
    { code: 'AR', label: 'Argentina', flag: '🇦🇷' },
    { code: 'CL', label: 'Chile', flag: '🇨🇱' },
    { code: 'PE', label: 'Perú', flag: '🇵🇪' },
    { code: 'VE', label: 'Venezuela', flag: '🇻🇪' },
    { code: 'GENERIC', label: 'LATAM', flag: '🌎' },
  ];

  const selected = countries.find((c) => c.code === currentCountry) || countries[countries.length - 1];

  // Detectar cambio de tamaño
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Click outside para cerrar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideMain = selectorRef.current?.contains(target);
      const isInsideMobile = mobileMenuRef.current?.contains(target);
      if (!isInsideMain && !isInsideMobile) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectorRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full gap-3 bg-white dark:bg-slate-800 border rounded-xl px-4 py-3 text-xs font-bold transition-all duration-200 group shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md'}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Selector de región, actualmente seleccionado: ${selected.label}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg leading-none" aria-hidden="true">
            {selected.flag}
          </span>
          <span className="text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
            {selected.label}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : 'group-hover:text-blue-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen &&
        (() => {
          const MenuContent = (
            <div
              ref={isMobile ? mobileMenuRef : null}
              className={`
                bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 overflow-hidden z-50
                ${
                  isMobile
                    ? 'fixed bottom-0 left-0 right-0 w-full rounded-t-[2.5rem] border-t shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)] max-h-[85vh] flex flex-col animate-slide-up-mobile pb-8'
                    : 'absolute bottom-full left-0 mb-2 w-full min-w-[200px] rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border animate-fade-in-up origin-bottom'
                }
              `}
              role="listbox"
            >
              {isMobile && (
                <style>{`
                  @keyframes slide-up-mobile {
                    0% { transform: translateY(100%); }
                    100% { transform: translateY(0); }
                  }
                  .animate-slide-up-mobile {
                    animation: slide-up-mobile 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  }
                `}</style>
              )}

              {isMobile && (
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto my-4 shrink-0" />
              )}

              <div
                className={`p-1.5 overflow-y-auto custom-scrollbar ${isMobile ? 'px-6 pb-4 max-h-[60vh]' : 'max-h-[300px]'}`}
              >
                {isMobile && (
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 px-2">
                    Selecciona tu región
                  </h3>
                )}
                {countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCountry(c.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left mb-0.5 last:mb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                      ${
                        currentCountry === c.code
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                      }
                    `}
                    role="option"
                    aria-selected={currentCountry === c.code}
                  >
                    <span className="text-lg leading-none" aria-hidden="true">
                      {c.flag}
                    </span>
                    <span className="flex-1">{c.label}</span>
                    {currentCountry === c.code && (
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );

          return MenuContent;
        })()}
    </div>
  );
};

export default React.memo(CountrySelector);
