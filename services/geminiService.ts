import { GoogleGenAI } from "@google/genai";
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
  let systemInstruction =
    "Eres un experto en comunicación breve. Tu estilo es minimalista, humano y directo. Evitas los párrafos largos y el lenguaje excesivamente formal o robótico.";

  // Calculamos el límite de tokens basándonos en el máximo global definido
  // para asegurar que nunca excedemos lo que el arquitecto configuró.
  const globalMax = CONFIG.AI.MAX_TOKENS;
  let taskMaxTokens = 260;

  if (isPensamiento) {
    systemInstruction +=
      " Creas micro-reflexiones impactantes de una sola línea.";
    prompt = `Genera un pensamiento inspirador sobre ${safeRel} en tono ${config.tone}. Debe ser una sola frase corta y potente (máximo 15 palabras). Solo devuelve el texto.`;
  } else if (isReply) {
    systemInstruction +=
      " Generas respuestas de chat naturales, como las que enviaría un amigo.";
    prompt = `Ayúdame a responder este mensaje: "${safeText || config.receivedMessageType}". Es para mi ${safeRel} y quiero sonar ${config.tone}. Genera una respuesta de máximo 2 frases cortas. Solo devuelve el texto del mensaje.`;
  } else {
    systemInstruction +=
      " Escribes mensajes cálidos pero muy breves, ideales para WhatsApp.";
    prompt = `Escribe un mensaje de ${config.occasion} para mi ${safeRel} con tono ${config.tone}. Sé muy breve, máximo 3 frases cortas. No uses introducciones, ve al grano. Solo devuelve el texto.`;
  }

  /*try {
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
    });*/
// Esto es agregado para usar el SDK oficial de Gemini en lugar de la función Netlify
      try {
    // Inicialización directa del SDK
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: CONFIG.AI.MODEL,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: isPensamiento ? 0.9 : 0.7,
        topP: 0.8,
      },
    });

    const result = response.text || "";
    
    if (!result) {
      throw new Error("El modelo no devolvió contenido.");
    }


    return result;
  } catch (error: any) {
    console.error("Gemini SDK Error:", error);
    return "Lo siento, la inspiración está tomando un café. Por favor, intenta de nuevo.";
  }
};

// aqui termina el nuevo codigo

   /* if (!response.ok) {
      throw new Error("Error al generar el mensaje");
    }

    const data = await response.json();
    return data.text || "";
  } catch (error: any) {
    console.error("AI Efficiency Error:", error);
    return "No pudimos conectar con la inspiración. Reintenta pronto.";
  }
};*/
