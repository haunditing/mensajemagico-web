// services/social/types.ts

// Describe la entrada de datos que necesita cualquier plataforma
export interface PostCreationPayload {
  theme: string;
  tone: string;
  intention: string; // "Generar Debate", "Contar una Historia", etc.
  contextWords?: string[];
  userContext: {
    planLevel: 'guest' | 'free' | 'premium' | 'premium_lite';
    location?: string;
    essenceProfile?: any; // Perfil de estilo del usuario
  };
}

// Describe la salida estructurada que esperamos
export interface StructuredPost {
  mainContent: string;
  hashtags?: string[];
  visualSuggestion?: string;
  callToAction?: string;
}

// Abstracción para una plataforma específica (Strategy Pattern)
export interface IPlatformStrategy {
  // Cada plataforma sabe cómo construir su propio prompt y parsear su respuesta
  buildPrompt(payload: PostCreationPayload): any; // El 'any' será el prompt específico para la API
  parseResponse(apiResponse: any): StructuredPost;
}

// Abstracción para el servicio principal que se comunica con la API
export interface IPostGenerationService {
  generate(strategy: IPlatformStrategy, payload: PostCreationPayload): Promise<StructuredPost>;
}
