import { Tone } from "../types";

export const GUARDIAN_WARNINGS: Record<string, Record<string, string>> = {
  family: {
    [Tone.SARCASTIC]: "El sarcasmo en familia a veces hiere más de lo que divierte. ¿Seguro que es el momento?",
  },
  couple: {
    [Tone.FORMAL]:
      "La formalidad puede sentirse como frialdad en una pareja. ¿Hay algo que te incomoda decir?",
  },
  ex: {
    [Tone.ROMANTIC]:
      "La nostalgia es tramposa. Un tono romántico ahora podría reabrir heridas o crear falsas esperanzas.",
    [Tone.FLIRTY]:
      "Coquetear con un ex suele ser un terreno resbaladizo. Asegúrate de que tu intención sea clara para ambos.",
    [Tone.LIGHT_DESPERATION]:
      "Desde la calma te escucharán mejor. La urgencia a veces aleja lo que queremos acercar.",
  },
  boss: {
    [Tone.FUNNY]: "El humor en el trabajo es un arte delicado. Asegúrate de que el contexto sea el adecuado.",
    [Tone.SINCERE]: "La sinceridad total con un jefe es valiosa pero arriesgada. Asegúrate de mantener el profesionalismo.",
  },
  mother: {
    [Tone.SARCASTIC]:
      "Con mamá, la claridad suele ser mejor que la ironía. El sarcasmo podría lastimarla sin querer.",
  },
  father: {
    [Tone.SARCASTIC]: "A veces los padres toman el sarcasmo como una falta de respeto. Valora si es el mejor canal hoy.",
  },
  ligue: {
    [Tone.FORMAL]: "Relájate un poco. La formalidad excesiva puede poner una barrera invisible con quien te gusta.",
  },
  friend: {
    [Tone.ROMANTIC]: "La línea entre amistad y romance es delgada. Este tono podría cambiar la dinámica entre ustedes.",
    [Tone.FLIRTY]: "Jugar con fuego entre amigos es divertido hasta que alguien se quema. ¿Es esa tu intención?",
  },
};

export const GUARDIAN_FALLBACKS: Record<
  string,
  { tones: Tone[]; message: string }
> = {
  boss: {
    tones: [Tone.FORMAL, Tone.DIRECT],
    message: "Para cuidar tu imagen profesional, el Guardián sugiere un tono más formal o directo.",
  },
  father: {
    tones: [Tone.SUBTLE, Tone.DIRECT],
    message: "Para mantener el respeto y la cercanía, el Guardián sugiere un tono sutil o directo.",
  },
  mother: {
    tones: [Tone.SUBTLE, Tone.DIRECT],
    message: "Para hablar desde el cariño y el respeto, el Guardián sugiere un tono sutil o directo.",
  },
  family: {
    tones: [Tone.SUBTLE, Tone.DIRECT],
    message: "Para evitar malentendidos en el chat familiar, el Guardián sugiere un tono sutil o directo.",
  },
};
