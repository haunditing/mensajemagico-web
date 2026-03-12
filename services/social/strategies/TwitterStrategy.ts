// services/social/strategies/TwitterStrategy.ts
import { IPlatformStrategy, PostCreationPayload, StructuredPost } from "../types";

export class TwitterStrategy implements IPlatformStrategy {
  buildPrompt(payload: PostCreationPayload): any {
    const keywords = (payload.contextWords || []).join(', ') || 'ninguna';
    const instructions = `
      CONTRATO DE IA: Tu rol es un experto en redes sociales creando contenido para Twitter/X.
      DATOS PARA GENERAR:
      - Tema: ${payload.theme}
      - Tono: ${payload.tone}
      - Intención: ${payload.intention}
      - Palabras clave: ${keywords}
      OUTPUT: Un objeto JSON con las claves "thread" (un array de strings, donde cada string es un tweet).

      REGLAS:
      - Crea un hilo de 2 a 4 tweets.
      - El primer tweet debe ser un "gancho" potente para captar la atención.
      - Cada tweet debe ser conciso y no superar los 280 caracteres.
      - El último tweet debe contener el Call to Action (CTA).
      - Puedes usar hashtags relevantes dentro de los tweets.

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
        console.error("Error parsing API response for Twitter:", error);
        return { mainContent: apiResponse };
      }
    }
    
    // Para Twitter, unimos el hilo en un solo texto con separadores para la UI.
    const threadContent = (data.thread || []).join('\n\n---\n\n');

    return {
      mainContent: threadContent || "No se pudo generar el contenido.",
      // Twitter no tiene un concepto separado de hashtags o visuales en este formato
    };
  }
}
