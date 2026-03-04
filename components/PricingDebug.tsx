import React from 'react';
import { useLocalization } from '../context/LocalizationContext';

const PricingDebug: React.FC = () => {
  const { country } = useLocalization();

  const formatPriceCOP = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPriceUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const prices = {
    lite_monthly_cop: 9180,
    lite_monthly_usd: 2.49,
    lite_annual_cop: 110160,
    lite_annual_usd: 24.90,
    pro_monthly_cop: 15960,
    pro_monthly_usd: 3.99,
    pro_annual_cop: 191520,
    pro_annual_usd: 47.88,
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 bg-slate-900 text-white text-xs max-w-md rounded-tl-lg border-t border-l border-slate-700 overflow-auto max-h-96 font-mono">
      <p className="font-bold mb-2">🔍 DEBUGGING PRECIOS - País: {country}</p>
      
      <div className="space-y-2 mb-3 border-b border-slate-700 pb-3">
        <p className="text-blue-400">📍 País detectado: <span className="font-bold">{country}</span></p>
        <p className="text-yellow-400">✓ isColombia: {country === 'CO' ? 'TRUE' : 'FALSE'}</p>
        <p className="text-green-400">✓ Locale: {country === 'CO' ? 'es-CO' : 'en-US'}</p>
      </div>

      <p className="font-bold mb-2 text-purple-400">📋 PRECIOS FORMATEADOS:</p>
      
      {country === 'CO' ? (
        <div className="space-y-1">
          <p className="text-pink-400">Premium Lite Mensual:</p>
          <p className="text-white ml-2">{formatPriceCOP(prices.lite_monthly_cop)}</p>
          
          <p className="text-pink-400 mt-2">Premium Lite Anual:</p>
          <p className="text-white ml-2">{formatPriceCOP(prices.lite_annual_cop)}</p>
          
          <p className="text-pink-400 mt-2">Premium Mensual:</p>
          <p className="text-white ml-2">{formatPriceCOP(prices.pro_monthly_cop)}</p>
          
          <p className="text-pink-400 mt-2">Premium Anual:</p>
          <p className="text-white ml-2">{formatPriceCOP(prices.pro_annual_cop)}</p>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-cyan-400">Premium Lite Mensual:</p>
          <p className="text-white ml-2">{formatPriceUSD(prices.lite_monthly_usd)}</p>
          
          <p className="text-cyan-400 mt-2">Premium Lite Anual:</p>
          <p className="text-white ml-2">{formatPriceUSD(prices.lite_annual_usd)}</p>
          
          <p className="text-cyan-400 mt-2">Premium Mensual:</p>
          <p className="text-white ml-2">{formatPriceUSD(prices.pro_monthly_usd)}</p>
          
          <p className="text-cyan-400 mt-2">Premium Anual:</p>
          <p className="text-white ml-2">{formatPriceUSD(prices.pro_annual_usd)}</p>
        </div>
      )}

      <div className="border-t border-slate-700 mt-3 pt-3">
        <p className="text-yellow-300 font-bold">⚠️ INFORMACIÓN TÉCNICA:</p>
        <p className="text-slate-400 mt-1">Locale: {new Intl.NumberFormat().resolvedOptions().locale}</p>
        <p className="text-slate-400">Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
      </div>
    </div>
  );
};

export default PricingDebug;
