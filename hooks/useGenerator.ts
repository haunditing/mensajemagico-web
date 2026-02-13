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
  PSYCHOLOGICAL_MATRIX,
} from "../constants";
import { generateMessage } from "../services/geminiService";
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
import { GUARDIAN_WARNINGS, GUARDIAN_FALLBACKS } from "../guardianRules";

export interface ExtendedGeneratedMessage extends GeneratedMessage {
  gifts?: GiftSuggestion[];
  occasionName?: string;
  toneLabel?: string;
  guardianInsight?: string;
  usedLexicalDNA?: boolean;
}

// Helper para contar palabras reales
const getWordCount = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0).length;

export const useGenerator = (
  occasion: Occasion,
  initialRelationship?: Relationship,
  onRelationshipChange?: (relId: string) => void
) => {
  const { user, updateCredits, planLevel } = useAuth();
  const { showToast } = useToast();
  const { country } = useLocalization();
  const { triggerUpsell } = useUpsell();
  const { addFavorite, isFavorite } = useFavorites();
  
  const isPensamiento = occasion.id === "pensamiento";
  const isResponder = occasion.id === "responder";
  const isGreeting = occasion.id === "saludo";

  const [searchParams] = useSearchParams();
  const shareParam = searchParams.get("share");

  const [relationshipId, setRelationshipId] = useState<string>(
    initialRelationship?.id ||
      (isPensamiento ? PENSAMIENTO_THEMES[0].id : RELATIONSHIPS[0].id),
  );

  // Estado para contactos
  const [contacts, setContacts] = useState<any[]>([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<
    string | undefined
  >(undefined);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showHandAnimation, setShowHandAnimation] = useState(false);
  const [guardianWarning, setGuardianWarning] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const selectedContact = contacts.find((c) => c._id === selectedContactId);

  // --- LÓGICA DEL GUARDIÁN: FILTRO DE TONOS POR RELACIÓN ---
  const currentRelType = useMemo(() => {
    if (selectedContact) {
      const rel = RELATIONSHIPS.find(r => r.label === selectedContact.relationship);
      return rel ? rel.id : "other";
    }
    return relationshipId;
  }, [selectedContact, relationshipId]);

  const availableTones = useMemo(() => {
    return TONES.filter((t) => {
      if (t.value === Tone.BELATED) {
        if (!["birthday", "anniversary"].includes(occasion.id)) return false;
      }

      const romanticTones = [Tone.ROMANTIC, Tone.FLIRTY, Tone.LIGHT_DESPERATION];
      const professionalForbidden = [...romanticTones, Tone.SARCASTIC];
      const familyForbidden = [...romanticTones];

      if (currentRelType === "boss") {
        if (professionalForbidden.includes(t.value)) return false;
      }

      if (["father", "mother", "family"].includes(currentRelType)) {
        if (familyForbidden.includes(t.value)) return false;
      }

      return true;
    });
  }, [occasion.id, currentRelType]);

  const suggestedGreeting = isGreeting
    ? (() => {
        const h = new Date().getHours();
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
  const [receivedMessageType, setReceivedMessageType] = useState<string>(
    RECEIVED_MESSAGE_TYPES[0].label,
  );
  const [receivedText, setReceivedText] = useState("");

  // Sincronizar el momento del saludo con la sugerencia al cargar o cambiar de ocasión
  useEffect(() => {
    if (isGreeting && suggestedGreeting) {
      setGreetingMoment(suggestedGreeting);
    }
  }, [isGreeting, suggestedGreeting]);

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

  const contextLimit = useFeature("access.context_words_limit", 0);
  const isContextLocked = contextLimit === 0;
  const MAX_CONTEXT = isContextLocked ? 0 : contextLimit;

  // Calcular uso actual en palabras (no en items)
  const currentContextCount = useMemo(() => 
    contextWords.reduce((acc, w) => acc + getWordCount(w), 0)
  , [contextWords]);

  const allowedOccasions = useFeature("access.occasions");
  const isOccasionLocked =
    allowedOccasions !== "all" &&
    (!Array.isArray(allowedOccasions) ||
      (!allowedOccasions.includes("all") &&
        !allowedOccasions.includes(occasion.id)));

  const [userLocation, setUserLocation] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (user && (user as any).location) {
      setUserLocation((user as any).location);
    } else {
      getUserLocation().then((loc) => {
        if (loc) setUserLocation(loc);
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      api
        .get("/api/contacts")
        .then((data) => {
          setContacts(data);
        })
        .catch((err) => console.error("Error cargando contactos", err));
    }
  }, [user]);

  useEffect(() => {
    if (!isPensamiento && !isGreeting) {
      const isCurrentToneAvailable = availableTones.some(
        (t) => t.value === tone,
      );
      if (!isCurrentToneAvailable) {
        const fallback = GUARDIAN_FALLBACKS[currentRelType];
        if (fallback) {
          const safeToneValue = fallback.tones.find((t) =>
            availableTones.some((at) => at.value === t)
          );
          setTone(safeToneValue || availableTones[0]?.value);
          showToast(fallback.message, "info");
        } else {
          const defaultTone = availableTones.find(t => t.value === Tone.ROMANTIC);
          setTone(defaultTone ? defaultTone.value : availableTones[0]?.value);
        }
      }
    }
  }, [occasion.id, availableTones, tone, isPensamiento, isGreeting, currentRelType, showToast]);

  useEffect(() => {
    const warning = GUARDIAN_WARNINGS[currentRelType]?.[tone as string] || null;
    setGuardianWarning(warning);
  }, [tone, currentRelType]);

  useEffect(() => {
    if (isResponder && receivedText.trim() !== "") {
      if (containsOffensiveWords(receivedText)) {
        setSafetyError(SAFETY_ERROR_MESSAGE);
      } else {
        setSafetyError(null);
      }
    } else {
      setSafetyError(null);
    }
  }, [receivedText, isResponder]);

  useEffect(() => {
    if (currentWord.trim() && !isContextLocked && currentContextCount < MAX_CONTEXT) {
      setShowHandAnimation(true);
      const timer = setTimeout(() => setShowHandAnimation(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowHandAnimation(false);
    }
  }, [currentWord, isContextLocked, currentContextCount, MAX_CONTEXT]);

  const guardianDescription = useMemo(() => {
    if (isPensamiento) {
      if (isForPost) {
        switch (intention) {
          case 'action': return "Para movilizar a tu audiencia hacia una acción específica.";
          case 'resolutive': return "Para establecer una postura firme o una conclusión clara.";
          case 'inquiry': return "Para generar debate y comentarios en tu comunidad.";
          default: return "Para generar conexión y reflexión en tu comunidad.";
        }
      } else {
        switch (intention) {
          case 'action': return "Para contagiar energía y motivar (sin dar órdenes).";
          case 'resolutive': return "Para compartir una verdad directa o una decisión.";
          case 'inquiry': return "Para invitar al diálogo profundo y la reflexión.";
          case 'low_effort': return "Para fortalecer el vínculo personal sin presiones.";
          default: return "Para compartir algo significativo.";
        }
      }
    }
    return GUARDIAN_INTENTIONS.find((i) => i.id === intention)?.description;
  }, [intention, isForPost, isPensamiento]);

  // --- MANEJADORES DE ACCIÓN ---

  const handleRelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;

    if (newId === "new_contact") {
      setIsContactModalOpen(true);
      return;
    }

    const contact = contacts.find((c) => c._id === newId);
    if (contact) {
      setRelationshipId(newId);
      setSelectedContactId(newId);
    } else {
      setRelationshipId(newId);
      setSelectedContactId(undefined);
    }

    if (onRelationshipChange) onRelationshipChange(newId);
  };

  const addContextWord = () => {
    const word = currentWord.trim();
    const wordCount = getWordCount(word);

    if (word && !isContextLocked && (currentContextCount + wordCount <= MAX_CONTEXT) && !contextWords.includes(word)) {
      if (containsOffensiveWords(word)) {
        setSafetyError("La palabra de contexto no es permitida.");
        return;
      }
      setContextWords([...contextWords, word]);
      setCurrentWord("");
      setSafetyError(null);
    }
  };

  const removeContextWord = (wordToRemove: string) => {
    setContextWords(contextWords.filter((w) => w !== wordToRemove));
  };

  const handleTrendingTopicClick = (topic: string) => {
    const topicCount = getWordCount(topic);
    if ((currentContextCount + topicCount <= MAX_CONTEXT) && !contextWords.includes(topic)) {
      setContextWords([...contextWords, topic]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addContextWord();
    }
  };

  const handleGenerate = async () => {
    if (safetyError || isLoading || isOccasionLocked) return;

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

    if (delay) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // 1. Lógica de Contexto Inteligente: Incluir lo que el usuario está escribiendo
    // Si el usuario escribió una frase pero no le dio a "Agregar", la incluimos automáticamente.
    const pendingWord = currentWord.trim();
    const finalContextWords = [...contextWords];

    if (pendingWord) {
      if (containsOffensiveWords(pendingWord)) {
        setSafetyError("La palabra de contexto no es permitida.");
        setIsLoading(false);
        return;
      }
      if (!finalContextWords.includes(pendingWord)) {
        finalContextWords.push(pendingWord);
      }
    }

    const { styleInstructions, creativityLevel, avoidTopics, formatInstruction } =
      buildGuardianPrompt({
        tone: tone as string,
        selectedContact,
        isPensamiento,
        isForPost,
        showGifts,
        country,
      });

    let relLabel = "";
    if (isPensamiento) {
      relLabel = PENSAMIENTO_THEMES.find((t) => t.id === relationshipId)?.label || "la vida";
    } else {
      if (selectedContact) {
        relLabel = selectedContact.relationship || "alguien";
      } else {
        relLabel = RELATIONSHIPS.find((r) => r.id === relationshipId)?.label || "alguien";
      }
      if (isGreeting) {
        const momentLabel = GREETING_CATEGORIES.find((c) => c.id === greetingMoment)?.label;
        if (momentLabel) relLabel += ` (Momento: ${momentLabel})`;
      }
    }

    try {
      const response = await generateMessage(
        {
          occasion: occasion.id,
          relationship: relLabel,
          tone: isPensamiento ? (EMOTIONAL_STATES.find((s) => s.id === tone)?.label as any) || tone : isGreeting ? (GREETING_TONES.find((t) => (t.id as any) === tone)?.label as any) || tone : tone,
          receivedMessageType: isResponder ? receivedMessageType : undefined,
          receivedText: isResponder ? receivedText : undefined,
          contextWords: finalContextWords,
          formatInstruction: formatInstruction,
          intention: intention,
          relationalHealth: selectedContact?.relationalHealth,
          grammaticalGender: (user as any)?.preferences?.grammaticalGender,
        },
        user?._id,
        userLocation,
        selectedContactId,
        styleInstructions,
        creativityLevel,
        avoidTopics,
      );

      if (response.remainingCredits !== undefined && updateCredits) {
        updateCredits(response.remainingCredits);
      }

      let content = response.content;
      let gifts: GiftSuggestion[] = [];
      let guardianInsight = "";

      try {
        // Intentar limpiar y parsear JSON
        const cleanText = content
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        
        if (cleanText.startsWith("{")) {
          const parsed = JSON.parse(cleanText);

          // Soporte para el nuevo formato "Guardian of Sentiment"
          if (
            parsed.generated_messages &&
            Array.isArray(parsed.generated_messages)
          ) {
            // Preferir el mensaje premium si está disponible y no bloqueado (o si somos premium)
            const premiumMsg = parsed.generated_messages.find(
              (m: any) =>
                m.tone.includes("Premium") || m.tone.includes("Regional"),
            );
            const standardMsg =
              parsed.generated_messages.find((m: any) =>
                m.tone.includes("Estándar"),
              ) || parsed.generated_messages[0];

            content =
              planLevel === "premium" && premiumMsg
                ? premiumMsg.content
                : standardMsg.content;

            // Añadir insight si existe (para freemium)
            if (parsed.guardian_insight) {
              guardianInsight = parsed.guardian_insight;
            }

            if (
              parsed.gift_recommendations &&
              Array.isArray(parsed.gift_recommendations)
            ) {
              gifts = parsed.gift_recommendations;
            }
          }
        }
      } catch (error) {
        // Fallback: Si el JSON está roto o incompleto, intentamos rescatar el mensaje con Regex
        // Busca el contenido de "message": "..." incluso si no cierra la comilla final
        const messageMatch = content.match(
          /"message"\s*:\s*"((?:[^"\\]|\\.)*)/,
        );
        if (messageMatch && messageMatch[1]) {
          // Limpiamos caracteres de escape básicos
          content = messageMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n");
        }
      }

      const newMessage: ExtendedGeneratedMessage = {
        id: Math.random().toString(36).substr(2, 9),
        content: content,
        timestamp: Date.now(),
        gifts: gifts,
        occasionName: occasion.name,
        toneLabel: isGreeting ? GREETING_TONES.find((t) => (t.id as any) === tone)?.label : availableTones.find((t) => t.value === tone)?.label || tone,
        guardianInsight: guardianInsight,
        usedLexicalDNA: selectedContact?.guardianMetadata?.preferredLexicon?.length > 0,
      };

      setMessages((prev) => [newMessage, ...prev]);
      setIsLoading(false);
      recordGeneration();
      incrementGlobalCounter();

      // Limpiar el input de contexto para mejorar la UX
      setCurrentWord("");

      if (window.innerWidth < 768) {
        setTimeout(() => {
          document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error: any) {
      setIsLoading(false);
      if (error.upsell) triggerUpsell(error.upsell);
    }
  };

  const handleShareAction = (platform: SharePlatform) => {
    if ((!user || planLevel === "guest") && platform !== SharePlatform.COPY) {
      triggerUpsell(`Regístrate para enviar directamente.`);
      return false;
    }
    return true;
  };

  const handleToggleFavorite = (msg: ExtendedGeneratedMessage) => {
    if (!user) {
      triggerUpsell("Regístrate para guardar tus mensajes favoritos.");
      return;
    }
    if (!isFavorite(msg.content)) {
      addFavorite(msg.content, msg.occasionName || occasion.name, msg.toneLabel || "Normal");
    }
  };

  const handleMessageUpdate = (id: string, newContent: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, content: newContent } : msg)));
  };

  const handleContactCreated = (newContact: any) => {
    setContacts((prev) => [newContact, ...prev]);
    setRelationshipId(newContact._id);
    setSelectedContactId(newContact._id);
    showToast(`Ahora escribiéndole a ${newContact.name}`, "success");
  };

  return {
    relationshipId, setRelationshipId,
    contacts, setContacts,
    isContactModalOpen, setIsContactModalOpen,
    selectedContactId, setSelectedContactId,
    editingMessageId, setEditingMessageId,
    showHandAnimation, setShowHandAnimation,
    guardianWarning, setGuardianWarning,
    selectedContact,
    currentRelType,
    availableTones,
    suggestedGreeting,
    tone, setTone,
    greetingMoment, setGreetingMoment,
    receivedMessageType, setReceivedMessageType,
    receivedText, setReceivedText,
    contextWords, setContextWords,
    currentWord, setCurrentWord,
    intention, setIntention,
    manualIntentionOverride, setManualIntentionOverride,
    messages, setMessages,
    isLoading, setIsLoading,
    safetyError, setSafetyError,
    usageMessage, setUsageMessage,
    showGifts, setShowGifts,
    isForPost, setIsForPost,
    userLocation, setUserLocation,
    guardianDescription,
    shareParam,
    isPensamiento,
    isResponder,
    isGreeting,
    isContextLocked,
    MAX_CONTEXT,
    isOccasionLocked,
    handleRelChange,
    addContextWord,
    removeContextWord,
    handleTrendingTopicClick,
    handleKeyDown,
    handleGenerate,
    handleShareAction,
    handleToggleFavorite,
    handleMessageUpdate,
    handleContactCreated
  };
};