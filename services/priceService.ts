/**
 * Servicio de formateo de precios
 * Formatea cantidades según la moneda y locale
 */

export interface PriceFormatOptions {
  currency?: 'USD' | 'COP';
  locale?: string;
  showCurrency?: boolean;
}

/**
 * Formatea un precio según la configuración proporcionada
 * @param amount - Monto a formatear
 * @param options - Opciones de formateo (moneda, locale, mostrar símbolo)
 * @returns Precio formateado como string
 */
export const formatPrice = (
  amount: number,
  options?: PriceFormatOptions
): string => {
  const currency = options?.currency || 'USD';
  const locale = options?.locale || (currency === 'COP' ? 'es-CO' : 'en-US');
  const showCurrency = options?.showCurrency !== false;

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'COP' ? 0 : 2,
    maximumFractionDigits: currency === 'COP' ? 0 : 2,
  }).format(amount);

  return formatted;
};

/**
 * Obtiene la configuración de moneda basada en el país
 * @param country - Código del país (ej: 'CO', 'US')
 * @returns Configuración de moneda y locale
 */
export const getCurrencyConfig = (country: string) => {
  const isColombia = country === 'CO';
  return {
    currency: isColombia ? 'COP' as const : 'USD' as const,
    locale: isColombia ? 'es-CO' : 'en-US',
  };
};
