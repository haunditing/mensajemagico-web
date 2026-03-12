import { IPlatformStrategy, PostCreationPayload, StructuredPost } from "../types";

export class TelegramStrategy implements IPlatformStrategy {
  buildPrompt(payload: PostCreationPayload): any {
    const keywords = (payload.contextWords || []).join(', ') || 'none';
    const instructions = `
      AI CONTRACT: You are a messaging copywriter creating a Telegram channel post.
      GENERATION DATA:
      - Theme: ${payload.theme}
      - Tone: ${payload.tone}
      - Intention: ${payload.intention}
      - Keywords: ${keywords}
      OUTPUT: A JSON object with keys "message", "hashtags", and "cta".

      RULES:
      - "message" should be concise, clear, and channel-friendly.
      - Use line breaks when needed for readability.
      - "hashtags" should be an array with 2 to 5 tags.
      - "cta" should be short and action oriented.
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
        console.error("Error parsing API response for Telegram:", error);
        return { mainContent: apiResponse };
      }
    }

    return {
      mainContent: data.message || data.post_text || "Could not generate content.",
      hashtags: data.hashtags || [],
      callToAction: data.cta || "",
    };
  }
}
