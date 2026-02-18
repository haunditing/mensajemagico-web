import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Occasion,
  Relationship,
  Tone,
  GeneratedMessage,
  SharePlatform,
} from "../types";
import {
  RELATIONSHIPS,
  TONES,
  RECEIVED_MESSAGE_TYPES,
  PENSAMIENTO_THEMES,
  EMOTIONAL_STATES,
  GREETING_CATEGORIES,
  GREETING_TONES,
  GUARDIAN_INTENTIONS,
} from "../constants";
import { generateMessageStream } from "../services/geminiService";
import {
  containsOffensiveWords,
  SAFETY_ERROR_MESSAGE,
} from "../services/safetyService";
import { canGenerate, recordGeneration } from "../services/usageControlService";
import { incrementGlobalCounter } from "../services/metricsService";
import { useAuth } from "../context/AuthContext";
import { useLocalization } from "../context/LocalizationContext";
import { useUpsell } from "../context/UpsellContext";
import { useFavorites } from "../context/FavoritesContext";
import { getUserLocation } from "../services/locationService";
import { api } from "../context/api";
import { useToast } from "../context/ToastContext";
import { useFeature } from "./useFeature";
import { GiftSuggestion } from "../components/GiftRecommendations";
import { buildGuardianPrompt } from "../services/guardianPromptUtils";
import {
  GUARDIAN_WARNINGS,
  GUARDIAN_FALLBACKS,
} from "../services/guardianRules";

export interface ExtendedGeneratedMessage extends GeneratedMessage {
  gifts?: GiftSuggestion[];
  occasionName?: string;
  toneLabel?: string;
  guardianInsight?: string;
  usedLexicalDNA?: boolean;
  isStreaming?: boolean;
  isError?: boolean;
}

const getWordCount = (text: string) =>
  text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

export const useGenerator = (
  occasion: Occasion,
  initialRelationship?: Relationship,
  onRelationshipChange?: (relId: string) => void,
) => {
  const { user, updateCredits, planLevel } = useAuth();
  const { showToast } = useToast();
  const { country } = useLocalization();
  const { triggerUpsell } = useUpsell();
  const { addFavorite, isFavorite } = useFavorites();

  const isPensamiento = occasion.id === "pensamiento";
  const isResponder = occasion.id === "responder";
  const isGreeting = occasion.id === "saludo";
  const isPerdoname = occasion.id === "perdoname";

  const [searchParams] = useSearchParams();
  const shareParam = searchParams.get("share");

  const [relationshipId, setRelationshipId] = useState<string>(
    initialRelationship?.id ||
      (isPensamiento ? PENSAMIENTO_THEMES[0].id : RELATIONSHIPS[0].id),
  );

  const [contacts, setContacts] = useState<any[]>([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<
    string | undefined
  >(undefined);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showHandAnimation, setShowHandAnimation] = useState(false);
  const [guardianWarning, setGuardianWarning] = useState<string | null>(null);

  const selectedContact = contacts.find((c) => c._id === selectedContactId);

  const currentRelType = useMemo(() => {
    if (selectedContact) {
      const rel = RELATIONSHIPS.find(
        (r) => r.label === selectedContact.relationship,
      );
      return rel ? rel.id : "other";
    }
    return relationshipId;
  }, [selectedContact, relationshipId]);

  const availableTones = useMemo(() => {
    return TONES.filter((t) => {
      if (t.value === Tone.BELATED) {
        if (!["birthday", "anniversary"].includes(occasion.id)) return false;
      }
      const romanticTones = [
        Tone.ROMANTIC,
        Tone.FLIRTY,
        Tone.LIGHT_DESPERATION,
      ];
      if (
        currentRelType === "boss" &&
        [...romanticTones, Tone.SARCASTIC].includes(t.value)
      )
        return false;
      if (
        ["father", "mother", "family"].includes(currentRelType) &&
        romanticTones.includes(t.value)
      )
        return false;
      return true;
    });
  }, [occasion.id, currentRelType]);

  const suggestedGreeting = isGreeting
    ? (() => {
        const now = new Date();
        const h = now.getHours();
        const day = now.getDay(); // 0 = Domingo, 6 = Sábado

        if (h >= 0 && h < 5) return "madrugada";
        // Si es Lunes, sugerimos motivación
        if (day === 1) return "lunes";
        // Si es Sábado o Domingo (y no es madrugada), sugerimos modo relax
        if (day === 0 || day === 6) return "fin_de_semana";
        if (h >= 5 && h < 12) return "amanecer";
        if (h >= 12 && h < 18) return "tarde";
        return "ocaso";
      })()
    : null;

  const [tone, setTone] = useState<Tone>(
    isPensamiento
      ? Tone.PROFOUND
      : isGreeting
        ? ("dulce" as any)
        : Tone.ROMANTIC,
  );
  const [greetingMoment, setGreetingMoment] = useState<string>(
    isGreeting && suggestedGreeting
      ? suggestedGreeting
      : GREETING_CATEGORIES[0].id,
  );
  const [apologyReason, setApologyReason] = useState("");
  const [receivedMessageType, setReceivedMessageType] = useState<string>(
    RECEIVED_MESSAGE_TYPES[0].label,
  );
  const [receivedText, setReceivedText] = useState("");
  const [contextWords, setContextWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [intention, setIntention] = useState<string>("low_effort");
  const [manualIntentionOverride, setManualIntentionOverride] =
    useState<boolean>(false);
  const [messages, setMessages] = useState<ExtendedGeneratedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const [usageMessage, setUsageMessage] = useState<string | null>(null);
  const [showGifts, setShowGifts] = useState(true);
  const [isForPost, setIsForPost] = useState(false);
  const [userLocation, setUserLocation] = useState<string | undefined>(
    undefined,
  );

  const contextLimit = useFeature("access.context_words_limit", 0);
  const isContextLocked = contextLimit === 0;
  const MAX_CONTEXT = isContextLocked ? 0 : contextLimit;

  const currentContextCount = useMemo(
    () => contextWords.reduce((acc, w) => acc + getWordCount(w), 0),
    [contextWords],
  );
  const allowedOccasions = useFeature("access.occasions");
  const isOccasionLocked =
    allowedOccasions !== "all" &&
    (!Array.isArray(allowedOccasions) ||
      (!allowedOccasions.includes("all") &&
        !allowedOccasions.includes(occasion.id)));

  // Effects
  useEffect(() => {
    if (user && (user as any).location) setUserLocation((user as any).location);
    else getUserLocation().then((loc) => loc && setUserLocation(loc));
  }, [user]);

  useEffect(() => {
    if (user) {
      api
        .get("/api/contacts")
        .then((data) => setContacts(data))
        .catch((err) => console.error("Error cargando contactos", err));
    }
  }, [user]);

  useEffect(() => {
    const warning = GUARDIAN_WARNINGS[currentRelType]?.[tone as string] || null;
    setGuardianWarning(warning);
  }, [tone, currentRelType]);

  const guardianDescription = useMemo(() => {
    if (isPensamiento) {
      const descriptions: Record<string, string> = {
        action: isForPost
          ? "Para movilizar a tu audiencia hacia una acción específica."
          : "Para contagiar energía y motivar (sin dar órdenes).",
        resolutive: isForPost
          ? "Para establecer una postura firme o una conclusión clara."
          : "Para compartir una verdad directa o una decisión.",
        inquiry: isForPost
          ? "Para generar debate y comentarios en tu comunidad."
          : "Para invitar al diálogo profundo y la reflexión.",
        low_effort: "Para fortalecer el vínculo personal sin presiones.",
      };
      return descriptions[intention] || "Para compartir algo significativo.";
    }
    return GUARDIAN_INTENTIONS.find((i) => i.id === intention)?.description;
  }, [intention, isForPost, isPensamiento]);

  // Handlers
  const handleRelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    if (newId === "new_contact") {
      setIsContactModalOpen(true);
      return;
    }
    const contact = contacts.find((c) => c._id === newId);
    setRelationshipId(newId);
    setSelectedContactId(contact ? newId : undefined);
    if (onRelationshipChange) onRelationshipChange(newId);
  };

  const addContextWord = () => {
    const word = currentWord.trim();
    if (
      word &&
      !isContextLocked &&
      currentContextCount + getWordCount(word) <= MAX_CONTEXT &&
      !contextWords.includes(word)
    ) {
      if (containsOffensiveWords(word)) {
        setSafetyError("Esa palabra podría nublar la intención de tu mensaje.");
        return;
      }
      setContextWords([...contextWords, word]);
      setCurrentWord("");
      setSafetyError(null);
    }
  };

  const handleGenerate = async () => {
    if (safetyError || isLoading || isOccasionLocked) return;

    if (isResponder && !receivedText.trim()) {
      showToast("Por favor, escribe el mensaje que recibiste para continuar.", "error");
      return;
    }

    let delay = 0;
    if (!user) {
      const check = canGenerate();
      if (!check.allowed) {
        setUsageMessage(check.message || null);
        return;
      }
      if (check.delay) delay = check.delay;
    }

    setIsLoading(true);
    setUsageMessage(null);
    if (delay) await new Promise((res) => setTimeout(res, delay));

    const pendingWord = currentWord.trim();
    const finalContextWords = [...contextWords];
    if (pendingWord && !finalContextWords.includes(pendingWord))
      finalContextWords.push(pendingWord);

    const {
      styleInstructions,
      creativityLevel,
      avoidTopics,
      formatInstruction,
    } = buildGuardianPrompt({
      tone: tone as string,
      selectedContact,
      isPensamiento,
      isForPost,
      showGifts,
      country,
    });

    const tempId = Math.random().toString(36).substr(2, 9);
    setMessages((prev) => [
      {
        id: tempId,
        content: "",
        timestamp: Date.now(),
        occasionName: occasion.name,
        toneLabel: isGreeting
          ? GREETING_TONES.find((t) => (t.id as any) === tone)?.label
          : availableTones.find((t) => t.value === tone)?.label || tone,
        isStreaming: true,
      },
      ...prev,
    ]);

    // Scroll imperativo UNA SOLA VEZ al iniciar (Mejor UX en móviles)
    if (window.innerWidth < 768) {
      setTimeout(() => {
        const element = document.getElementById("results-section");
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    }

    let rawStream = "";

    try {
      const response = await generateMessageStream(
        {
          occasion: occasion.id,
          relationship: isPensamiento
            ? PENSAMIENTO_THEMES.find((t) => t.id === relationshipId)?.label ||
              "la vida"
            : selectedContact?.relationship ||
              RELATIONSHIPS.find((r) => r.id === relationshipId)?.label ||
              "alguien",
          tone: isPensamiento
            ? EMOTIONAL_STATES.find((s) => s.id === tone)?.label || tone
            : isGreeting
              ? GREETING_TONES.find((t) => (t.id as any) === tone)?.label ||
                tone
              : tone,
          receivedMessageType: isResponder ? receivedMessageType : undefined,
          receivedText: isResponder ? receivedText : undefined,
          contextWords: finalContextWords,
          formatInstruction,
          intention,
          relationalHealth: selectedContact?.relationalHealth,
          grammaticalGender: (user as any)?.preferences?.grammaticalGender,
          greetingMoment: isGreeting ? greetingMoment : undefined,
          apologyReason: isPerdoname ? apologyReason : undefined,
        },
        (token) => {
          rawStream += token;
          // Ignorar padding inicial (espacios en blanco) que envía el backend para Safari
          const effectiveStream = rawStream.trimStart();
          let displayContent = "";
          
          // [DEBUG] Ver en consola qué está llegando (F12)
          console.log("📝 Stream:", effectiveStream.substring(effectiveStream.length - 50));

          // 1. Intentar extraer el contenido del mensaje (prioridad máxima)
          // Buscamos "content": "..." incluso si el JSON no está completo
          // MEJORA: Soportar también "message" por si el modelo varía la clave
          const contentMatch = effectiveStream.match(/"(?:content|message)"\s*:\s*"((?:[^"\\]|\\.)*)/);

          if (contentMatch && contentMatch[1]) {
            displayContent = contentMatch[1]
              .replace(/\\n/g, "\n")
              .replace(/\\"/g, '"')
              .replace(/\\t/g, "\t");
          } else if (
            // 2. DETECCIÓN AGRESIVA DE JSON/RUIDO
            // Si contiene cualquier indicio de estructura técnica y no hemos encontrado el contenido, ocultamos todo.
            effectiveStream.includes("{") ||
            effectiveStream.includes("[") ||
            effectiveStream.includes("generated_messages") ||
            effectiveStream.includes("```") ||
            effectiveStream.includes("guardian_insight")
          ) {
            displayContent = "Escribiendo...";
          } else {
            // 3. Fallback: Si no parece JSON, mostramos el texto tal cual (para modelos que no devuelven JSON)
            displayContent = effectiveStream;
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId ? { ...msg, content: displayContent } : msg,
            ),
          );
        },
        user?._id,
        userLocation,
        selectedContactId,
        styleInstructions,
        creativityLevel,
        avoidTopics,
      );

      if (response.remainingCredits !== undefined && updateCredits)
        updateCredits(response.remainingCredits);

      // Procesamiento final del JSON completo
      let finalContent = response.content;
      let gifts: GiftSuggestion[] = [];
      let guardianInsight = "";

      try {
        const cleanJson = finalContent.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (
          parsed.generated_messages &&
          Array.isArray(parsed.generated_messages)
        ) {
          const premiumMsg = parsed.generated_messages.find(
            (m: any) =>
              m.tone.toLowerCase().includes("premium") ||
              m.tone.toLowerCase().includes("regional"),
          );
          const standardMsg =
            parsed.generated_messages.find((m: any) =>
              m.tone.toLowerCase().includes("estándar"),
            ) || parsed.generated_messages[0];
          finalContent =
            planLevel === "premium" && premiumMsg
              ? premiumMsg.content
              : standardMsg.content;
          gifts = parsed.gift_recommendations || [];
          guardianInsight = parsed.guardian_insight || "";
        }
      } catch (e) {
        // Fallback si el parseo falla: intentar extraer el content con Regex
        // Usamos la misma regex robusta que en el streaming para manejar comillas escapadas
        const lastResort = finalContent.match(/"(?:content|message)"\s*:\s*"((?:[^"\\]|\\.)*)/);
        if (lastResort) {
          finalContent = lastResort[1]
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"')
            .replace(/\\t/g, "\t");
        } else if (finalContent.trim().startsWith("{") || finalContent.includes("generated_messages") || finalContent.includes("```")) {
          // Si parece JSON pero no pudimos extraer nada válido (ej. corte de conexión),
          // mostramos un error amigable en lugar de mostrar la estructura técnica al usuario.
          finalContent = "Lo siento, hubo un pequeño error técnico al procesar el mensaje. Por favor intenta de nuevo.";
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                content: finalContent,
                gifts,
                guardianInsight,
                isStreaming: false,
                usedLexicalDNA:
                  !!selectedContact?.guardianMetadata?.preferredLexicon?.length,
              }
            : msg,
        ),
      );

      setIsLoading(false);
      recordGeneration();
      incrementGlobalCounter();
      setCurrentWord("");
    } catch (error: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                isStreaming: false,
                isError: true,
                content: "⚠️ Conexión interrumpida.",
              }
            : msg,
        ),
      );
      setIsLoading(false);
      if (error.upsell) triggerUpsell(error.upsell);
    }
  };

  // Otros métodos se mantienen igual...
  const handleMessageUpdate = (id: string, newContent: string) =>
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, content: newContent } : msg,
      ),
    );
  const handleClearHistory = () =>
    window.confirm("¿Borrar todo?") && setMessages([]);

  return {
    relationshipId,
    setRelationshipId,
    contacts,
    setContacts,
    isContactModalOpen,
    setIsContactModalOpen,
    selectedContactId,
    setSelectedContactId,
    editingMessageId,
    setEditingMessageId,
    showHandAnimation,
    setShowHandAnimation,
    guardianWarning,
    setGuardianWarning,
    selectedContact,
    currentRelType,
    availableTones,
    suggestedGreeting,
    tone,
    setTone,
    greetingMoment,
    setGreetingMoment,
    receivedMessageType,
    setReceivedMessageType,
    receivedText,
    setReceivedText,
    contextWords,
    setContextWords,
    currentWord,
    setCurrentWord,
    intention,
    setIntention,
    manualIntentionOverride,
    setManualIntentionOverride,
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    safetyError,
    setSafetyError,
    usageMessage,
    setUsageMessage,
    showGifts,
    setShowGifts,
    isForPost,
    setIsForPost,
    userLocation,
    setUserLocation,
    guardianDescription,
    shareParam,
    isPensamiento,
    isResponder,
    isGreeting,
    isPerdoname,
    apologyReason,
    setApologyReason,
    isContextLocked,
    MAX_CONTEXT,
    isOccasionLocked,
    handleRelChange,
    addContextWord,
    removeContextWord: (w: string) =>
      setContextWords(contextWords.filter((x) => x !== w)),
    handleTrendingTopicClick: (t: string) =>
      !contextWords.includes(t) && setContextWords([...contextWords, t]),
    handleKeyDown: (e: React.KeyboardEvent) =>
      e.key === "Enter" && addContextWord(),
    handleGenerate,
    handleMessageUpdate,
    handleClearHistory,
    handleShareAction: (p: SharePlatform) =>
      (!user || planLevel === "guest") && p !== SharePlatform.COPY
        ? (triggerUpsell("Regístrate."), false)
        : true,
    handleToggleFavorite: (msg: ExtendedGeneratedMessage) =>
      !user
        ? triggerUpsell("Regístrate.")
        : !isFavorite(msg.content) &&
          addFavorite(
            msg.content,
            msg.occasionName || occasion.name,
            msg.toneLabel || "Normal",
          ),
    handleContactCreated: (c: any) => {
      setContacts([c, ...contacts]);
      setRelationshipId(c._id);
      setSelectedContactId(c._id);
    },
  };
};
