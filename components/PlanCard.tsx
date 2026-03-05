import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../context/LocalizationContext';
import { formatPrice, getCurrencyConfig } from '../services/priceService';

export interface Benefit {
  icon: React.ReactNode;
  title: string;
  desc?: string;
}

export interface PlanCardProps {
  title: string;
  subtitle?: string;
  tag?: {
    text: string;
    gradientClasses: string;
    extraClasses?: string;
  };
  description?: string;
  priceDisplay: React.ReactNode;
  offer?: {
    originalPrice?: number;
    label?: string;
    endDate?: string;
    savingsLabel?: string;
  };
  yearlyInfo?: {
    price: number;
    savings?: number;
  };
  benefits: Benefit[];
  showAllBenefits?: boolean;
  onSubscribe: () => void;
  ctaClasses?: string;
  containerClasses?: string;
  tagColorClasses?: string;
  benefitTextClasses?: string;
}

/**
 * Componente genérico para mostrar tarjeta de plan de suscripción.
 * Diseñado para ser configurable y reutilizable entre Premium Lite/Premium Pro
 */
const PlanCard: React.FC<PlanCardProps> = ({
  title,
  subtitle,
  tag,
  description,
  priceDisplay,
  offer,
  yearlyInfo,
  benefits,
  showAllBenefits = false,
  onSubscribe,
  ctaClasses = '',
  containerClasses = '',
  tagColorClasses = '',
  benefitTextClasses = 'text-slate-700 dark:text-slate-300',
}) => {
  const [allBenefits, setAllBenefits] = React.useState(showAllBenefits);
  const { country } = useLocalization();
  const currencyConfig = React.useMemo(() => getCurrencyConfig(country), [country]);

  return (
    <div className={`relative flex flex-col rounded-[2.5rem] p-6 md:p-8 shadow-lg ${containerClasses}`}>
      {tag && (
        <div className="absolute top-0 inset-x-0 flex justify-center -mt-3 z-20">
          <span
            className={`bg-gradient-to-r ${tag.gradientClasses} text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-lg uppercase tracking-widest border ${tag.extraClasses || ''}`}
          >
            {tag.text}
          </span>
        </div>
      )}

      <div className="mb-8 relative z-10 mt-2">
        <h3 className="text-2xl font-bold mb-1">{title}</h3>
        {subtitle && <p className="text-sm mb-6 text-current">{subtitle}</p>}
        {description && <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{description}</p>}

        <div className="flex items-baseline gap-2">
          {priceDisplay}
        </div>

        {offer && offer.originalPrice && (
          <div className="flex flex-col items-start gap-1 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 line-through text-sm font-medium">
                {formatPrice(offer.originalPrice, currencyConfig)}
              </span>
              {offer.label && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/30">
                  {offer.label}
                </span>
              )}
            </div>
            {offer.endDate && (
              <p className="text-[10px] text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1 bg-amber-100 dark:bg-amber-950/30 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700/50">
                <span>⏳</span> Válido hasta el {offer.endDate}
              </p>
            )}
          </div>
        )}

        {yearlyInfo && (
          <div className="mt-6 bg-amber-100 dark:bg-amber-950/30 rounded-xl p-3 border border-amber-300 dark:border-amber-700/50">
            <p className="text-sm text-amber-900 dark:text-amber-200 font-medium">
              Facturado <span className="text-amber-700 dark:text-amber-300 font-bold">
                {formatPrice(yearlyInfo.price, currencyConfig)}
              </span> al año
            </p>
            {yearlyInfo.savings && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-bold">
                ¡Te ahorras {formatPrice(yearlyInfo.savings, currencyConfig)} en total!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Desktop CTA */}
      <div className="hidden md:block mb-8 relative z-10">
        <button
          onClick={onSubscribe}
          className={`w-full py-4 rounded-2xl font-bold text-lg text-white ${ctaClasses}`}
        >
          Suscribirse Ahora
        </button>
      </div>

      <ul className={`space-y-4 mb-8 flex-1 relative z-10 ${benefitTextClasses}`}>
        {(allBenefits ? benefits : benefits.slice(0, 4)).map((b, idx) => (
          <li key={idx} className="flex items-center gap-3">
            <span className="text-green-500 text-xl font-bold">✓</span>
            <span className="font-medium">{b.title}</span>
          </li>
        ))}
      </ul>

      {!allBenefits && (
        <button
          onClick={() => setAllBenefits(true)}
          className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-4 border border-slate-800 rounded-xl hover:bg-slate-800"
        >
          Ver todos los beneficios ↓
        </button>
      )}

      {/* optional footer link area would be passed by parent via children maybe */}
    </div>
  );
};

export default React.memo(PlanCard);
