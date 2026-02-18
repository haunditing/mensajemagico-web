export interface GuardianPromptOptions {
  tone: string;
  selectedContact?: any;
  isPensamiento: boolean;
  isForPost: boolean;
  showGifts: boolean;
  country: string;
}

export interface GuardianPromptResult {
  styleInstructions: string;
  creativityLevel: string;
  avoidTopics: string;
  formatInstruction: string;
}

export const buildGuardianPrompt = ({
  tone,
  selectedContact,
  isPensamiento,
  isForPost,
  showGifts,
  country,
}: GuardianPromptOptions): GuardianPromptResult => {
  let styleInstructions = "";
  let creativityLevel = "balanced";
  let avoidTopics = "";

  // 1. Ajuste de Temperatura (Creatividad) basado en el tono
  const currentTone = tone as string;
  if (
    ["divertido", "coqueto", "alegre", "fresco", "funny", "flirty"].some((t) =>
      currentTone.toLowerCase().includes(t)
    )
  ) {
    creativityLevel = "high"; // Más arriesgado (0.9)
  } else if (
    ["sobrio", "directo", "formal", "fuerte", "direct", "sober"].some((t) =>
      currentTone.toLowerCase().includes(t)
    )
  ) {
    creativityLevel = "low"; // Más preciso (0.5)
  }

  // 2. Variación Gramatical (Trigger de Apertura Aleatorio)
  const openingTriggers = [
    "Opción A: Empezar con una pregunta para generar curiosidad.",
    "Opción B: Empezar con una exclamación o una afirmación emotiva.",
    "Opción C: Empezar con una observación sobre el presente inmediato (el ahora).",
  ];
  const selectedTrigger =
    openingTriggers[Math.floor(Math.random() * openingTriggers.length)];

  // 3. Análisis de Historial y Construcción del Prompt del Guardián
  const hasRealHistory =
    selectedContact &&
    selectedContact.history &&
    selectedContact.history.length > 0;

  if (hasRealHistory) {
    // FEW-SHOT PROMPTING: Extraer ejemplos reales del usuario
    // Priorizamos mensajes que fueron editados por el usuario (wasEdited: true) porque reflejan su voz real
    const userExamples = selectedContact.history
      .filter((h: any) => h.wasEdited || h.content) // Preferir editados, sino cualquiera
      .slice(-3)
      .map((h: any) => h.content || "");
    
    const examplesText = userExamples.map((msg: string) => `- "${msg}"`).join("\n");
    const fewShotInstruction = userExamples.length > 0 ? `\nEJEMPLOS DE MI ESTILO REAL (IMITA ESTA ESTRUCTURA Y LONGITUD):\n${examplesText}\n` : "";

    // Estrategia 1: Lista de Exclusión (Extraer palabras clave usadas)
    // Filtramos palabras de más de 4 letras para evitar conectores
    const allWords =
      userExamples
        .join(" ")
        .toLowerCase()
        .match(/[a-záéíóúñü]{5,}/g) || [];
    const uniqueKeywords = Array.from(new Set<string>(allWords))
      .slice(0, 15)
      .join(", ");
    avoidTopics = uniqueKeywords;

    // Estrategia 2: Nuevo Formato de Prompt de Contraste
    styleInstructions += `[Contexto para el Guardián:
      Estás escribiendo a ${selectedContact?.name || "Tu Contacto"} (Relación: ${
      selectedContact?.relationship || "Pareja"
    }).
      
      Historial Reciente (PARA EVITAR REPETICIÓN):
      En los últimos mensajes ya se mencionaron: '${uniqueKeywords}'.
      
      Misión: > Genera un nuevo mensaje en tono ${tone} pero PROHIBIDO usar las palabras del historial reciente. Busca un nuevo ángulo: quizás una emoción específica o un detalle del entorno sin usar clichés.
      
      Instrucción de Apertura: ${selectedTrigger}${fewShotInstruction}]`;
  } else {
    // Instrucción por defecto para nuevos contactos o sin historial
    styleInstructions += `[ESTILO: Sé espontáneo pero HONESTO. Evita saludos robóticos. ${selectedTrigger}
    IMPORTANTE: No tienes historial con esta persona. PROHIBIDO inventar recuerdos, decir "ayer", "la otra vez" o "me acordé". Habla solo del presente.]`;
  }

  // --- NUEVA LÓGICA PARA PENSAMIENTO (DEEP TALK / CONTENT) ---
  if (isPensamiento) {
    // 1. Filtro de Profundidad y Stop-List
    styleInstructions += ` [MODO PENSAMIENTO: DEEP TALK]
      PROHIBIDO: No uses clichés de clima ("sol radiante", "brisa"), ni invitaciones físicas ("vamos por un helado", "caminemos"), ni gastronomía ("raspao", "café").
      OBJETIVO: Generar valor, reflexión o conexión profunda. Estilo: "Internal Monologue / Storytelling".`;

    // 2. Estructura Hook -> Story -> Lesson
    styleInstructions += `
      ESTRUCTURA OBLIGATORIA:
      1. Hook (Gancho): Empieza con una verdad incómoda o una observación aguda.
      2. Observación (Análisis): Analiza el concepto de forma abstracta o filosófica. NO inventes historias personales ni anécdotas que no ocurrieron.
      3. Lesson (Cierre): Termina con una pregunta que invite a pensar o una conclusión potente.`;

    // 3. Niveles de Consciencia (según el tono/estado emocional)
    if (
      ["triste", "reflexivo", "soledad", "nostalgia"].includes(tone as string)
    ) {
      styleInstructions += ` ESTILO: "Poético-Existencial". Evita jerga callejera. Sé profundo y vulnerable.`;
    } else if (
      ["motivado", "feliz", "crecimiento"].includes(tone as string)
    ) {
      styleInstructions += ` ESTILO: "Manifiesto". Frases cortas, contundentes y energéticas (tipo Twitter/X).`;
    } else if (tone === "sarcastico") {
      styleInstructions += ` ESTILO: "Humor Ácido". Usa ironía fina, observaciones agudas y un toque de cinismo elegante.`;
    }

    // 4. Formato (Chat vs Post)
    if (isForPost) {
      styleInstructions += ` FORMATO: "Para Redes Sociales (Post)". NO incluyas saludos personales ni nombres. Escribe para una audiencia general. INCLUYE UN CALL TO ACTION AL FINAL (ej. "¿Te ha pasado?", "¿Qué opinas?").`;
    } else {
      styleInstructions += ` FORMATO: "Para Chat Privado". Mantén la intimidad de una conversación uno a uno.`;
    }
  }

  // Determinar si realmente pedimos regalos (Desactivar para Posts de Pensamiento)
  const shouldIncludeGifts = showGifts && !(isPensamiento && isForPost);

  // Inyectamos instrucción para formato JSON y regalos si está activo
  const currencyMap: Record<string, string> = {
    CO: "Pesos Colombianos",
    MX: "Pesos Mexicanos",
    AR: "Pesos Argentinos",
    CL: "Pesos Chilenos",
    PE: "Soles",
    UY: "Pesos Uruguayos",
    VE: "Bolívares",
  };
  const localCurrency = currencyMap[country] || "Dólares";
  const formatInstruction = `[SYSTEM: IMPORTANTE: Tu respuesta DEBE ser un JSON válido y MINIFICADO (sin espacios extra) con esta estructura: {
      "selected_strategy": "string",
      "generated_messages": [{ "tone": "string", "content": "string", "locked": boolean }],
      "guardian_insight": "string (${
        isPensamiento
          ? "Explica por qué esta reflexión es potente para un creador"
          : "Explica qué elemento nuevo usaste para no sonar repetitivo"
      })"${
    shouldIncludeGifts
      ? `,
      "gift_recommendations": [{ "title": "string", "search_term": "string", "reason": "string", "price_range": "rango de precio en ${localCurrency}" }]`
      : ""
  }
    }. ${
      shouldIncludeGifts
        ? "Máximo 2 regalos (solo si es muy relevante)."
        : "NO incluyas regalos."
    } Si no puedes generar JSON, devuelve solo el texto del mensaje.]`;

  return {
    styleInstructions,
    creativityLevel,
    avoidTopics,
    formatInstruction,
  };
};