import React, { ReactNode } from "react";

interface BannerBaseProps {
  gradientFrom: string; // e.g., "from-purple-600"
  gradientTo: string; // e.g., "to-pink-600"
  gradientDarkFrom: string;
  gradientDarkTo: string;
  badge: string; // e.g., "🎁 Prueba Gratis"
  message: ReactNode;
  buttonText: string;
  buttonHref: string;
  buttonColorClass: string; // e.g., "text-purple-600 dark:text-purple-400 hover:bg-purple-50"
  onDismiss: () => void;
}

const BannerBase: React.FC<BannerBaseProps> = ({
  gradientFrom,
  gradientTo,
  gradientDarkFrom,
  gradientDarkTo,
  badge,
  message,
  buttonText,
  buttonHref,
  buttonColorClass,
  onDismiss,
}) => {
  return (
    <div
      className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} ${gradientDarkFrom} ${gradientDarkTo} text-white py-2.5 px-4 text-center relative z-40 shadow-md dark:shadow-none animate-slide-down overflow-hidden`}
    >
      <style>{`
        @keyframes slide-down {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm pr-10 sm:pr-8">
        <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/10 flex-shrink-0">
          {badge}
        </span>
        <p className="font-medium">{message}</p>
        <a
          href={buttonHref}
          className={`bg-white dark:bg-slate-900 ${buttonColorClass} px-3 py-1 rounded-full text-xs font-bold transition-colors shadow-sm flex items-center gap-1 flex-shrink-0`}
        >
          {buttonText} <span>→</span>
        </a>
      </div>
      <button
        onClick={onDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
        aria-label="Cerrar banner"
      >
        ✕
      </button>
    </div>
  );
};

export default BannerBase;
