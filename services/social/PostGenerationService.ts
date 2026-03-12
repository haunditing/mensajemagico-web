// services/social/PostGenerationService.ts
import { generateMessageStream } from "../geminiService";
import { MessageConfig, Tone } from "../../types";
import { IPlatformStrategy, IPostGenerationService, PostCreationPayload, StructuredPost } from "./types";

const mapToTone = (rawTone?: string): Tone => {
  const normalized = (rawTone || "").toLowerCase();

  if (normalized.includes("formal") || normalized.includes("profes")) return Tone.FORMAL;
  if (normalized.includes("divert") || normalized.includes("humor")) return Tone.FUNNY;
  if (normalized.includes("romant") || normalized.includes("amor")) return Tone.ROMANTIC;
  if (normalized.includes("sutil")) return Tone.SUBTLE;
  if (normalized.includes("direct")) return Tone.DIRECT;
  if (normalized.includes("sarcas")) return Tone.SARCASTIC;
  if (normalized.includes("coquet")) return Tone.FLIRTY;
  if (normalized.includes("sincer")) return Tone.SINCERE;

  return Tone.PROFOUND;
};

export class PostGenerationService implements IPostGenerationService {
  
  // En un futuro, si geminiService fuera una clase, la inyectaríamos en el constructor
  // para mejorar el testing (Dependency Injection).
  // constructor(private apiService: IApiService) {}

  public async generate(strategy: IPlatformStrategy, payload: PostCreationPayload): Promise<StructuredPost> {
    // 1. Usa la estrategia para construir el prompt específico de la plataforma
    const prompt = strategy.buildPrompt(payload);

    try {
      // 2. Reusar el flujo real de generación para aplicar plan, límites y backend existentes.
      const messageConfig: MessageConfig = {
        occasion: "pensamiento",
        relationship: prompt.theme || payload.theme || "la vida",
        tone: mapToTone(prompt.tone || payload.tone),
        contextWords: prompt.contextWords || payload.contextWords || [],
        formatInstruction: prompt.instructions,
        intention: payload.intention,
      };

      const response = await generateMessageStream(messageConfig, () => {
        // No se renderiza streaming en esta capa; solo se consume el resultado final.
      });


      // 3. Usa la misma estrategia para parsear la respuesta específica de la plataforma
      const structuredPost = strategy.parseResponse(response.content);
      
      return structuredPost;

    } catch (error) {
      console.error("Error during post generation:", error);
      // En caso de error, devolvemos un objeto `StructuredPost` con el mensaje de error
      // para que la UI pueda mostrarlo de forma consistente.
      return {
        mainContent: `Lo sentimos, ha ocurrido un error al generar el post: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
