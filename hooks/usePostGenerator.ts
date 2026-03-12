// hooks/usePostGenerator.ts
import { useState, useCallback } from "react";
import { PostCreationPayload, StructuredPost } from "../services/social/types";
import { PostGenerationService } from "../services/social/PostGenerationService";
import { InstagramStrategy } from "../services/social/strategies/InstagramStrategy";
import { TwitterStrategy } from "../services/social/strategies/TwitterStrategy";
import { LinkedInStrategy } from "../services/social/strategies/LinkedInStrategy";
import { WhatsAppStrategy } from "../services/social/strategies/WhatsAppStrategy";
import { FacebookStrategy } from "../services/social/strategies/FacebookStrategy";
import { TelegramStrategy } from "../services/social/strategies/TelegramStrategy";

// Inyección de dependencias: Instanciamos el servicio una sola vez.
// Esto podría moverse a un contexto de React para una gestión más avanzada.
const postService = new PostGenerationService();

export type SupportedPlatform =
  | 'whatsapp'
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'facebook'
  | 'telegram';

export const usePostGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<StructuredPost | null>(null);

  const generatePost = useCallback(async (platform: SupportedPlatform, payload: PostCreationPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setPost(null);

    // Factory Pattern para seleccionar la estrategia adecuada en tiempo de ejecución
    let strategy;
    switch (platform) {
      case 'instagram':
        strategy = new InstagramStrategy();
        break;
      case 'twitter':
        strategy = new TwitterStrategy();
        break;
      case 'linkedin':
        strategy = new LinkedInStrategy();
        break;
      case 'facebook':
        strategy = new FacebookStrategy();
        break;
      case 'telegram':
        strategy = new TelegramStrategy();
        break;
      case 'whatsapp':
        strategy = new WhatsAppStrategy();
        break;
      default:
        // Esto previene que se compile si pasamos una plataforma no soportada
        const exhaustiveCheck: never = platform;
        throw new Error(`Plataforma no soportada: ${exhaustiveCheck}`);
    }
    
    try {
      // Delegamos TODA la lógica de generación al servicio.
      // El hook no sabe cómo se construye el prompt ni cómo se parsea la respuesta.
      const result = await postService.generate(strategy, payload);
      setPost(result);
      return true;
    } catch (e: any) {
      setError(e.message);
      console.error("Failed to generate post:", e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []); // El array de dependencias está vacío gracias a `useCallback` y la inyección de dependencias.

  const clearPost = useCallback(() => {
    setPost(null);
    setError(null);
  }, []);

  return { isLoading, error, post, generatePost, clearPost };
};
