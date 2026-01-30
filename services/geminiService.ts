import { MessageConfig } from "../types";
import { CONFIG } from "../config";

// Caché simple para evitar duplicidad de costos en la misma sesión
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

  const cacheKey = `${config.occasion}-${config.relationship}-${config.tone}-${config.receivedMessageType || "none"}`;

  const safeRel = (config.relationship || "").substring(0, 30);
  const safeText = (config.receivedText || "").substring(0, 200);

  let prompt = "";
  let systemInstruction = "";

  // Calculamos el límite de tokens basándonos en el máximo global definido
  // para asegurar que nunca excedemos lo que el arquitecto configuró.
  const globalMax = CONFIG.AI.MAX_TOKENS;
  let taskMaxTokens = 200;

  if (isPensamiento) {
    systemInstruction =
      "Escritor minimalista. Pensamientos breves, profundos y completos.";

    prompt = `
Tema: ${safeRel}.
Estado: ${config.tone}.

Escribe un pensamiento completo y cerrado.
No escribas fragmentos.
Máx 25 palabras.
Solo el texto.
`.trim();

    taskMaxTokens = Math.min(60, globalMax);
  } else if (isReply) {
    systemInstruction = "Asistente de mensajería social. Redacción natural.";

    prompt = `
Responder a: "${safeText || config.receivedMessageType}".
Para: ${safeRel}.
Tono: ${config.tone}.

Escribe una respuesta natural y completa.
Debe tener al menos 2 frases.
No respondas con una sola frase.
Máx 50 palabras.
Solo el mensaje.
`.trim();

    taskMaxTokens = Math.min(120, globalMax);
  } else {
    systemInstruction = "Experto en redacción emocional y social.";

    prompt = `
Ocasión: ${config.occasion}.
Destinatario: ${safeRel}.
Tono: ${config.tone}.

Escribe un mensaje completo y cerrado.
Debe tener al menos 2 frases.
No respondas con una sola frase.
Máx 80 palabras.
Sin etiquetas.
`.trim();

    taskMaxTokens = Math.min(200, globalMax);
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
        maxTokens: taskMaxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error("Error al generar el mensaje");
    }

    const data = await response.json();
    return data.text || "";
  } catch (error: any) {
    console.error("AI Efficiency Error:", error);
    return "No pudimos conectar con la inspiración. Reintenta pronto.";
  }
};
