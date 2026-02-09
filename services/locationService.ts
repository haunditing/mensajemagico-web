let cachedLocation: string | null = null;

/**
 * Obtiene la ciudad del usuario basada en su IP.
 * Usa caché en memoria para evitar llamadas excesivas a la API externa.
 */
export const getUserLocation = async (): Promise<string | null> => {
  if (cachedLocation) return cachedLocation;

  try {
    // Usamos ipapi.co (HTTPS) que devuelve la ciudad directamente.
    // Alternativas: ipinfo.io, ip-api.com (HTTP)
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error("Error fetching location");
    
    const data = await response.json();
    if (data && data.city) {
      cachedLocation = data.city;
      return data.city;
    }
  } catch (error) {
    console.warn("No se pudo detectar la ubicación automática:", error);
  }
  return null;
};