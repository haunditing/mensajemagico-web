import { MessageConfig } from "../types";
import { api } from "../context/api"; // Tu wrapper de fetch o axios

export const AI_ERROR_FALLBACK =
  "Lo siento, la inspiración está tomando un café. Por favor, intenta de nuevo.";

/**
 * Caché local para evitar gastos innecesarios y dar velocidad.
 */
const generationCache: Record<string, string[]> = {};

/**
 * Estructura de respuesta del servicio de generación
 */
export interface GenerationResponse {
  content: string;
  remainingCredits?: number;
}

/**
 * Servicio de Generación de Mensajes (Frontend)
 * Este archivo ya NO construye el prompt, solo envía los parámetros al Backend.
 */
export const generateMessage = async (
  config: MessageConfig,
  userId?: string,
  userLocation?: string
): Promise<GenerationResponse> => {
  
  // 1. Generar Llave de Caché para optimización
  const cacheKey = `${config.occasion}-${config.relationship}-${config.tone}-${config.contextWords?.join("")}`
    .toLowerCase()
    .replace(/\s+/g, "-");

  // 2. Recuperación de Caché (Short-circuit)
  if (generationCache[cacheKey] && generationCache[cacheKey].length > 0) {
    const cachedResults = generationCache[cacheKey];
    return { content: cachedResults[Math.floor(Math.random() * cachedResults.length)] };
  }

  try {
    /**
     * IMPORTANTE: Enviamos solo los datos crudos. 
     * El Backend usará su `PlanService` para decidir el modelo y las instrucciones.
     */
    const response = await api.post("/api/magic/generate", {
      userId,
      occasion: config.occasion,
      relationship: config.relationship,
      tone: config.tone,
      receivedText: config.receivedText, // Para respuestas
      contextWords: config.contextWords ? config.contextWords.join(" ") : "",
      formatInstruction: config.formatInstruction,
      userLocation, // Enviamos la ubicación detectada al backend
    });

    // Validamos que el backend responda con el campo esperado
    const result = response?.text || response?.result;
    const remainingCredits = response?.remaining_credits;

    if (!result) {
      throw new Error("El oráculo no devolvió palabras esta vez.");
    }

    // 3. Guardar en Caché para futuras peticiones iguales
    if (!generationCache[cacheKey]) generationCache[cacheKey] = [];
    generationCache[cacheKey].push(result.trim());

    return { content: result.trim(), remainingCredits };

  } catch (error: any) {
    /**
     * Lógica de Patrón de Upgrade:
     * Si el error viene del backend por falta de créditos o plan insuficiente,
     * el error contendrá el mensaje de 'upsell' definido en plans.js.
     */
    if (error.status === 403 || error.message?.includes("límite")) {
       // Re-lanzamos para que el componente Generator.tsx muestre el Modal de Compra
       throw error; 
    }

    console.error("Error en flujo de generación:", error);
    return { content: AI_ERROR_FALLBACK };
  }
};