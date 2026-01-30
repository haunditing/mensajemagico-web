
import { AIServiceProvider } from "./types";
import { GeminiProvider } from "./geminiProvider";
import { CONFIG } from "../../config";

/**
 * Gestor de proveedores. Permite cambiar el motor de IA
 * centralizando la configuración en un solo punto.
 */
class AIFactory {
  private currentProvider: AIServiceProvider | null = null;

  /**
   * Obtiene el proveedor actual o lo inicializa si no existe.
   * Usamos inicialización perezosa para asegurar que process.env.API_KEY esté disponible.
   */
  getProvider(): AIServiceProvider {
    if (!this.currentProvider) {
      const apiKey = process.env.API_KEY || "";
      // Ahora consume el modelo desde el CONFIG centralizado
      this.currentProvider = new GeminiProvider(apiKey, CONFIG.AI.MODEL);
    }
    return this.currentProvider;
  }

  /**
   * Permite cambiar el proveedor en tiempo de ejecución
   */
  setProvider(provider: AIServiceProvider) {
    this.currentProvider = provider;
  }
}

export const aiFactory = new AIFactory();
