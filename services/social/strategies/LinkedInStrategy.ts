// services/social/strategies/LinkedInStrategy.ts
import { IPlatformStrategy, PostCreationPayload, StructuredPost } from "../types";

export class LinkedInStrategy implements IPlatformStrategy {
  buildPrompt(payload: PostCreationPayload): any {
    const keywords = (payload.contextWords || []).join(', ') || 'ninguna';
    const instructions = `
      CONTRATO DE IA: Tu rol es un estratega de contenido B2B creando un post para LinkedIn.
      DATOS PARA GENERAR:
      - Tema: ${payload.theme}
      - Tono: ${payload.tone}
      - Intención: ${payload.intention}
      - Palabras clave: ${keywords}
      OUTPUT: Un objeto JSON con las claves "post_text" y "hashtags".

      REGLAS:
      - El "post_text" debe empezar con una línea "gancho" que genere intriga o aporte valor inmediato.
      - El cuerpo del post debe estar bien estructurado, usando saltos de línea para crear espacios en blanco y facilitar la lectura.
      - El tono debe ser profesional, pero puede ser personal o inspirador.
      - El post debe terminar con una pregunta abierta o un CTA profesional.
      - Los "hashtags" deben ser un array de 3 a 5 strings, relevantes para el sector profesional del tema.

      No incluyas nada más en tu respuesta que no sea el objeto JSON.
    `;
    
    return {
      instructions,
      theme: payload.theme,
      tone: payload.tone,
      contextWords: payload.contextWords,
    };
  }

  parseResponse(apiResponse: any): StructuredPost {
    let data = apiResponse;
    if (typeof apiResponse === 'string') {
      try {
        const cleanJson = apiResponse.replace(/```json|```/g, "").trim();
        data = JSON.parse(cleanJson);
      } catch (error) {
        console.error("Error parsing API response for LinkedIn:", error);
        return { mainContent: apiResponse };
      }
    }
    
    return {
      mainContent: data.post_text || "No se pudo generar el contenido.",
      hashtags: data.hashtags || [],
    };
  }
}
