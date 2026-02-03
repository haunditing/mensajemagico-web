import { MessageConfig } from "../types";
import { CONFIG } from "../config";

export const AI_ERROR_FALLBACK =
  "Lo siento, la inspiración está tomando un café. Por favor, intenta de nuevo.";

/**
 * Caché de sesión para optimizar costos y velocidad.
 * Estructura: { 'slug-relacion-tono': ['mensaje1', 'mensaje2'] }
 */
const generationCache: Record<string, string[]> = {};

/**
 * Servicio de Generación de Mensajes Optimizado.
 * Utiliza prompts comprimidos y respeta los límites globales de CONFIG.
 */
export const generateMessage = async (
  config: MessageConfig,
): Promise<string> => {
  const isReply = config.occasion.toLowerCase().includes("responder");
  const isPensamiento = config.occasion.toLowerCase().includes("pensamiento");

  // 1. Generar Llave de Caché
  const contextKey = config.contextWords?.join("-") || "no-context";

  const cacheKey =
    `${config.occasion}-${config.relationship}-${config.tone}-${config.receivedMessageType || "none"}`
      .toLowerCase()
      .replace(/\s+/g, "-");

  // 2. Lógica de recuperación (Short-circuit)
  // Si ya generamos algo igual en esta sesión, lo devolvemos aleatoriamente de los resultados previos

  if (generationCache[cacheKey] && generationCache[cacheKey].length > 0) {
    const cachedResults = generationCache[cacheKey];
    // Retornamos uno aleatorio de la caché para dar variedad sin gastar tokens
    return cachedResults[Math.floor(Math.random() * cachedResults.length)];
  }
  const safeRel = (config.relationship || "").substring(0, 30);
  const safeText = (config.receivedText || "").substring(0, 200);

  const contextInstruction =
    config.contextWords && config.contextWords.length > 0
      ? ` Es MUY IMPORTANTE que integres de forma natural estas palabras o conceptos: ${config.contextWords.join(", ")}.`
      : "";

  let prompt = "";
  let systemInstruction =
    "Eres un experto en comunicación breve y humana. Tu estilo es minimalista y directo. No uses lenguaje robótico.";

  // Calculamos el límite de tokens basándonos en el máximo global definido
  // para asegurar que nunca excedemos lo que el arquitecto configuró.
  const globalMax = CONFIG.AI.MAX_TOKENS;

  if (isPensamiento) {
    systemInstruction +=
      " Creas micro-reflexiones impactantes de una sola línea.";
    prompt = `Genera un pensamiento inspirador sobre ${safeRel} en tono ${config.tone}.${contextInstruction} Debe ser una sola frase corta y potente (máximo 15 palabras). Solo devuelve el texto.`;
  } else if (isReply) {
    systemInstruction += " Generas respuestas de chat naturales.";
    prompt = `Ayúdame a responder este mensaje: "${safeText || config.receivedMessageType}". Es para mi ${safeRel} y quiero sonar ${config.tone}.${contextInstruction} Genera una respuesta de máximo 2 frases cortas. Solo devuelve el texto del mensaje.`;
  } else {
    systemInstruction += " Escribes mensajes cálidos pero muy breves.";
    prompt = `Escribe un mensaje de ${config.occasion} para mi ${safeRel} con tono ${config.tone}.${contextInstruction} Sé muy breve, máximo 3 frases cortas. No uses introducciones, ve al grano. Solo devuelve el texto.`;
  }

  try {
    const response = await fetch("/.netlify/functions/generate-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        systemInstruction,
        temperature: isPensamiento ? 0.9 : CONFIG.AI.TEMPERATURE,
        topP: 0.8,
        //maxOutputTokens: taskMaxTokens,
      }),
    });

    const data = await response.json();

    const result = data?.text?.trim();

    if (!result) {
      throw new Error("El modelo no devolvió contenido.");
    }

    // 3. Almacenamiento en Caché
    if (!generationCache[cacheKey]) generationCache[cacheKey] = [];
    generationCache[cacheKey].push(result);

    return result;
  } catch (error: any) {
    console.error("AI Efficiency Error:", error);
    return AI_ERROR_FALLBACK;
  }
};
