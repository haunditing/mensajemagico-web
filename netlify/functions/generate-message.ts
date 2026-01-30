import type { Handler } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

/* =========================
   CONFIGURACIÓN SEGURA
   ========================= */

// Variables de entorno (autoridad)
const API_KEY = process.env.AI_API_KEY || "";
const MODEL_NAME = process.env.AI_MODEL || "gemini-2.5-flash";
const ENV_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS || 260);
const ENV_TEMPERATURE = Number(process.env.AI_TEMP || 0.7);

// Límites de seguridad (hard limits)
const MIN_SAFE_TOKENS = 220;
const MIN_TEMP = 0.2;
const MAX_TEMP = 0.95;

/* =========================
   HANDLER
   ========================= */

export const handler: Handler = async (event) => {
  // Método permitido
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // Validación API key
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key no configurada" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const { prompt, systemInstruction, temperature, maxOutputTokens } = body;

    // Validación prompt
    if (!prompt || typeof prompt !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt inválido" }),
      };
    }

    /* =========================
       NORMALIZACIÓN SEGURA
       ========================= */

    // --- TOKENS ---
    const requestedTokens = Number(maxOutputTokens) || 0;

    const safeMaxTokens = Math.min(
      ENV_MAX_TOKENS,
      Math.max(requestedTokens, MIN_SAFE_TOKENS),
    );

    // --- TEMPERATURA ---
    const requestedTemp = Number(temperature);

    const safeTemperature = Number.isFinite(requestedTemp)
      ? Math.min(MAX_TEMP, Math.max(MIN_TEMP, requestedTemp))
      : ENV_TEMPERATURE;

    /* =========================
       PROMPT FINAL
       ========================= */

    const finalPrompt = systemInstruction
      ? `${systemInstruction}\n\n${prompt}`
      : prompt;

    /* =========================
       GENERACIÓN
       ========================= */
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [{ text: finalPrompt }],
        },
      ],
      config: {
        temperature: safeTemperature,
        maxOutputTokens: safeMaxTokens,
      },
    });

    const text = response.text?.trim();

    return {
      statusCode: 200,
      body: JSON.stringify({
        text: text || "No se pudo generar el mensaje en este momento.",
      }),
    };
  } catch (error) {
    console.error("Gemini error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error al generar el mensaje con IA",
      }),
    };
  }
};
