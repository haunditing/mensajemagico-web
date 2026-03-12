export const getLockedOccasionLabel = (isGuest: boolean): string => {
  return isGuest ? "Ocasión bloqueada 🔒" : "Ocasión Premium 🔒";
};

export const getLockedOccasionBadge = (isGuest: boolean): string => {
  return isGuest ? "Registro" : "Premium";
};

export const getRegionalModeHint = (isGuest: boolean): string => {
  return isGuest
    ? "Ubicación detectada (Crea tu cuenta para activar el modo regional)"
    : "Ubicación detectada (Mejora a Premium para activar el modo regional)";
};

export const getRegionalModeUpsell = (isGuest: boolean): string => {
  return isGuest
    ? "Crea tu cuenta para activar el Tono Regional y personalizar tus mensajes según tu ciudad."
    : "Mejora a Premium para activar el Tono Regional y personalizar tus mensajes según tu ciudad.";
};

export const getContextLockedLabel = (isGuest: boolean): string => {
  return isGuest ? "Cuenta" : "Premium 💎";
};

export const getContextLockedPlaceholder = (isGuest: boolean): string => {
  return isGuest
    ? "Crea tu cuenta para desbloquear palabras clave 🔒"
    : "Desbloquea palabras clave con Premium 🔒";
};

export const getContextUpsell = (isGuest: boolean): string => {
  return isGuest
    ? "Crea tu cuenta para personalizar tus mensajes con palabras clave."
    : "La personalización con palabras clave está disponible en Premium.";
};

export const getPublicationGuideUpsell = (isGuest: boolean): string => {
  return isGuest
    ? "🗺️ Crea tu cuenta para acceder a las instrucciones de publicación paso a paso y publicar como un profesional."
    : "🗺️ Las instrucciones de publicación paso a paso están disponibles en el plan Premium. ¡Publica como un profesional en cada plataforma!";
};
