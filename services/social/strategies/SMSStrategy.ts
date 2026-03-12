import { IPlatformStrategy, PostCreationPayload, StructuredPost } from "../types";

export class SMSStrategy implements IPlatformStrategy {
  buildPrompt(payload: PostCreationPayload): any {
    const keywords = (payload.contextWords || []).join(', ') || 'none';
    const instructions = `
      AI CONTRACT: You are writing an SMS message.
      GENERATION DATA:
      - Theme: ${payload.theme}
      - Tone: ${payload.tone}
      - Intention: ${payload.intention}
      - Keywords: ${keywords}
      OUTPUT: A JSON object with keys "message" and "cta".

      RULES:
      - "message" must be short and natural (ideally 160 chars or less).
      - Avoid hashtags and avoid long paragraphs.
      - "cta" should be optional and very short.
      - Return only JSON.
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
        console.error("Error parsing API response for SMS:", error);
        return { mainContent: apiResponse };
      }
    }

    return {
      mainContent: data.message || "Could not generate content.",
      callToAction: data.cta || "",
    };
  }
}
