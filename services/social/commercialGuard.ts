/**
 * commercialGuard.ts
 *
 * Guardian layer para el PostGenerator.
 * Detecta si el usuario intenta generar una campaña publicitaria comercial
 * en lugar de un pensamiento / contenido orgánico para redes sociales.
 *
 * Diseño deliberado:
 * - Solo análisis de texto cliente-side (sin API call extra).
 * - Dos niveles de confianza: "high" bloquea el flujo, "medium" advierte.
 * - Falsos positivos manejados con opción de "Continuar de todos modos".
 */

export type CommercialConfidence = 'high' | 'medium';

export interface CommercialGuardResult {
  isCommercial: boolean;
  confidence: CommercialConfidence;
  /** Fragmentos del texto del usuario que activaron la detección */
  matchedSignals: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Patrones de ALTA confianza — intención comercial/publicitaria inequívoca
// ─────────────────────────────────────────────────────────────────────────────
const HIGH_CONFIDENCE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bcampa[ñn]a\s+(para|de|del?)\s+(mi|nuestro|tu|su|el|la|los|nuestros?|tus)/i, label: 'campaña para marca/empresa' },
  { pattern: /campa[ñn]a\s+(publicitaria|de\s+marketing|de\s+publicidad|comercial|de\s+ventas|ads|digital)/i, label: 'campaña publicitaria' },
  { pattern: /anuncio\s+(publicitario|comercial|de\s+venta)/i, label: 'anuncio publicitario' },
  { pattern: /\bad\s+copy\b/i, label: 'ad copy' },
  { pattern: /generar\s+(leads?|clientes\s+potenciales|prospectos|ventas)/i, label: 'generación de leads' },
  { pattern: /conseguir\s+(m[aá]s\s+)?clientes/i, label: 'conseguir clientes' },
  { pattern: /atraer\s+(m[aá]s\s+)?clientes/i, label: 'atraer clientes' },
  { pattern: /lanzar?\s+(mi\s+)?(nuevo\s+)?(producto|servicio|marca)/i, label: 'lanzamiento de producto' },
  { pattern: /publicidad\s+(para|de|sobre)\s+(mi|el|la|los|las|nuestro|nuestra)/i, label: 'publicidad de marca' },
  { pattern: /hacer\s+publicidad\b/i, label: 'hacer publicidad' },
  { pattern: /\bstrategy\s+de\s+(ventas|marketing|publicidad)\b/i, label: 'estrategia de ventas' },
  { pattern: /estrategia\s+de\s+(ventas|publicidad|marketing)\b/i, label: 'estrategia de ventas' },
  { pattern: /promocionar\s+(mi|el|la|los|nuestro)\b/i, label: 'promocionar producto' },
  { pattern: /\bvender\s+m[aá]s\b/i, label: 'vender más' },
  { pattern: /descuento\s+(de\s+)?\d+\s*%/i, label: 'descuento porcentual' },
  { pattern: /oferta\s+(de\s+)?lanzamiento/i, label: 'oferta de lanzamiento' },
  { pattern: /\bblack\s+friday\b/i, label: 'Black Friday' },
  { pattern: /\bcyber\s+(monday|lunes)\b/i, label: 'Cyber Monday' },
  { pattern: /tasa\s+de\s+conversi[oó]n/i, label: 'tasa de conversión' },
  { pattern: /embudo\s+de\s+ventas/i, label: 'embudo de ventas' },
  { pattern: /retorno\s+(de\s+)?inversi[oó]n\b/i, label: 'retorno de inversión' },
  { pattern: /\broi\b/i, label: 'ROI' },
  { pattern: /\bcta\s+(comercial|de\s+venta)\b/i, label: 'CTA comercial' },
  { pattern: /\bfunnel\s+de\s+ventas\b/i, label: 'funnel de ventas' },
  { pattern: /\bpago\s+(por\s+)?clic\b/i, label: 'pago por clic (PPC)' },
  { pattern: /\bppc\b/i, label: 'PPC' },
  { pattern: /\bseo\s+(para\s+vender|comercial)\b/i, label: 'SEO comercial' },
  { pattern: /anunciarse\s+en\b/i, label: 'anunciarse en plataforma' },
  { pattern: /pauta\s+(publicitaria|en\s+(facebook|instagram|google))/i, label: 'pauta publicitaria' },
  { pattern: /\bads?\s+(de\s+)?(facebook|instagram|google|tiktok|linkedin)\b/i, label: 'ads pagos' },
  { pattern: /boost\s+(post|publicaci[oó]n)/i, label: 'boost de publicación' },
  { pattern: /invertir\s+(en\s+)?publicidad/i, label: 'inversión en publicidad' },
  { pattern: /presupuesto\s+(de\s+)?(marketing|publicidad|ads)/i, label: 'presupuesto publicitario' },
  { pattern: /plan\s+de\s+(marketing|medios|publicidad)/i, label: 'plan de marketing' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Patrones de MEDIA confianza — pueden ser comerciales pero también contenido orgánico
// ─────────────────────────────────────────────────────────────────────────────
const MEDIUM_CONFIDENCE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(para|en)\s+(mi|nuestro|tu|su|nuestros?|tus?|la)\s+(negocio|empresa|marca|tienda|producto|servicio|compañía)\b/i, label: 'contenido para negocio propio' },
  { pattern: /mi\s+(producto|servicio|tienda|empresa|marca)\b/i, label: 'referencia a producto/empresa propio' },
  { pattern: /nuestro[sa]?\s+(producto|servicio|negocio|empresa|marca)\b/i, label: 'referencia corporativa' },
  { pattern: /lanzamiento\s+de\b/i, label: 'lanzamiento' },
  { pattern: /promoci[oó]n\s+(especial|exclusiva|de)\b/i, label: 'promoción especial' },
  { pattern: /(nueva?\s+colección|nuevo\s+menú|nueva\s+sucursal)\b/i, label: 'apertura/colección nueva' },
  { pattern: /\boferta\s+(especial|exclusiva|relámpago|flash)\b/i, label: 'oferta especial' },
  { pattern: /compra\s+(ya|ahora|hoy)\b/i, label: 'llamado a compra' },
  { pattern: /visita\s+(nuestra?\s+)?(tienda|página|web|sitio)\b/i, label: 'visitar tienda/web' },
  { pattern: /link\s+en\s+(la\s+)?bio/i, label: 'link en bio' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Función principal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analiza el texto del tema (y opcionalmente del tono/intención) para
 * determinar si el usuario intenta crear contenido con propósito comercial/publicitario.
 */
export function checkCommercialIntent(
  theme: string,
  intention?: string,
): CommercialGuardResult {
  const input = [theme, intention].filter(Boolean).join(' ');

  const highSignals: string[] = [];
  const mediumSignals: string[] = [];

  for (const { pattern, label } of HIGH_CONFIDENCE_PATTERNS) {
    if (pattern.test(input)) {
      highSignals.push(label);
    }
  }

  for (const { pattern, label } of MEDIUM_CONFIDENCE_PATTERNS) {
    if (pattern.test(input)) {
      mediumSignals.push(label);
    }
  }

  if (highSignals.length >= 1) {
    return { isCommercial: true, confidence: 'high', matchedSignals: highSignals };
  }

  // 2+ señales medias también constituyen indicio razonable
  if (mediumSignals.length >= 2) {
    return { isCommercial: true, confidence: 'medium', matchedSignals: mediumSignals };
  }

  return { isCommercial: false, confidence: 'medium', matchedSignals: [] };
}
