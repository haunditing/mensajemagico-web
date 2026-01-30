
import React from 'react';

interface OccasionIconProps {
  slug?: string;
  icon?: string; // Fallback para cuando no hay slug o es un emoji simple
  className?: string;
  isLarge?: boolean;
  isActive?: boolean;
}

const OccasionIcon: React.FC<OccasionIconProps> = ({ slug, icon, className = "", isLarge = false, isActive = false }) => {
  // Diccionario de colores temáticos
  const colors: Record<string, string> = {
    'pensamiento-del-dia': 'text-indigo-500',
    'responder-un-mensaje': 'text-sky-500',
    'no-me-dejes-en-visto': 'text-emerald-500',
    'perdoname': 'text-amber-500',
    'amor': 'text-rose-500',
    'cumpleanos': 'text-orange-500',
    'anniversary': 'text-cyan-500',
    'dia-la-madre': 'text-pink-500',
    'dia-de-la-padre': 'text-blue-500',
    'navidad': 'text-red-500'
  };

  const iconColorClass = isActive ? 'text-white' : (slug ? (colors[slug] || 'text-slate-400') : 'text-current');
  const sizeClass = isLarge ? 'w-12 h-12' : 'w-6 h-6';

  // Si el icono es 'whatsapp', renderizamos el SVG oficial (Legacy support)
  if (icon === 'whatsapp' || slug === 'no-me-dejes-en-visto') {
    return (
      <svg viewBox="0 0 24 24" className={`${sizeClass} ${iconColorClass} ${className}`} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    );
  }

  // Diccionario de paths SVG
  const icons: Record<string, React.ReactNode> = {
    'pensamiento-del-dia': (
      <>
        <path d="M12 3V4M12 20V21M21 12H20M4 12H3M18.364 18.364L17.6569 17.6569M6.34315 6.34315L5.63604 5.63604M18.364 5.63604L17.6569 6.34315M6.34315 17.6569L5.63604 18.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" stroke="currentColor" strokeWidth="2" fill="none" />
      </>
    ),
    'responder-un-mensaje': <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    'perdoname': (
      <>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 5l-1.5 3 2.5 3-2.5 3 2.5 3-1.5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    'amor': <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.77-8.77 1.06-1.06a5.5 5.5 0 0 0 0-7.78v0z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    'cumpleanos': <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8m16 0H4m16 0h2m-20 0H2m5-10V7m5 4V3m5 8V7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    'anniversary': (
      <>
        <circle cx="12" cy="14" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 7V3L15 5L12 7Z" fill="currentColor" />
      </>
    ),
    'dia-la-madre': <path d="M12 10C12 10 14.5 6.5 17 9C19.5 11.5 16 14 16 14L12 18L8 14C8 14 4.5 11.5 7 9C9.5 6.5 12 10 12 10Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    'dia-de-la-padre': <path d="M6 3L8 12L12 21L16 12L18 3H6Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />,
    'navidad': (
      <>
        <path d="M12 3L5 18H19L12 3Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M12 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    )
  };

  if (slug && icons[slug]) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={`${sizeClass} ${iconColorClass} ${className}`} xmlns="http://www.w3.org/2000/svg">
        {icons[slug]}
      </svg>
    );
  }

  // Fallback a emoji si no hay slug o icono especial
  return <span className={`${isLarge ? 'text-5xl' : 'text-3xl'} ${className}`}>{icon}</span>;
};

export default OccasionIcon;
