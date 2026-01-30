
import { SharePlatform } from '../types';

export interface ShareOptions {
  text: string;
  title?: string;
}

/**
 * Verifica si la API nativa de compartir está disponible.
 */
export const isNativeShareSupported = (): boolean => {
  return typeof navigator !== 'undefined' && !!navigator.share;
};

/**
 * Ejecuta la compartición nativa.
 */
export const shareNative = async (options: ShareOptions): Promise<boolean> => {
  if (isNativeShareSupported()) {
    try {
      await navigator.share({
        title: options.title || 'MensajeMágico',
        text: options.text,
      });
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
};

/**
 * Lógica para copiar al portapapeles con fallback.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback para navegadores antiguos
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Ejecuta la acción de compartir según plataforma.
 */
export const executeShare = async (platform: SharePlatform, text: string): Promise<void> => {
  const encodedText = encodeURIComponent(text);
  const currentUrl = encodeURIComponent(window.location.href);

  switch (platform) {
    case SharePlatform.NATIVE:
      await shareNative({ text });
      break;
    
    case SharePlatform.COPY:
      await copyToClipboard(text);
      break;

    case SharePlatform.WHATSAPP:
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
      break;

    case SharePlatform.TELEGRAM:
      window.open(`https://t.me/share/url?url=&text=${encodedText}`, '_blank');
      break;

    case SharePlatform.FACEBOOK:
      // Facebook prefiere una URL para el sharer, pero usamos el quote para el texto
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${encodedText}`, '_blank');
      break;

    case SharePlatform.X:
      window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
      break;

    case SharePlatform.EMAIL:
      window.location.href = `mailto:?body=${encodedText}`;
      break;

    case SharePlatform.SMS:
      window.location.href = `sms:?body=${encodedText}`;
      break;

    case SharePlatform.INSTAGRAM:
      // Instagram no tiene API de texto directo. 
      // Copiamos y avisamos al usuario o abrimos la app.
      await copyToClipboard(text);
      alert("¡Texto copiado! Ahora puedes pegarlo en tus Historias o Reels de Instagram.");
      window.open('instagram://library', '_blank');
      break;
  }
};
