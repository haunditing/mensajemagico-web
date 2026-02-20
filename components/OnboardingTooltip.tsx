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

  const isActive = activeTour === tourId && currentStepIndex === stepIndex;

  // Auto-scroll para asegurar visibilidad en móviles
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isActive && tooltipRef.current) {
      timer = setTimeout(() => {
        tooltipRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 500); // Retraso para permitir renderizado y animaciones
    }
    return () => clearTimeout(timer);
  }, [isActive]);

  const colorStyles: Record<string, { container: string, arrow: string, text: string, button: string }> = {
    indigo: {
      container: "bg-indigo-600 border-indigo-500",
      arrow: "bg-indigo-600 border-indigo-500",
      text: "text-indigo-200",
      button: "text-indigo-600 hover:bg-indigo-50"
    },
    blue: {
      container: "bg-blue-600 border-blue-500",
      arrow: "bg-blue-600 border-blue-500",
      text: "text-blue-200",
      button: "text-blue-600 hover:bg-blue-50"
    },
    rose: {
      container: "bg-rose-600 border-rose-500",
      arrow: "bg-rose-600 border-rose-500",
      text: "text-rose-200",
      button: "text-rose-600 hover:bg-rose-50"
    },
    green: {
      container: "bg-green-600 border-green-500",
      arrow: "bg-green-600 border-green-500",
      text: "text-green-200",
      button: "text-green-600 hover:bg-green-50"
    },
    amber: {
      container: "bg-amber-600 border-amber-500",
      arrow: "bg-amber-600 border-amber-500",
      text: "text-amber-200",
      button: "text-amber-600 hover:bg-amber-50"
    },
    orange: {
      container: "bg-orange-600 border-orange-500",
      arrow: "bg-orange-600 border-orange-500",
      text: "text-orange-200",
      button: "text-orange-600 hover:bg-orange-50"
    },
    purple: {
      container: "bg-purple-600 border-purple-500",
      arrow: "bg-purple-600 border-purple-500",
      text: "text-purple-200",
      button: "text-purple-600 hover:bg-purple-50"
    },
    sky: {
      container: "bg-sky-600 border-sky-500",
      arrow: "bg-sky-600 border-sky-500",
      text: "text-sky-200",
      button: "text-sky-600 hover:bg-sky-50"
    },
    emerald: {
      container: "bg-emerald-600 border-emerald-500",
      arrow: "bg-emerald-600 border-emerald-500",
      text: "text-emerald-200",
      button: "text-emerald-600 hover:bg-emerald-50"
    },
    pink: {
      container: "bg-pink-600 border-pink-500",
      arrow: "bg-pink-600 border-pink-500",
      text: "text-pink-200",
      button: "text-pink-600 hover:bg-pink-50"
    },
    red: {
      container: "bg-red-600 border-red-500",
      arrow: "bg-red-600 border-red-500",
      text: "text-red-200",
      button: "text-red-600 hover:bg-red-50"
    },
    cyan: {
      container: "bg-cyan-600 border-cyan-500",
      arrow: "bg-cyan-600 border-cyan-500",
      text: "text-cyan-200",
      button: "text-cyan-600 hover:bg-cyan-50"
    }
  };

  const theme = colorStyles[color] || colorStyles.indigo;

  return (
    <div className="relative w-full h-full" ref={tooltipRef}>
      {children}
      {isActive && (
        <div className={`absolute z-[60] w-64 max-w-[90vw] p-4 text-white rounded-xl shadow-xl animate-fade-in-up border ${theme.container}
          ${position === 'bottom' ? 'top-full mt-4 left-1/2 -translate-x-1/2' : ''}
          ${position === 'top' ? 'bottom-full mb-4 left-1/2 -translate-x-1/2' : ''}
        `}>
          {/* Flecha decorativa */}
          <div className={`absolute w-3 h-3 rotate-45 border-l border-t ${theme.arrow}
            ${position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2' : ''}
            ${position === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2 rotate-180' : ''}
          `} />
          
          <p className="text-sm font-medium mb-3 leading-relaxed">{content}</p>
          <div className="flex justify-between items-center">
            <button onClick={() => skipTour()} className={`text-xs font-medium hover:text-white ${theme.text}`}>Omitir</button>
            <button onClick={() => isLast ? skipTour() : nextStep()} className={`bg-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors ${theme.button}`}>
              {isLast ? '¡Entendido!' : 'Siguiente'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingTooltip;