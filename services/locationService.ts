import { setUserCountry } from './localizationService';
import { CountryCode } from '../types';

let cachedLocation: string | null = null;
const STORAGE_KEY = 'user_geo_location';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Obtiene la ciudad del usuario basada en su IP.
 * Usa caché en memoria y LocalStorage para evitar llamadas excesivas a la API externa.
 * Implementa redundancia con múltiples proveedores.
 */
export const getUserLocation = async (): Promise<string | null> => {
  // 1. Revisar caché en memoria (Navegación SPA)
  if (cachedLocation) return cachedLocation;

  // 2. Revisar LocalStorage (Persistencia entre recargas)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { city, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < CACHE_DURATION) {
        cachedLocation = city;
        return city;
      }
    }
  } catch (e) {
    // Si hay error leyendo/parseando, continuamos con la petición
  }

  // Lista de proveedores con fallback para mayor robustez
  const providers = [
    { url: "https://ipapi.co/json/", getCity: (d: any) => d.city, getCountry: (d: any) => d.country_code },
    { url: "https://ipwho.is/", getCity: (d: any) => d.city, getCountry: (d: any) => d.country_code },
    { url: "https://freeipapi.com/api/json", getCity: (d: any) => d.cityName, getCountry: (d: any) => d.countryCode },
  ];

  for (const provider of providers) {
    try {
      const response = await fetch(provider.url);
      if (response.ok) {
        const data = await response.json();
        const city = provider.getCity(data);
        const country = provider.getCountry(data);

        if (city) {
          cachedLocation = city;
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            city,
            timestamp: Date.now()
          }));

          // Actualizar país automáticamente si no está configurado
          if (country && !localStorage.getItem('user_preferred_country')) {
            setUserCountry(country as CountryCode);
          }

          return city;
        }
      }
    } catch (error) {
      // Continuar con el siguiente proveedor si falla
    }
  }

  console.warn("No se pudo detectar la ubicación automática.");
  return null;
};