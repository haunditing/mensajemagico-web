import { Tone } from "./types";

export const GUARDIAN_WARNINGS: Record<string, Record<string, string>> = {
  family: {
    [Tone.SARCASTIC]: "El sarcasmo con la familia puede ser malinterpretado.",
  },
  couple: {
    [Tone.FORMAL]: "¿Todo bien? Un tono formal con tu pareja puede sonar distante.",
  },
  ex: {
    [Tone.ROMANTIC]: "Cuidado. Un tono romántico con tu ex puede enviar señales confusas.",
    [Tone.FLIRTY]: "Cuidado. Un tono coqueto con tu ex puede enviar señales confusas.",
    [Tone.LIGHT_DESPERATION]: "Mostrar desesperación con tu ex no suele funcionar.",
  },
  boss: {
    [Tone.FUNNY]: "Asegúrate de que tu jefe tenga buen sentido del humor.",
  },
  ligue: {
    [Tone.FORMAL]: "Demasiada formalidad puede alejar a tu crush.",
  },
  friend: {
    [Tone.ROMANTIC]: "Cuidado, esto podría confundir a tu amigo/a.",
    [Tone.FLIRTY]: "Coquetear con amigos puede complicar la amistad.",
  },
};

export const GUARDIAN_FALLBACKS: Record<
  string,
  { tones: Tone[]; message: string }
> = {
  boss: {
    tones: [Tone.FORMAL, Tone.DIRECT],
    message: "El Guardián ajustó el tono a profesional para tu Jefe.",
  },
  father: {
    tones: [Tone.SUBTLE, Tone.DIRECT],
    message: "El Guardián ajustó el tono para ser más familiar.",
  },
  mother: {
    tones: [Tone.SUBTLE, Tone.DIRECT],
    message: "El Guardián ajustó el tono para ser más familiar.",
  },
  family: {
    tones: [Tone.SUBTLE, Tone.DIRECT],
    message: "El Guardián ajustó el tono para ser más familiar.",
  },
};