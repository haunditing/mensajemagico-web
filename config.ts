/**
 * Hub Central de Configuración - MensajeMágico
 */

const getEnv = (key: string, defaultValue: any) => {
  // En Vite, usamos import.meta.env en lugar de process.env
  // @ts-ignore
  const value = import.meta.env[`VITE_${key}`] || import.meta.env[key];
  if (value === undefined || value === "") return defaultValue;
  return value;
};

const isTruthy = (val: any): boolean => {
  if (val === undefined || val === null) return false;
  const s = String(val).toLowerCase().trim();
  return s === "true" || s === "1" || s === "yes" || s === "on";
};

const isValentineSeason = () => {
  const now = new Date();
  // Febrero es el mes 1 (0-indexado). Se activa del 7 al 14.
  return now.getMonth() === 1 && now.getDate() >= 7 && now.getDate() <= 14;
};

export const CONFIG = {
  // --- CONFIGURACIÓN DE IA ---
  AI: {
    MODEL: getEnv("AI_MODEL", "gemini-2.5-flash"),
    TEMPERATURE: Number(getEnv("AI_TEMP", 0.7)),
    MAX_TOKENS: Number(getEnv("AI_MAX_TOKENS", 300)),
  },

  // --- MONETIZACIÓN (GOOGLE ADSENSE) ---
  ADSENSE: {
    IS_ACTIVE:
      isTruthy(getEnv("ADSENSE_ACTIVE", "false")) ||
      window.location.search.includes("ads=true"),
    CLIENT_ID: getEnv("ADSENSE_CLIENT_ID", "ca-pub-0000000000000000"),
    DEBUG_MODE:
      // @ts-ignore
      import.meta.env.DEV || window.location.search.includes("debug=true"),
    SLOTS: {
      TOP: getEnv("ADS_SLOT_TOP", "0000000001"),
      MIDDLE: getEnv("ADS_SLOT_MIDDLE", "0000000002"),
      BOTTOM: getEnv("ADS_SLOT_BOTTOM", "0000000003"),
    },
  },

  // --- LÍMITES DE USO ---
  USAGE: {
    SESSION_LIMIT: Number(getEnv("LIMIT_SESSION", 5)),
    DAILY_LIMIT: Number(getEnv("LIMIT_DAILY", 20)),
    MIN_INTERVAL_MS: Number(getEnv("MIN_INTERVAL", 3000)),
    MAX_CONTEXT_WORDS: Number(getEnv("MAX_CONTEXT_WORDS", 3)),
  },

  // --- SEO Y BRANDING ---
  SEO: {
    BASE_TITLE: getEnv("SEO_BASE_TITLE", "MensajeMágico"),
    DEFAULT_DESC: getEnv(
      "SEO_DEFAULT_DESC",
      "IA generadora de cartas e inspiración para momentos especiales.",
    ),
  },

  // --- TEMAS Y APARIENCIA ---
  THEME: {
    IS_VALENTINE: isTruthy(getEnv("VALENTINE_THEME", isValentineSeason())),
  },

  // --- MÉTRICAS ---
  METRICS: {
    GLOBAL_ESTIMATE_FACTOR: Number(getEnv("METRICS_FACTOR", 0.08)),
    REFRESH_RATE_MS: Number(getEnv("METRICS_REFRESH", 30000)),
  },
};
