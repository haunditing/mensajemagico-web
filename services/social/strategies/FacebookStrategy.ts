import { IPlatformStrategy, PostCreationPayload, StructuredPost } from "../types";

export class FacebookStrategy implements IPlatformStrategy {
  buildPrompt(payload: PostCreationPayload): any {
    const keywords = (payload.contextWords || []).join(', ') || 'none';
    const instructions = `
      AI CONTRACT: You are a social media writer creating a Facebook post.
      GENERATION DATA:
      - Theme: ${payload.theme}
      - Tone: ${payload.tone}
      - Intention: ${payload.intention}
      - Keywords: ${keywords}
      OUTPUT: A JSON object with keys "post_text", "hashtags", and "cta".

      RULES:
      - "post_text" should feel human and easy to read.
      - Use short paragraphs and a clear opening hook.
      - "hashtags" should be an array with 3 to 6 relevant tags.
      - "cta" should invite comments aligned to the intention above.
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
        console.error("Error parsing API response for Facebook:", error);
        return { mainContent: apiResponse };
      }
    }

    return {
      mainContent: data.post_text || data.message || "Could not generate content.",
      hashtags: data.hashtags || [],
      callToAction: data.cta || "",
    };
  }
}
