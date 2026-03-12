import { IPlatformStrategy, PostCreationPayload, StructuredPost } from "../types";

export class WhatsAppStrategy implements IPlatformStrategy {
  buildPrompt(payload: PostCreationPayload): any {
    const keywords = (payload.contextWords || []).join(', ') || 'ninguna';
    const instructions = `
      CONTRATO DE IA: Tu rol es un experto en redacción conversacional para WhatsApp.
      DATOS PARA GENERAR:
      - Tema: ${payload.theme}
      - Tono: ${payload.tone}
      - Intención: ${payload.intention}
      - Palabras clave: ${keywords}
      OUTPUT: Un objeto JSON con las claves "message", "cta" y "followup_options".

      REGLAS:
      - "message": Debe sonar humano, cercano y natural para chat de WhatsApp.
      - Mantén el mensaje breve y fácil de enviar (máximo 4-6 líneas cortas).
      - Evita tono robótico y evita lenguaje demasiado corporativo.
      - "cta": una frase corta para invitar respuesta sin presión.
      - "followup_options": array con 2 sugerencias breves para continuar la conversación.

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

    if (typeof apiResponse === "string") {
      try {
        const cleanJson = apiResponse.replace(/```json|```/g, "").trim();
        data = JSON.parse(cleanJson);
      } catch (error) {
        console.error("Error parsing API response for WhatsApp:", error);
        return { mainContent: apiResponse };
      }
    }

    const followups = Array.isArray(data.followup_options)
      ? data.followup_options
          .filter((x: unknown) => typeof x === "string")
          .slice(0, 2)
      : [];

    const followupText =
      followups.length > 0
        ? `\n\nOpciones de seguimiento:\n- ${followups.join("\n- ")}`
        : "";

    return {
      mainContent: (data.message || "No se pudo generar el contenido.") + followupText,
      callToAction: data.cta || "",
    };
  }
}
