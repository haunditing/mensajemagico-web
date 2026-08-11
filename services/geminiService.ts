import { MessageConfig } from "../types";
import { BASE_URL } from "../context/api"; // Tu wrapper de fetch o axios

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
 * Servicio de Generación con Streaming (Token a Token).
 * Mejora la LCP percibida permitiendo leer mientras se genera.
 */
export const generateMessageStream = async (
  config: MessageConfig,
  onToken: (token: string) => void,
  userId?: string,
  userLocation?: string,
  contactId?: string,
  styleInstructions?: string,
  creativityLevel?: string,
  avoidTopics?: string,
): Promise<GenerationResponse> => {
  const cacheKey =
    `${config.occasion}-${config.relationship}-${config.tone}-${config.contextWords?.join("")}-${config.styleSample || ""}-${styleInstructions || ""}-${creativityLevel || ""}-${avoidTopics || ""}`
      .toLowerCase()
      .replace(/\s+/g, "-");

  if (generationCache[cacheKey] && generationCache[cacheKey].length > 0) {
    const cachedResults = generationCache[cacheKey];
    const content =
      cachedResults[Math.floor(Math.random() * cachedResults.length)];

    // Simular streaming para caché (Efecto visual)
    const chunkSize = 4;
    for (let i = 0; i < content.length; i += chunkSize) {
      onToken(content.slice(i, i + chunkSize));
      await new Promise((resolve) => setTimeout(resolve, 15)); // 15ms de delay entre chunks
    }
    return { content };
  }

  try {
    const token = localStorage.getItem("token");
    const url = `${BASE_URL}/api/magic/generate-stream`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId,
        occasion: config.occasion,
        relationship: config.relationship,
        tone: config.tone,
        receivedText: config.receivedText,
        contextWords: config.contextWords || [],
        formatInstruction: config.formatInstruction,
        styleSample: config.styleSample,
        userLocation,
        contactId,
        styleInstructions,
        creativityLevel,
        avoidTopics,
        intention: config.intention,
        relationalHealth: config.relationalHealth,
        grammaticalGender: config.grammaticalGender,
        greetingMoment: config.greetingMoment,
        apologyReason: config.apologyReason,
      }),
    });

    // 1. Manejo explícito de errores HTTP (como 429 o 500)
    if (!response.ok) {
      let errorMessage = "Error en la generación";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = response.statusText;
      }

      const error = new Error(errorMessage);
      (error as any).status = response.status;

      // Mensaje amigable para el usuario en caso de saturación
      if (response.status === 429) {
        error.message =
          "La IA está recibiendo muchas solicitudes. Por favor, intenta de nuevo en unos segundos.";
      }

      throw error;
    }

    if (!response.body) throw new Error("ReadableStream not supported");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });

      onToken(chunk);
      fullText += chunk;
    }

    if (!generationCache[cacheKey]) generationCache[cacheKey] = [];
    generationCache[cacheKey].push(fullText.trim());

    return { content: fullText.trim() };
  } catch (error) {
    console.error("Error en stream:", error);
    throw error;
  }
};
