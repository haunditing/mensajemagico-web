
import { GoogleGenAI } from "@google/genai";
import { AIServiceProvider, AIRequestOptions, AIResponse } from "./types";
import { CONFIG } from "../../config";

export class GeminiProvider implements AIServiceProvider {
  readonly id = "google-gemini";
  
  constructor(private apiKey: string, private modelName: string = CONFIG.AI.MODEL) {}

  async generateText(options: AIRequestOptions): Promise<AIResponse> {
    // REGLA CRÍTICA: Uso directo de process.env.API_KEY según directrices del SDK
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined") {
      console.warn("[GeminiProvider] API_KEY no configurada en el entorno.");
      throw new Error("Configuración de IA pendiente. Por favor, revisa tus variables de entorno.");
    }

    // Inicialización siguiendo el estándar estricto
    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: options.prompt,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature ?? CONFIG.AI.TEMPERATURE,
          maxOutputTokens: options.maxTokens ?? CONFIG.AI.MAX_TOKENS,
          topP: options.topP ?? 0.8,
          // Deshabilitamos thinking por defecto para priorizar latencia en mensajes cortos
          thinkingConfig: { thinkingBudget: 0 }
        },
      });

      const generatedText = response.text;
      if (!generatedText) {
        throw new Error("El modelo devolvió una respuesta vacía.");
      }

      return {
        text: generatedText.trim(),
        provider: this.id,
        model: this.modelName
      };
    } catch (error: any) {
      console.error(`[Gemini Error - Model: ${this.modelName}]:`, error);
      throw new Error("No pudimos conectar con la IA. Reintenta en unos segundos.");
    }
  }
}
