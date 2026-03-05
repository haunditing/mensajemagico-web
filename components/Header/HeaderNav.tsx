import React from 'react';
import { Link } from 'react-router-dom';
import OccasionIcon from '../OccasionIcon';
import { getLocalizedOccasion } from '../../services/localizationService';

interface HeaderNavProps {
  occasions: any[];
  isRouteActive: (slug: string) => boolean;
}

/**
 * Navegación desktop del header
 * Responsabilidad: Renderizar enlaces de ocasiones para desktop (lg+)
 * Notas: Solo visible en pantallas >= lg (1024px)
 */
const HeaderNav: React.FC<HeaderNavProps> = ({ occasions, isRouteActive }) => {
  return (
    <nav className="hidden lg:flex items-center gap-1.5" aria-label="Navegación principal">
      {occasions.map((o) => {
        const localized = getLocalizedOccasion(o, 'CO'); // Será pasado como prop en versión mejorada
        const isActive = isRouteActive(o.slug);

        return (
          <Link
            key={o.id}
            to={`/mensajes/${o.slug}`}
            className={`px-2 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500
              ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <OccasionIcon slug={o.slug} className="w-4 h-4" isActive={isActive} />
            <span>{localized.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default React.memo(HeaderNav);
