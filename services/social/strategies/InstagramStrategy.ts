// services/social/strategies/InstagramStrategy.ts
import { IPlatformStrategy, PostCreationPayload, StructuredPost } from "../types";

const INSTAGRAM_MAX_HASHTAGS = 8;

const extractFirstJsonObject = (raw: string): string | null => {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = raw.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < raw.length; i += 1) {
    const ch = raw[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return raw.slice(start, i + 1);
    }
  }

  return null;
};

const normalizeHashtagKey = (tag: string): string =>
  tag
    .trim()
    .replace(/^#/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");

const sanitizeHashtags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of tags) {
    if (typeof item !== "string") continue;

    const cleaned = item.trim();
    if (!cleaned) continue;

    const withHash = cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
    const key = normalizeHashtagKey(withHash);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    result.push(withHash);
  }

  return result;
};

const prioritizeHashtags = (tags: string[], caption: string): string[] => {
  if (tags.length === 0) return [];

  const normalizedCaption = caption
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return tags
    .map((tag, index) => {
      const key = normalizeHashtagKey(tag).replace(/_/g, " ");
      const relevance = key && normalizedCaption.includes(key) ? 1 : 0;
      return { tag, index, relevance };
    })
    .sort((a, b) => {
      if (b.relevance !== a.relevance) return b.relevance - a.relevance;
      return a.index - b.index;
    })
    .map((item) => item.tag);
};

export class InstagramStrategy implements IPlatformStrategy {
  buildPrompt(payload: PostCreationPayload): any {
    // Aquí se concentra la "inteligencia" para Instagram.
    // Creamos una instrucción detallada para el modelo de IA.
    const keywords = (payload.contextWords || []).join(', ') || 'ninguna';
    const instructions = `
      CONTRATO DE IA: Tu rol es un experto en redes sociales creando un post para Instagram.
      DATOS PARA GENERAR:
      - Tema: ${payload.theme}
      - Tono: ${payload.tone}
      - Intención: ${payload.intention}
      - Palabras clave: ${keywords}
      OUTPUT: Un objeto JSON con las claves "caption", "hashtags", "visual_idea", y "cta".

      REGLAS:
      - El "caption" debe ser visual, emotivo y usar emojis de forma natural. Debe tener saltos de línea para facilitar la lectura.
      - Los "hashtags" deben ser un array de strings, mezclando algunos populares con otros de nicho sobre el tema. Entre 5 y 10 hashtags.
      - La "visual_idea" debe ser una descripción concisa de una imagen o video que acompañaría al post.
      - El "cta" (Call to Action) debe ser una pregunta o frase que invite a la interacción, alineada con la intención: "${payload.intention}".
      - Responde unicamente con JSON valido. No agregues texto antes o despues.
      - No uses bloques markdown como \`\`\`json.

      No incluyas nada más en tu respuesta que no sea el objeto JSON.
    `;
    
    // Devolvemos la estructura que espera nuestro `geminiService`
    return {
      instructions,
      theme: payload.theme,
      tone: payload.tone,
      contextWords: payload.contextWords,
      // Aquí podríamos añadir más campos si el `geminiService` los soporta
    };
  }

  parseResponse(apiResponse: any): StructuredPost {
    // Esta función es el punto de entrada para la respuesta de la API.
    // Su única responsabilidad es parsear la respuesta y devolver nuestro objeto de dominio.
    // Así, si la API cambia su formato, solo tocamos este lugar.

    // Primero, intentamos parsear si la respuesta es un string JSON
    let data = apiResponse;
    if (typeof apiResponse === 'string') {
      const normalized = apiResponse.trim();

      try {
        data = JSON.parse(normalized);
      } catch (error) {
        try {
          const extracted = extractFirstJsonObject(normalized);
          if (!extracted) throw new Error("No JSON object found");
          data = JSON.parse(extracted);
        } catch (fallbackError) {
          console.error("Error parsing Instagram response:", fallbackError);
          return {
            mainContent: normalized,
            hashtags: [],
            visualSuggestion: "No se pudo generar sugerencia.",
            callToAction: "",
          };
        }
      }
    }
    
    // Mapeamos los campos del objeto de la API a nuestro objeto `StructuredPost`
    const caption = data.caption || "No se pudo generar el contenido.";
    const cleanHashtags = sanitizeHashtags(data.hashtags);
    const rankedHashtags = prioritizeHashtags(cleanHashtags, caption).slice(
      0,
      INSTAGRAM_MAX_HASHTAGS,
    );

    return {
      mainContent: caption,
      hashtags: rankedHashtags,
      visualSuggestion: data.visual_idea || "",
      callToAction: data.cta || "",
    };
  }
}
