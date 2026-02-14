/**
 * Servicio de Seguridad de Contenido (v2.1)
 * Implementa un filtrado heurístico avanzado para detectar lenguaje ofensivo,
 * discriminatorio o inapropiado, con especial énfasis en regionalismos latinos.
 */

const BANNED_PATTERNS = [
  // Términos de alto impacto y variaciones regionales (Colombia/Latam)
  /\b(put[oa]s?|mierdas?|malparid[oa]s?|gonorreas?|pendej[oa]s?)\b/gi,
  /\b(hijo\s*de\s*puta|hijueputa|hpta|hdp)\b/gi,

  // Términos específicos solicitados (Argot Colombiano)
  /\b(mondas?|caremondas?|cachon(es|as?|azos?)?)\b/gi,

  // Términos de discriminación o peyorativos (Protección de Minorías y AdSense)
  /\b(maric[ao]n?|maric[ao]s|marikon|gay|homosexual|mariconas?|maricuecas?|locas?)\b/gi,
  /\b(nazi|fag|tranny|kike|sudaca|machirulo)\b/gi,

  // Términos sexuales y de violencia
  /\b(vergas?|chingad[oa]|cul[oa]s?|zorras?|estupid[oa]s?|imbecil|estupidez)\b/gi,
  /\b(asesinar|matar|violacion|acos[oa]|golpear|suicidio)\b/gi,
];

/**
 * Valida si un texto contiene palabras prohibidas.
 * Se eliminan acentos comunes antes de validar para evitar evasiones simples.
 */
export const containsOffensiveWords = (text: string): boolean => {
  if (!text) return false;

  // Normalización: quitar acentos, pasar a minúsculas y limpiar caracteres especiales repetidos
  const normalizedText = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar tildes
    .replace(/([^a-zA-Z0-9\s])/g, " $1 "); // Aislar puntuación para que \b funcione mejor

  return BANNED_PATTERNS.some((pattern) => pattern.test(normalizedText));
};

export const SAFETY_ERROR_MESSAGE =
  "Sentimos una energía densa en esas palabras. Para que la magia fluya y conecte, te invitamos a reformularlo desde el respeto y la calma.";
