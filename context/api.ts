const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// En local usamos el proxy de Vite (ruta relativa) para evitar problemas de CORS.
// En producción apuntamos directamente al backend en Railway.
export const BASE_URL = import.meta.env.PROD 
  ? 'https://web-production-e736.up.railway.app' 
  : '';

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  let data: any;

  // Verificar si la respuesta es JSON antes de intentar parsearla
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    // Si no es JSON (ej. error 404 HTML del proxy), lanzamos error con el texto o estado
    const text = await response.text();
    throw new Error(text || `Error ${response.status}: ${response.statusText}`);
  }

  if (!response.ok) {
    console.error("API Error Details:", data); // Ver detalles del error en consola
    const error: any = new Error(
      data.error || data.message || "Error en la petición",
    );
    error.status = response.status;
    // Preservar propiedades especiales como 'upsell' para el manejo en UI
    if (data.upsell) error.upsell = data.upsell;
    throw error;
  }

  return data;
}

export const api = {
  get: async <T = any>(url: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },

  post: async <T = any>(url: string, body: any): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  put: async <T = any>(url: string, body: any): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  delete: async <T = any>(url: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },
};
