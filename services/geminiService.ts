import { MessageConfig } from "../types";
import { CONFIG } from "../config";


/**
 * Servicio de Generación de Mensajes Optimizado.
 * Utiliza prompts comprimidos y respeta los límites globales de CONFIG.
 */
export const generateMessage = async (
  config: MessageConfig,
): Promise<string> => {
  const isReply = config.occasion.toLowerCase().includes("responder");
  const isPensamiento = config.occasion.toLowerCase().includes("pensamiento");


  const safeRel = (config.relationship || "").substring(0, 30);
  const safeText = (config.receivedText || "").substring(0, 200);

  let prompt = "";
  let systemInstruction = "";

  // Calculamos el límite de tokens basándonos en el máximo global definido
  // para asegurar que nunca excedemos lo que el arquitecto configuró.
  const globalMax = CONFIG.AI.MAX_TOKENS;
  let taskMaxTokens = 260;

  if (isPensamiento) {
    systemInstruction = "Eres un escritor de reflexiones minimalistas. Creas pensamientos breves pero con gran carga emocional y filosófica.";
    prompt = `Genera un pensamiento inspirador sobre ${safeRel}. El tono debe ser ${config.tone}. Debe ser una sola frase impactante de longitud media. Solo devuelve el texto del pensamiento.`;
  } else if (isReply) {
    systemInstruction = "Eres un experto en comunicación social y mensajería instantánea. Tu objetivo es ayudar a las personas a responder de forma natural y efectiva.";
    prompt = `Ayúdame a responder un mensaje. Me enviaron: "${safeText || config.receivedMessageType}". El destinatario es mi ${safeRel} y quiero sonar ${config.tone}. Genera una respuesta natural y fluida. Solo devuelve el texto del mensaje.`;
  } else {
    systemInstruction = "Eres un redactor experto en cartas y mensajes emocionales. Sabes transmitir sentimientos con las palabras exactas.";
    prompt = `Escribe un mensaje de ${config.occasion} para mi ${safeRel}. El tono debe ser ${config.tone}. Crea un mensaje cálido y bien redactado de longitud moderada. No uses etiquetas ni introducciones, solo el contenido del mensaje.`;
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
        maxOutputTokens: taskMaxTokens,
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
