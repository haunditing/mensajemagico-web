import { CONFIG } from '../config';
import { CountryCode } from '../types';

export const getAmazonDomain = (country: CountryCode | string): string => {
  switch (country) {
    case 'MX': return 'amazon.com.mx';
    case 'ES': return 'amazon.es';
    // La mayoría de países de LATAM compran en .com internacional
    default: return 'amazon.com';
  }
};

export const generateAmazonLink = (searchTerm: string, country: CountryCode | string): string => {
  const domain = getAmazonDomain(country);
  const storeId = CONFIG.AMAZON.STORE_ID;
  const encodedTerm = encodeURIComponent(searchTerm);
  return `https://www.${domain}/s?k=${encodedTerm}&tag=${storeId}`;
};