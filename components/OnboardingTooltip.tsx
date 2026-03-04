import React, { useEffect, useRef } from 'react';
import { useOnboarding } from '../context/OnboardingContext';

export type TooltipColor = 'indigo' | 'blue' | 'rose' | 'green' | 'amber' | 'orange' | 'purple' | 'sky' | 'emerald' | 'pink' | 'red' | 'cyan';

interface OnboardingTooltipProps {
  tourId: string;
  stepIndex: number;
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  isLast?: boolean;
  color?: TooltipColor;
}

const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({ 
  tourId, 
  stepIndex, 
  content, 
  children, 
  position = 'bottom',
  isLast = false,
  color = 'indigo'
}) => {
  const { activeTour, currentStepIndex, nextStep, skipTour } = useOnboarding();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isActive = activeTour === tourId && currentStepIndex === stepIndex;

  // Smart viewport positioning para asegurar visibility
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isActive && contentRef.current) {
      timer = setTimeout(() => {
        const element = contentRef.current;
        const rect = element.getBoundingClientRect();
        
        // Verificar si está dentro del viewport
        const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight && 
                            rect.left >= 0 && rect.right <= window.innerWidth;
        
        if (!isInViewport) {
          // Si no está visible, scroll into view de forma segura
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
        }
      }, 100); // Retraso mínimo para permitir renderizado
    }
    return () => clearTimeout(timer);
  }, [isActive]);

  const colorStyles: Record<string, { container: string, arrow: string, text: string, button: string }> = {
    indigo: {
      container: "bg-indigo-600 dark:bg-indigo-500 border-indigo-500 dark:border-indigo-400",
      arrow: "bg-indigo-600 dark:bg-indigo-500 border-indigo-500 dark:border-indigo-400",
      text: "text-indigo-200 dark:text-indigo-100",
      button: "text-indigo-700 dark:text-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-100"
    },
    blue: {
      container: "bg-blue-600 dark:bg-blue-500 border-blue-500 dark:border-blue-400",
      arrow: "bg-blue-600 dark:bg-blue-500 border-blue-500 dark:border-blue-400",
      text: "text-blue-200 dark:text-blue-100",
      button: "text-blue-700 dark:text-blue-900 hover:bg-blue-50 dark:hover:bg-blue-100"
    },
    rose: {
      container: "bg-rose-600 dark:bg-rose-500 border-rose-500 dark:border-rose-400",
      arrow: "bg-rose-600 dark:bg-rose-500 border-rose-500 dark:border-rose-400",
      text: "text-rose-200 dark:text-rose-100",
      button: "text-rose-700 dark:text-rose-900 hover:bg-rose-50 dark:hover:bg-rose-100"
    },
    green: {
      container: "bg-green-600 dark:bg-green-500 border-green-500 dark:border-green-400",
      arrow: "bg-green-600 dark:bg-green-500 border-green-500 dark:border-green-400",
      text: "text-green-200 dark:text-green-100",
      button: "text-green-700 dark:text-green-900 hover:bg-green-50 dark:hover:bg-green-100"
    },
    amber: {
      container: "bg-amber-600 dark:bg-amber-500 border-amber-500 dark:border-amber-400",
      arrow: "bg-amber-600 dark:bg-amber-500 border-amber-500 dark:border-amber-400",
      text: "text-amber-200 dark:text-amber-100",
      button: "text-amber-700 dark:text-amber-900 hover:bg-amber-50 dark:hover:bg-amber-100"
    },
    orange: {
      container: "bg-orange-600 dark:bg-orange-500 border-orange-500 dark:border-orange-400",
      arrow: "bg-orange-600 dark:bg-orange-500 border-orange-500 dark:border-orange-400",
      text: "text-orange-200 dark:text-orange-100",
      button: "text-orange-700 dark:text-orange-900 hover:bg-orange-50 dark:hover:bg-orange-100"
    },
    purple: {
      container: "bg-purple-600 dark:bg-purple-500 border-purple-500 dark:border-purple-400",
      arrow: "bg-purple-600 dark:bg-purple-500 border-purple-500 dark:border-purple-400",
      text: "text-purple-200 dark:text-purple-100",
      button: "text-purple-700 dark:text-purple-900 hover:bg-purple-50 dark:hover:bg-purple-100"
    },
    sky: {
      container: "bg-sky-600 dark:bg-sky-500 border-sky-500 dark:border-sky-400",
      arrow: "bg-sky-600 dark:bg-sky-500 border-sky-500 dark:border-sky-400",
      text: "text-sky-200 dark:text-sky-100",
      button: "text-sky-700 dark:text-sky-900 hover:bg-sky-50 dark:hover:bg-sky-100"
    },
    emerald: {
      container: "bg-emerald-600 dark:bg-emerald-500 border-emerald-500 dark:border-emerald-400",
      arrow: "bg-emerald-600 dark:bg-emerald-500 border-emerald-500 dark:border-emerald-400",
      text: "text-emerald-200 dark:text-emerald-100",
      button: "text-emerald-700 dark:text-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-100"
    },
    pink: {
      container: "bg-pink-600 dark:bg-pink-500 border-pink-500 dark:border-pink-400",
      arrow: "bg-pink-600 dark:bg-pink-500 border-pink-500 dark:border-pink-400",
      text: "text-pink-200 dark:text-pink-100",
      button: "text-pink-700 dark:text-pink-900 hover:bg-pink-50 dark:hover:bg-pink-100"
    },
    red: {
      container: "bg-red-600 dark:bg-red-500 border-red-500 dark:border-red-400",
      arrow: "bg-red-600 dark:bg-red-500 border-red-500 dark:border-red-400",
      text: "text-red-200 dark:text-red-100",
      button: "text-red-700 dark:text-red-900 hover:bg-red-50 dark:hover:bg-red-100"
    },
    cyan: {
      container: "bg-cyan-600 dark:bg-cyan-500 border-cyan-500 dark:border-cyan-400",
      arrow: "bg-cyan-600 dark:bg-cyan-500 border-cyan-500 dark:border-cyan-400",
      text: "text-cyan-200 dark:text-cyan-100",
      button: "text-cyan-700 dark:text-cyan-900 hover:bg-cyan-50 dark:hover:bg-cyan-100"
    }
  };

  const theme = colorStyles[color] || colorStyles.indigo;

  return (
    <div className="relative inline-block w-full" ref={tooltipRef}>
      {children}
      {isActive && (
        <div 
          ref={contentRef}
          className={`absolute z-[60] p-3 sm:p-4 text-white rounded-xl shadow-xl dark:shadow-black/40 animate-fade-in-up border ring-1 ring-white/10 ${theme.container}
            ${position === 'bottom' ? 'top-full mt-4' : ''}
            ${position === 'top' ? 'bottom-full mb-4' : ''}
            left-1/2 -translate-x-1/2
            w-[calc(100vw-2rem)] sm:w-72 max-w-96
            max-h-[calc(100vh-4rem)] overflow-y-auto
          `}>
          {/* Flecha decorativa */}
          <div className={`absolute w-3 h-3 rotate-45 border-l border-t ${theme.arrow}
            ${position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2' : ''}
            ${position === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2 rotate-180' : ''}
          `} />
          
          <p className="text-xs sm:text-sm font-medium mb-3 leading-relaxed">{content}</p>
          <div className="flex justify-between items-center gap-2">
            <button onClick={() => skipTour()} className={`text-xs font-medium hover:text-white px-2 py-1 rounded transition-colors ${theme.text}`}>Omitir</button>
            <button onClick={() => isLast ? skipTour() : nextStep()} className={`bg-white dark:bg-slate-100 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors ${theme.button}`}>
              {isLast ? '¡Entendido!' : 'Siguiente'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingTooltip;