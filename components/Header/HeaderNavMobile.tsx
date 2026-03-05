import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import OccasionIcon from '../OccasionIcon';
import { getLocalizedOccasion } from '../../services/localizationService';

interface HeaderNavMobileProps {
  occasions: any[];
  isRouteActive: (slug: string) => boolean;
}

/**
 * Navegación móvil del header con scroll horizontal e indicador visual
 * Responsabilidades:
 * - Renderizar navegación con scroll horizontal
 * - Mostrar indicador visual de más contenido disponible
 * - Accesibilidad mejorada
 */
const HeaderNavMobile: React.FC<HeaderNavMobileProps> = ({ occasions, isRouteActive }) => {
  const navRef = useRef<HTMLElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Detectar si hay más contenido para scrollear
  useEffect(() => {
    const checkScroll = () => {
      if (navRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      }
    };

    const nav = navRef.current;
    if (nav) {
      checkScroll();
      nav.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);

      return () => {
        nav.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [occasions]);

  return (
    <div className="lg:hidden border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 safe-area-inset-bottom">
      <nav
        ref={navRef}
        className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-4 snap-x items-center justify-start scroll-smooth"
        aria-label="Navegación de ocasiones"
      >
        {occasions.map((o) => {
          const localized = getLocalizedOccasion(o, 'CO');
          const isActive = isRouteActive(o.slug);

          return (
            <Link
              key={o.id}
              to={`/mensajes/${o.slug}`}
              aria-label={localized.name}
              className={`shrink-0 p-3.5 rounded-2xl border transition-all duration-300 snap-center flex items-center justify-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500
                ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/30 scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <OccasionIcon slug={o.slug} className="w-5 h-5" isActive={isActive} />
            </Link>
          );
        })}
      </nav>

      {/* Indicador visual de scroll disponible */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none flex items-center justify-end pr-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-4 h-4 text-slate-400 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default React.memo(HeaderNavMobile);
