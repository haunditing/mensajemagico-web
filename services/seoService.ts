import { Occasion, Relationship } from '../types';
import { CONFIG } from '../config';

/**
 * Servicio SEO Avanzado.
 * Actualiza meta-tags dinámicamente para maximizar el tráfico orgánico.
 */
const SITE_URL = "https://mensajemagico.com";

const setMeta = (selector: string, attr: string, value: string, createTag = false) => {
  let tag = document.querySelector(selector) as HTMLMetaElement | null;
  if (!tag && createTag) {
    tag = document.createElement("meta");
    const attrName = selector.match(/property="([^"]+)"/)?.[1];
    const name = selector.match(/name="([^"]+)"/)?.[1];
    if (attrName) tag.setAttribute("property", attrName);
    if (name) tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  if (tag) tag.setAttribute(attr, value);
};

const setCanonical = (pathname: string) => {
  const url = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;
  setMeta("meta[property='og:url']", "content", url);
  setMeta('meta[name="twitter:url"]', "content", url);
  const canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (canonical) canonical.href = url;
};

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
  const finalTitle = title.substring(0, 65);
  const finalDesc = description.substring(0, 160);
  document.title = finalTitle;

  setMeta('meta[name="description"]', "content", finalDesc, true);
  setMeta("meta[property='og:title']", "content", finalTitle, true);
  setMeta("meta[property='og:description']", "content", finalDesc, true);
  setMeta('meta[name="twitter:title"]', "content", finalTitle, true);
  setMeta('meta[name="twitter:description"]', "content", finalDesc, true);

  setCanonical(window.location.pathname);
};
