import React from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { CountryCode } from '../types';

const CountrySelector: React.FC = () => {
  const { country, setCountry } = useLocalization();

  const countries: { code: CountryCode; name: string; flag: string }[] = [
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'MX', name: 'México', flag: '🇲🇽' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'PE', name: 'Perú', flag: '🇵🇪' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
    { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
    { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
    { code: 'GENERIC', name: 'Global (USD)', flag: '🌍' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
        Selecciona tu país:
      </span>
      <div className="flex gap-2 flex-wrap justify-center">
        {countries.map((c) => (
          <button
            key={c.code}
            onClick={() => setCountry(c.code)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              country === c.code
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {c.flag} {c.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CountrySelector;
