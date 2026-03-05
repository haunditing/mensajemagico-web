import { CONFIG } from '../../config';
import React, { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface HeaderLogoProps {
  onLogoClick: () => void;
  isValentine: boolean;
  isChristmas: boolean;
  isValentineDay: boolean;
}

/**
 * Componente del logo del header
 * Responsabilidad: Renderizar el logo, nombre del sitio y manejar click (easter egg)
 * Principios: SRP (Single Responsibility Principle)
 */
const HeaderLogo: React.FC<HeaderLogoProps> = ({
  onLogoClick,
  isValentine,
  isChristmas,
  isValentineDay,
}) => {
  const siteName = CONFIG.APP_NAME;

  // Determinar gradiente según la festividad
  const gradientClass = isValentine
    ? 'bg-gradient-to-tr from-rose-500 to-pink-600 shadow-rose-500/20'
    : isChristmas
      ? 'bg-gradient-to-tr from-emerald-500 to-green-600 shadow-green-500/20'
      : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20';

  return (
    <Link
      to="/"
      onClick={onLogoClick}
      className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none group focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-lg"
      aria-label={`Ir al inicio de ${siteName}`}
    >
      {/* Logo Icon */}
      <div
        className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105 text-white ${gradientClass}`}
      >
        <img
          src="/favicon-32x32.png"
          alt={`${siteName} Logo`}
          width="32"
          height="32"
          fetchPriority="high"
          className="w-6 h-6 md:w-7 md:h-7 object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          decoding="async"
        />
      </div>

      {/* Logo Text (Desktop Only) */}
      <div className="hidden md:flex flex-col">
        <span className="font-extrabold text-lg md:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
          {siteName}
        </span>
        {isValentine && isValentineDay && (
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest animate-pulse">
            ¡Feliz San Valentín!
          </span>
        )}
      </div>
    </Link>
  );
};

export default React.memo(HeaderLogo);
