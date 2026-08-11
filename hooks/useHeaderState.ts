import { useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { OCCASIONS } from '../constants';
import { useLocalization } from '../context/LocalizationContext';
import { isOccasionActive } from '../services/holidayService';

/**
 * Hook para gestionar el estado y lógica del header
 * Responsabilidades:
 * - Filtrado dinámico de ocasiones
 * - State del easter egg
 */
export const useHeaderState = () => {
  const location = useLocation();
  const { country: currentCountry } = useLocalization();
  const [logoClicks, setLogoClicks] = useState(0);

  // Ocasiones activas memoizadas para evitar recálculos innecesarios
  const activeOccasions = useMemo(
    () =>
      OCCASIONS.filter((o) =>
        isOccasionActive(o.id, currentCountry),
      ),
    [currentCountry],
  );

  // Ocasiones para desktop (primeras 6)
  const desktopOccasions = useMemo(
    () => activeOccasions.slice(0, 6),
    [activeOccasions],
  );

  // Detectar si una ruta es activa
  const isRouteActive = useCallback(
    (slug: string) => location.pathname.startsWith(`/mensajes/${slug}`),
    [location.pathname],
  );

  return {
    logoClicks,
    setLogoClicks,
    desktopOccasions,
    isRouteActive,
    currentCountry,
  };
};
