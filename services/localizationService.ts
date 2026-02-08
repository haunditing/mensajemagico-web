
import { CountryCode, LocalizedContent, Occasion, CulturalVariant } from '../types';

const currentYear = new Date().getFullYear();

const COUNTRY_STORAGE_KEY = 'user_preferred_country';

const AMOR_VARIANTS: Record<CountryCode, CulturalVariant[]> = {
  'CO': [
    {
      startMonth: 8,
      name: 'Amor y Amistad',
      h1: 'Mensajes de Amor y Amistad para Septiembre',
      metaTitle: `Amor y Amistad Colombia ${currentYear}: Frases y Mensajes Especiales`,
      metaDesc: 'Genera mensajes únicos para Amor y Amistad en Colombia. Frases románticas y de amistad para dedicar en septiembre.'
    },
    {
      startMonth: 1,
      name: 'San Valentín',
      h1: 'Mensajes de San Valentín para Enamorar',
      metaTitle: `San Valentín ${currentYear}: Mensajes de Amor para Enamorar`,
      metaDesc: 'Las mejores frases de San Valentín en Colombia. Crea mensajes románticos personalizados para tu pareja.'
    },
    {
      name: 'Mensajes de Amor',
      h1: 'Mensajes de Amor para Dedicar',
      metaTitle: 'Mensajes de Amor: Frases Románticas para Dedicar en Colombia',
      metaDesc: 'Encuentra las mejores frases de amor para cualquier momento del año. Personaliza tus mensajes con nuestra IA.'
    }
  ],
  'MX': [
    {
      startMonth: 1,
      name: 'Día del Amor y la Amistad',
      h1: 'Mensajes para el Día del Amor y la Amistad',
      metaTitle: `Día del Amor y la Amistad ${currentYear}: Frases y Mensajes en México`
    },
    {
      name: 'Mensajes de Amor',
      h1: 'Frases de Amor para Enamorar'
    }
  ],
  'AR': [
    {
      startMonth: 1,
      name: 'Día de los Enamorados',
      h1: 'Mensajes para el Día de los Enamorados',
      metaTitle: `Día de los Enamorados Argentina ${currentYear}: Frases y Poemas de Amor`,
      metaDesc: 'Genera los mejores mensajes para el Día de los Enamorados en Argentina.'
    },
    {
      name: 'Mensajes de Amor',
      h1: 'Frases de Amor y Pasión'
    }
  ],
  'PE': [
    {
      startMonth: 1,
      name: 'San Valentín',
      h1: 'Mensajes de San Valentín para Enamorar'
    },
    {
      name: 'Mensajes de Amor',
      h1: 'Frases de Amor para Dedicar'
    }
  ],
  'CL': [
    {
      startMonth: 1,
      name: 'San Valentín',
      h1: 'Mensajes de San Valentín'
    },
    {
      name: 'Mensajes de Amor',
      h1: 'Frases de Amor para Dedicar'
    }
  ],
  'EC': [
    {
      startMonth: 1,
      name: 'San Valentín',
      h1: 'Mensajes de San Valentín'
    },
    {
      name: 'Mensajes de Amor',
      h1: 'Frases de Amor para Dedicar'
    }
  ],
  'UY': [
    {
      startMonth: 1,
      name: 'San Valentín',
      h1: 'Mensajes de San Valentín'
    },
    {
      name: 'Mensajes de Amor',
      h1: 'Frases de Amor para Dedicar'
    }
  ],
  'VE': [
    {
      startMonth: 1,
      name: 'San Valentín',
      h1: 'Mensajes de San Valentín'
    },
    {
      name: 'Mensajes de Amor',
      h1: 'Frases de Amor para Dedicar'
    }
  ],
  'GENERIC': [
    {
      startMonth: 1,
      name: 'San Valentín',
      h1: 'Mensajes de San Valentín e Inspiración',
      metaTitle: `San Valentín ${currentYear}: Generador de Mensajes y Frases de Amor`,
      metaDesc: 'Crea mensajes de San Valentín personalizados con IA.'
    },
    {
      name: 'Mensajes de Amor',
      h1: 'Frases de Amor para Dedicar',
      metaTitle: 'Mensajes de Amor: Frases Románticas y Poemas',
      metaDesc: 'Genera mensajes de amor personalizados para cualquier ocasión.'
    }
  ]
};

export const getCurrentCountry = (): CountryCode => {
  const saved = localStorage.getItem(COUNTRY_STORAGE_KEY) as CountryCode;
  if (saved) return saved;

  const locale = navigator.language.toUpperCase();
  const countryMap: Record<string, CountryCode> = {
    'AR': 'AR', 'CO': 'CO', 'MX': 'MX', 'PE': 'PE', 
    'CL': 'CL', 'EC': 'EC', 'UY': 'UY', 'VE': 'VE'
  };

  for (const [code, country] of Object.entries(countryMap)) {
    if (locale.includes(code)) return country;
  }

  return 'GENERIC';
};

const resolveAmorVariant = (country: CountryCode, month: number): CulturalVariant => {
  const countryVariants = AMOR_VARIANTS[country] || AMOR_VARIANTS['GENERIC'];
  const seasonalMatch = countryVariants.find(v => v.startMonth === month);
  if (seasonalMatch) return seasonalMatch;
  const neutralMatch = countryVariants.find(v => v.startMonth === undefined);
  if (neutralMatch) return neutralMatch;
  return AMOR_VARIANTS['GENERIC'].find(v => v.startMonth === undefined)!;
};

export const getLocalizedOccasion = (occasion: Occasion, countryOverride?: CountryCode): LocalizedContent => {
  const country = countryOverride || getCurrentCountry();
  const now = new Date();
  const currentMonth = now.getMonth();
  
  if (occasion.id === 'amor') {
    const variant = resolveAmorVariant(country, currentMonth);
    return {
      name: variant.name,
      description: variant.description || occasion.description,
      h1: variant.h1 || occasion.h1,
      metaTitle: variant.metaTitle || occasion.metaTitle,
      metaDesc: variant.metaDesc || occasion.metaDesc
    };
  }

  return {
    name: occasion.name,
    description: occasion.description,
    h1: occasion.h1,
    metaTitle: occasion.metaTitle,
    metaDesc: occasion.metaDesc
  };
};

export const setUserCountry = (country: CountryCode) => {
  localStorage.setItem(COUNTRY_STORAGE_KEY, country);
};
