import { IPlatformStrategy, PostCreationPayload, StructuredPost } from "../types";

export class EmailStrategy implements IPlatformStrategy {
  buildPrompt(payload: PostCreationPayload): any {
    const keywords = (payload.contextWords || []).join(', ') || 'none';
    const instructions = `
      AI CONTRACT: You are an email copywriter.
      GENERATION DATA:
      - Theme: ${payload.theme}
      - Tone: ${payload.tone}
      - Intention: ${payload.intention}
      - Keywords: ${keywords}
      OUTPUT: A JSON object with keys "subject", "body", and "cta".

      RULES:
      - "subject" should be short and compelling.
      - "body" should be clear, structured, and easy to scan.
      - "cta" should be a simple closing line.
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
        console.error("Error parsing API response for Email:", error);
        return { mainContent: apiResponse };
      }
    }

    const subject = data.subject ? `Subject: ${data.subject}\n\n` : "";

    return {
      mainContent: `${subject}${data.body || data.message || "Could not generate content."}`,
      callToAction: data.cta || "",
    };
  }
}
