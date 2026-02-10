let cachedLocation: string | null = null;

/**
 * Obtiene la ciudad del usuario basada en su IP.
 * Usa caché en memoria para evitar llamadas excesivas a la API externa.
 * Implementa redundancia con múltiples proveedores.
 */
export const getUserLocation = async (): Promise<string | null> => {
  if (cachedLocation) return cachedLocation;

  // Lista de proveedores con fallback para mayor robustez
  const providers = [
    { url: "https://ipapi.co/json/", getCity: (d: any) => d.city },
    { url: "https://ipwho.is/", getCity: (d: any) => d.city },
    { url: "https://freeipapi.com/api/json", getCity: (d: any) => d.cityName },
  ];

  for (const provider of providers) {
    try {
      const response = await fetch(provider.url);
      if (response.ok) {
        const data = await response.json();
        const city = provider.getCity(data);
        if (city) {
          cachedLocation = city;
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