
/**
 * Abstracción genérica para servicios de IA.
 * Sigue el principio de Inversión de Dependencias (DIP).
 */

export interface AIRequestOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
}

export interface AIServiceProvider {
  id: string;
  generateText(options: AIRequestOptions): Promise<AIResponse>;
}
