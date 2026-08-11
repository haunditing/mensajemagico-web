// Parsing de las respuestas de la IA en streaming.
// El backend devuelve SOLO el texto del mensaje (texto plano). Este módulo
// limpia la salida y evita mostrar estructura técnica (JSON) al usuario.

export const TECHNICAL_ERROR_FALLBACK =
  "Lo siento, hubo un pequeño error técnico al procesar el mensaje. Por favor intenta de nuevo.";

export interface ParsedGeneration {
  content: string | null;
}

// Detecta salida que parece estructura técnica (JSON/markdown) en lugar de
// texto legible, p.ej. si el modelo responde con JSON puro sin mensaje.
const looksTechnical = (text: string): boolean =>
  /^(?:\s|\u00A0)*(?:[\[{])/.test(text) ||
  /\b(generated_messages|guardian_insight|selected_strategy)\b/.test(text) ||
  /```/.test(text);

// Extrae el contenido legible de la respuesta cruda.
export const parseGeneration = (raw: string): ParsedGeneration => {
  const trimmed = (raw || "").trim();
  if (!trimmed || looksTechnical(trimmed)) return { content: null };
  return { content: trimmed };
};

// Contenido a mostrar mientras se recibe el stream (efecto de escritura).
export const getStreamDisplay = (raw: string): string => {
  const { content } = parseGeneration(raw);
  return content || "Escribiendo...";
};

// Contenido final: nunca muestra estructura técnica al usuario.
export const getFinalContent = (
  raw: string,
  fallback: string = TECHNICAL_ERROR_FALLBACK,
): string => {
  const { content } = parseGeneration(raw);
  return content || fallback;
};
