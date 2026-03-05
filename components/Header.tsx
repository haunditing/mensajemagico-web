import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CONFIG } from '../config';
import { useHeaderState } from '../hooks/useHeaderState';
import HeaderLogo from './Header/HeaderLogo';
import HeaderNav from './Header/HeaderNav';
import HeaderNavMobile from './Header/HeaderNavMobile';
import HeaderActions from './Header/HeaderActions';
import { getLocalizedOccasion } from '../services/localizationService';

/**
 * Header Principal - Componente raíz que orquesta toda la navegación
 * Responsabilidades:
 * - Integrar todos los subcomponentes del header
 * - Manejar easter egg (logo clicks)
 * - Generar schema.org para SEO
 * - Gestionar scroll behavior
 * 
 * Arquitectura:
 * - Mobile-first (media queries de hidden a flex)
 * - SOLID: cada pieza es independiente
 * - Accesibilidad: ARIA roles, labels, landmarks
 * - SEO: schema.org Organization + BreadcrumbList JSON-LD
 * - Performance: memoización, useCallback, useMemo
 */
interface HeaderProps {
  isValentine: boolean;
  isChristmas: boolean;
  isValentineDay: boolean;
}

const Header: React.FC<HeaderProps> = ({ isValentine, isChristmas, isValentineDay }) => {
  const siteName = CONFIG.APP_NAME;
  const clickTimeoutRef = useRef<NodeJS.Timeout>();
  const location = useLocation();

  const {
    logoClicks,
    setLogoClicks,
    desktopOccasions,
    isRouteActive,
    currentCountry,
  } = useHeaderState();

  // Handler para easter egg del logo
  const handleLogoClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    setLogoClicks((prev) => {
      const newCount = prev + 1;
      if (newCount === 5) {
        triggerEasterEgg();
        return 0;
      }
      return newCount;
    });

    clickTimeoutRef.current = setTimeout(() => {
      setLogoClicks(0);
    }, 500);
  };

  const triggerEasterEgg = async () => {
    const confetti = (await import('canvas-confetti')).default;
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#2563eb', '#9333ea'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#db2777', '#e11d48'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // Generar schema.org para SEO
  useEffect(() => {
    // Organizacion Schema
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: 'https://mensajemagico.com',
      logo: 'https://mensajemagico.com/favicon-32x32.png',
      description: 'Generador de mensajes mágicos impulsado por IA',
      sameAs: [
        'https://twitter.com/mensajemagico',
        'https://instagram.com/mensajemagico',
      ],
    };

    // BreadcrumbList Schema (si estamos en una página de ocasión)
    const breadcrumbSchema =
      location.pathname.startsWith('/mensajes/') && desktopOccasions.length > 0
        ? {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Inicio',
                item: 'https://mensajemagico.com/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Mensajes',
                item: 'https://mensajemagico.com/mensajes',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Ocasión actual',
                item: `https://mensajemagico.com${location.pathname}`,
              },
            ],
          }
        : null;

    // Limpiar scripts anteriores
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => {
      if (
        script.textContent?.includes('Organization') ||
        script.textContent?.includes('BreadcrumbList')
      ) {
        script.remove();
      }
    });

    // Añadir schema nuevo
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(schemaScript);

    if (breadcrumbSchema) {
      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(breadcrumbScript);
    }

    return () => {
      // Limpiar al desmontar
      document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
        if (
          script.textContent?.includes('Organization') ||
          script.textContent?.includes('BreadcrumbList')
        ) {
          script.remove();
        }
      });
    };
  }, [location.pathname, desktopOccasions, siteName]);

  return (
    <header
      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-all duration-300"
      role="banner"
    >
      <div className="max-w-screen-2xl mx-auto">
        {/* Row 1: Logo + Nav Desktop + Actions */}
        <div className="px-4 sm:px-6 lg:px-8 flex h-16 md:h-20 items-center justify-between lg:justify-start gap-4">
          {/* Logo */}
          <HeaderLogo
            onLogoClick={handleLogoClick}
            isValentine={isValentine}
            isChristmas={isChristmas}
            isValentineDay={isValentineDay}
          />

          {/* Desktop Nav + Actions */}
          <div className="hidden lg:flex items-center gap-4 flex-1 min-w-0">
            <HeaderNav occasions={desktopOccasions} isRouteActive={isRouteActive} />

            {/* Spacer en desktop para que acciones vayan a la derecha */}
            <div className="flex flex-1" />

            {/* Actions (Country + UserMenu) */}
            <HeaderActions />
          </div>

          {/* Actions en mobile */}
          <div className="lg:hidden">
            <HeaderActions />
          </div>
        </div>

        {/* Row 2: Mobile Nav Horizontal (solo móvil) */}
        <HeaderNavMobile occasions={desktopOccasions} isRouteActive={isRouteActive} />
      </div>
    </header>
  );
};

export default React.memo(Header);
