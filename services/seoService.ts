
import { Occasion, Relationship } from '../types';
import { CONFIG } from '../config';

/**
 * Servicio SEO Avanzado.
 * Actualiza meta-tags dinámicamente para maximizar el tráfico orgánico.
 */
export const updateSeoTags = (occasion?: Occasion, relationship?: Relationship) => {
  const baseTitle = CONFIG.SEO.BASE_TITLE;
  
  let title = occasion ? occasion.metaTitle : `Generador de Mensajes e Inspiración IA - ${baseTitle}`;
  let description = occasion ? occasion.metaDesc : CONFIG.SEO.DEFAULT_DESC;

  // Optimización de Long-Tail SEO para relaciones específicas
  if (occasion && relationship) {
    const relLabel = relationship.label.toLowerCase();
    title = `Mensajes de ${occasion.name} para mi ${relationship.label} - ${baseTitle}`;
    description = `¿Necesitas ideas para ${occasion.name}? Genera frases únicas para tu ${relLabel} con nuestra inteligencia artificial. ¡Listas para copiar y enviar!`;
  }

  // Actualización del DOM
  document.title = title.substring(0, 65);
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', description.substring(0, 160));
  }

  // Open Graph dinámico para compartir en redes
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);
  
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);
};
