import { useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { OCCASIONS } from '../constants';
import { useLocalization } from '../context/LocalizationContext';
import { isOccasionActive } from '../services/holidayService';

/**
 * Hook para gestionar el estado y lógica del header
 * Responsabilidades:
 * - Filtrado dinámico de ocasiones
 * - Detección responsive
 * - State del easter egg
 */
export const useHeaderState = () => {
  const location = useLocation();
  const { country: currentCountry } = useLocalization();
  const [logoClicks, setLogoClicks] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

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

  // Detectar scroll para cambios en el header
  const handleScroll = useCallback(() => {
    setHasScrolled(window.scrollY > 10);
  }, []);

  return {
    logoClicks,
    setLogoClicks,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    hasScrolled,
    handleScroll,
    activeOccasions,
    desktopOccasions,
    isRouteActive,
    currentCountry,
  };
};
