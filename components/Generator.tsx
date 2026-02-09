import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Occasion, Relationship, Tone, GeneratedMessage, SharePlatform } from "../types";
import {
  RELATIONSHIPS,
  TONES,
  RECEIVED_MESSAGE_TYPES,
  PENSAMIENTO_THEMES,
  EMOTIONAL_STATES,
} from "../constants";
import { generateMessage, AI_ERROR_FALLBACK } from "../services/geminiService";
import {
  containsOffensiveWords,
  SAFETY_ERROR_MESSAGE,
} from "../services/safetyService";
import { canGenerate, recordGeneration } from "../services/usageControlService";
import { incrementGlobalCounter } from "../services/metricsService";
import { CONFIG } from "../config";
import ShareBar from "./ShareBar";
import AdBanner from "./AdBanner";
import { useLocalization } from "../context/LocalizationContext";
import { useAuth } from "../context/AuthContext";
import { generateAmazonLink } from "../services/amazonService";
import FeatureGuard from "./FeatureGuard";
import { useUpsell } from "../context/UpsellContext";
import { useFavorites } from "../context/FavoritesContext";
import LoadingSpinner from "./LoadingSpinner";
import { useFeature } from "@/hooks/useFeature";
import PlanManager from "@/services/PlanManager";
import UsageBar from "./UsageBar";

interface GeneratorProps {
  occasion: Occasion;
  initialRelationship?: Relationship;
  onRelationshipChange?: (relId: string) => void;
}

interface GiftSuggestion {
  title: string;
  search_term: string;
  reason: string;
  price_range: string;
}

interface ExtendedGeneratedMessage extends GeneratedMessage {
  gifts?: GiftSuggestion[];
  occasionName?: string;
  toneLabel?: string;
}

const Generator: React.FC<GeneratorProps> = ({
  occasion,
  initialRelationship,
  onRelationshipChange,
}) => {
  const { user, remainingCredits, monetization, updateCredits, planLevel } = useAuth();
  const { triggerUpsell } = useUpsell();
  const { addFavorite, isFavorite, removeFavorite, favorites } = useFavorites();
  const { country } = useLocalization();
  const isPensamiento = occasion.id === "pensamiento";
  const isResponder = occasion.id === "responder";

  // Filtrar tonos: 'Atrasado' solo para Cumpleaños y Aniversarios
  const availableTones = TONES.filter((t) => {
    if (t.value === Tone.BELATED) {
      return ["birthday", "anniversary"].includes(occasion.id);
    }
    return true;
  });

  const [relationshipId, setRelationshipId] = useState<string>(
    initialRelationship?.id ||
      (isPensamiento ? PENSAMIENTO_THEMES[0].id : RELATIONSHIPS[0].id),
  );
  const [tone, setTone] = useState<Tone>(
    isPensamiento ? Tone.PROFOUND : Tone.ROMANTIC,
  );
  const [receivedMessageType, setReceivedMessageType] = useState<string>(
    RECEIVED_MESSAGE_TYPES[0].label,
  );
  const [receivedText, setReceivedText] = useState("");

  // Estado para palabras de contexto
  const [contextWords, setContextWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");

  const [messages, setMessages] = useState<ExtendedGeneratedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const [usageMessage, setUsageMessage] = useState<string | null>(null);
  const [showGifts, setShowGifts] = useState(true);

  const contextLimit = useFeature("access.context_words_limit", 0);
  const isContextLocked = contextLimit === 0;
  const MAX_CHARS = 400;
  const MAX_CONTEXT = isContextLocked ? 0 : contextLimit;

  // Verificar si la ocasión actual está permitida en el plan
  const allowedOccasions = useFeature("access.occasions");
  const isOccasionLocked =
    allowedOccasions !== "all" &&
    (!Array.isArray(allowedOccasions) ||
      (!allowedOccasions.includes("all") &&
        !allowedOccasions.includes(occasion.id)));

  // Si cambiamos de ocasión y el tono actual ya no está disponible, lo reseteamos
  useEffect(() => {
    if (!isPensamiento) {
      const isCurrentToneAvailable = availableTones.some(
        (t) => t.value === tone,
      );
      if (!isCurrentToneAvailable) {
        setTone(Tone.ROMANTIC);
      }
    }
  }, [occasion.id, availableTones, tone, isPensamiento]);

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

  const handleRelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setRelationshipId(newId);
    if (onRelationshipChange) onRelationshipChange(newId);
  };

  const addContextWord = () => {
    const word = currentWord.trim();
    if (
      word &&
      !isContextLocked &&
      contextWords.length < MAX_CONTEXT &&
      !contextWords.includes(word)
    ) {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addContextWord();
    }
  };

  const handleGenerate = async () => {
    if (safetyError || isLoading || isOccasionLocked) return;

    const check = canGenerate();
    if (!check.allowed) {
      setUsageMessage(check.message || null);
      return;
    }

    setIsLoading(true);
    setUsageMessage(null);

    if (check.delay) {
      await new Promise((resolve) => setTimeout(resolve, check.delay));
    }

    let relLabel = "";
    if (isPensamiento) {
      relLabel =
        PENSAMIENTO_THEMES.find((t) => t.id === relationshipId)?.label ||
        "la vida";
    } else {
      relLabel =
        RELATIONSHIPS.find((r) => r.id === relationshipId)?.label || "alguien";
    }

    // Inyectamos instrucción para formato JSON y regalos si está activo
    let formatInstruction = "";
    if (showGifts) {
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
      formatInstruction = `[SYSTEM: IMPORTANTE: Tu respuesta DEBE ser un JSON válido (sin bloques de código markdown) con esta estructura: { "message": "texto del mensaje", "gift_suggestions": [{ "title": "nombre corto", "search_term": "termino busqueda generico", "reason": "breve explicacion", "price_range": "rango precio en ${localCurrency}" }] }. Máximo 3 regalos. Si no puedes generar JSON, devuelve solo el texto del mensaje.]`;
    }

    let generatedContent = "";
    try {
      const response = await generateMessage(
        {
          occasion: occasion.id,
          relationship: relLabel,
          tone: isPensamiento
            ? (EMOTIONAL_STATES.find((s) => s.id === relationshipId)
                ?.label as any) || tone
            : tone,
          receivedMessageType: isResponder ? receivedMessageType : undefined,
          receivedText: isResponder ? receivedText : undefined,
          contextWords: contextWords,
          formatInstruction: formatInstruction,
        },
        user?._id,
      );

      generatedContent = response.content;
      
      if (response.remainingCredits !== undefined && updateCredits) {
        updateCredits(response.remainingCredits);
      }
    } catch (error: any) {
      setIsLoading(false);
      if (error.upsell) {
        triggerUpsell(error.upsell);
      }
      return; // Detener ejecución si hubo error de upsell
    }

    let content = generatedContent;
    let gifts: GiftSuggestion[] = [];

    try {
      // Intentar limpiar y parsear JSON
      const cleanText = generatedContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      if (cleanText.startsWith("{")) {
        const parsed = JSON.parse(cleanText);
        if (parsed.message) {
          content = parsed.message;
          gifts = parsed.gift_suggestions || [];
        }
      }
    } catch (error) {
      // Fallback: Si el JSON está roto o incompleto, intentamos rescatar el mensaje con Regex
      // Busca el contenido de "message": "..." incluso si no cierra la comilla final
      const messageMatch = generatedContent.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)/);
      if (messageMatch && messageMatch[1]) {
        // Limpiamos caracteres de escape básicos
        content = messageMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
      }
    }

    const newMessage: ExtendedGeneratedMessage = {
      id: Math.random().toString(36).substr(2, 9),
      content: content,
      timestamp: Date.now(),
      gifts: gifts,
      occasionName: occasion.name,
      toneLabel: availableTones.find((t) => t.value === tone)?.label || tone,
    };

    setMessages((prev) => [newMessage, ...prev]);
    setIsLoading(false);
    recordGeneration();
    incrementGlobalCounter();

    if (window.innerWidth < 768) {
      setTimeout(() => {
        document
          .getElementById("results-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleShareAction = (platform: SharePlatform) => {
    if ((!user || planLevel === "guest") && platform !== SharePlatform.COPY) {
      const platformNames: Record<string, string> = {
        [SharePlatform.WHATSAPP]: "WhatsApp",
        [SharePlatform.TELEGRAM]: "Telegram",
        [SharePlatform.FACEBOOK]: "Facebook",
        [SharePlatform.INSTAGRAM]: "Instagram",
        [SharePlatform.X]: "X",
        [SharePlatform.EMAIL]: "Email",
        [SharePlatform.SMS]: "SMS",
      };

      const name = platformNames[platform] || "redes sociales";
      triggerUpsell(`Regístrate para enviar directamente por ${name}.`);
      return false;
    }
    return true;
  };

  const handleToggleFavorite = (msg: ExtendedGeneratedMessage) => {
    if (!user) {
      triggerUpsell("Regístrate para guardar tus mensajes favoritos.");
      return;
    }
    if (isFavorite(msg.content)) {
      // Encontrar el ID del favorito para eliminarlo (opcional, o solo mostrar toast)
      // Por simplicidad en la UI del generador, a veces solo permitimos guardar.
    } else {
      addFavorite(
        msg.content,
        msg.occasionName || occasion.name,
        msg.toneLabel || "Normal",
      );
    }
  };

  return (
    <div className={`w-full ${isPensamiento ? "max-w-3xl mx-auto" : ""}`}>
      <div
        className={`bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 p-6 md:p-10 shadow-sm ${isPensamiento ? "border-blue-100 bg-blue-50/10" : ""}`}
      >
        {/* Barra de Uso de Créditos */}
        <UsageBar />

        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {isPensamiento
                  ? "¿Sobre qué quieres reflexionar?"
                  : "Destinatario"}
              </label>
              <select
                value={relationshipId}
                onChange={handleRelChange}
                className="w-full h-12 md:h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {isPensamiento
                  ? PENSAMIENTO_THEMES.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.label}
                      </option>
                    ))
                  : RELATIONSHIPS.map((rel) => (
                      <option key={rel.id} value={rel.id}>
                        {rel.label}
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {isPensamiento ? "Estado emocional" : "Tono"}
              </label>
              <div className="flex flex-wrap gap-2">
                {isPensamiento
                  ? EMOTIONAL_STATES.map((state) => (
                      <button
                        key={state.id}
                        onClick={() => setTone(state.id as any)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                          tone === state.id
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
                        }`}
                      >
                        {state.label}
                      </button>
                    ))
                  : availableTones.map((t) => (
                      <FeatureGuard
                        key={t.value}
                        featureKey={t.value}
                        type="tone"
                      >
                        <button
                          onClick={() => setTone(t.value)}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                            tone === t.value
                              ? "bg-blue-600 text-white border-blue-600 shadow-md"
                              : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"
                          }`}
                        >
                          {t.label}
                        </button>
                      </FeatureGuard>
                    ))}
              </div>
            </div>
          </div>

          {/* Sección de Palabras de Contexto */}
          <div className="animate-fade-in-up">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Añade detalles o palabras clave{" "}
              {isContextLocked ? (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-2">
                  Premium 💎
                </span>
              ) : (
                `(Máx ${MAX_CONTEXT})`
              )}
            </label>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={currentWord}
                  onChange={(e) => setCurrentWord(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isContextLocked
                      ? "Desbloquea palabras clave con Premium 🔒"
                      : "Ej: playa, pizza, 5 años..."
                  }
                  disabled={
                    contextWords.length >= MAX_CONTEXT || isContextLocked
                  }
                  className={`w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isContextLocked ? "bg-slate-100 text-slate-400" : ""}`}
                />
                {isContextLocked && (
                  <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={() =>
                      triggerUpsell(
                        PlanManager.getUpsellMessage("on_context_limit"),
                      )
                    }
                  />
                )}
              </div>
              <button
                onClick={addContextWord}
                disabled={
                  !currentWord.trim() ||
                  contextWords.length >= MAX_CONTEXT ||
                  isContextLocked
                }
                className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors disabled:opacity-50"
                title="Añadir palabra"
              >
                <span className="text-xl font-bold">
                  {isContextLocked ? "🔒" : "+"}
                </span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {contextWords.map((word, idx) => (
                <div
                  key={idx}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in-up shadow-sm"
                >
                  <span>{word}</span>
                  <button
                    onClick={() => removeContextWord(word)}
                    className="hover:text-blue-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {contextWords.length === 0 && (
                <span className="text-[10px] text-slate-400 font-medium italic">
                  Opcional: añade palabras para personalizar el mensaje.
                </span>
              )}
            </div>
          </div>
          {isResponder && (
            <div className="animate-fade-in-up space-y-4">
              <div>
                <label
                  htmlFor="received-text"
                  className="block text-sm font-bold text-slate-700 mb-2"
                >
                  Mensaje que recibiste
                </label>
                <div className="relative">
                  <textarea
                    id="received-text"
                    value={receivedText}
                    onChange={(e) =>
                      setReceivedText(e.target.value.slice(0, MAX_CHARS))
                    }
                    placeholder="Pega el mensaje aquí..."
                    className={`w-full p-4 bg-blue-50/30 border ${safetyError ? "border-red-400 ring-2 ring-red-50" : "border-blue-100"} rounded-xl font-medium text-slate-800 focus:ring-2 ${safetyError ? "focus:ring-red-400" : "focus:ring-blue-500"} outline-none transition-all resize-none min-h-[120px]`}
                  />
                  <div
                    className={`absolute bottom-3 right-3 text-[10px] font-bold ${receivedText.length >= MAX_CHARS ? "text-red-500" : "text-slate-400"}`}
                  >
                    {receivedText.length} / {MAX_CHARS}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">
                  🔐 Respetamos tu privacidad: no almacenamos el contenido que
                  pegas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Regalos */}
        <div
          className="flex items-center gap-3 mb-6 cursor-pointer group w-fit mx-auto md:mx-0"
          onClick={() => setShowGifts(!showGifts)}
        >
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${showGifts ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white group-hover:border-blue-400"}`}
          >
            {showGifts && (
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors select-none flex items-center gap-2">
            🎁 Ver sugerencias de regalos
          </span>
        </div>

        {safetyError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg animate-fade-in-up">
            <p className="text-xs font-bold text-red-600 flex items-start gap-2">
              <span className="text-sm">🚫</span>
              <span>{safetyError}</span>
            </p>
          </div>
        )}

        {usageMessage && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in-up">
            <p className="text-sm font-bold text-amber-700 flex items-start gap-3">
              <span className="text-xl">⏳</span>
              <span>{usageMessage}</span>
            </p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={
            isLoading ||
            !!safetyError ||
            (!!user && remainingCredits <= 0) ||
            isOccasionLocked
          }
          className={`w-full h-14 md:h-16 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
            ${
              isLoading ||
              safetyError ||
              (!!user && remainingCredits <= 0) ||
              isOccasionLocked
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" color="slate" />
              <span>
                {isPensamiento
                  ? "Mezclando pensamientos..."
                  : "Generando magia..."}
              </span>
            </div>
          ) : (
            <span>
              {safetyError
                ? "Contenido bloqueado"
                : isOccasionLocked
                  ? "Ocasión Premium 🔒"
                  : !!user && remainingCredits <= 0
                    ? "Sin créditos hoy"
                    : isPensamiento
                      ? "Obtener mi pensamiento"
                      : "Generar Mensaje Mágico"}
            </span>
          )}
        </button>
      </div>

      <AdBanner position="middle" hasContent={messages.length > 0} />

      {/* Banner de Registro para usuarios no logueados */}
      {!user && messages.length > 0 && (
        <div className="mt-8 mb-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden animate-fade-in-up">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-black mb-2">
                ¿Te gustó el resultado? ✨
              </h3>
              <p className="text-indigo-100 font-medium text-sm max-w-md">
                Crea una cuenta gratuita para acceder a tonos exclusivos,
                guardar tus favoritos y eliminar límites diarios.
              </p>
            </div>
            <Link
              to="/signup"
              className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-all active:scale-95 whitespace-nowrap"
            >
              Crear cuenta gratis
            </Link>
          </div>

          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      )}

      <div id="results-section" className="mt-6 space-y-6">
        {messages.map((msg) => {
          const isError = msg.content === AI_ERROR_FALLBACK;
          const isFav = isFavorite(msg.content);

          return (
            <div
              key={msg.id}
              className={`bg-white border border-slate-200 rounded-2xl p-6 md:p-8 animate-fade-in-up shadow-sm relative overflow-hidden ${isPensamiento ? "text-center border-blue-200" : ""}`}
            >
              <p
                className={`text-slate-800 leading-relaxed font-medium mb-8 relative z-10 ${isPensamiento ? "text-xl md:text-2xl italic" : "text-base md:text-lg"} ${isError ? "text-red-500 italic text-sm" : ""}`}
              >
                {msg.content}
              </p>

              <div className="pt-6 border-t border-slate-100 relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <ShareBar
                    content={msg.content}
                    platforms={occasion.allowedPlatforms}
                    onAction={handleShareAction}
                    disabled={isError || isLoading}
                    className="animate-fade-in-up flex-1"
                  />

                  {!isError && (
                    <button
                      onClick={() => handleToggleFavorite(msg)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isFav ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400 hover:text-red-400"}`}
                      title="Guardar en favoritos"
                    >
                      <span
                        className={`text-2xl ${isFav ? "scale-110" : "scale-100"}`}
                      >
                        {isFav ? "❤️" : "🤍"}
                      </span>
                    </button>
                  )}
                </div>

                {!isPensamiento && (
                  <div className="mt-6 flex flex-col gap-1 w-full text-left">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                      Aviso legal
                    </span>
                    <p className="text-[10px] text-slate-300 leading-tight">
                      Tú decides cómo usar este mensaje. No somos responsables
                      de las consecuencias sociales de su envío.
                    </p>
                  </div>
                )}

                {/* Sección de Regalos */}
                {msg.gifts && msg.gifts.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <span>🎁</span> Opciones de Regalo
                      </h4>
                      <span className="text-[10px] font-bold text-[#FF9900] bg-[#FF9900]/10 px-3 py-1 rounded-full border border-[#FF9900]/20">
                        Recomendado
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {msg.gifts.map((gift, idx) => (
                        <a
                          key={idx}
                          href={generateAmazonLink(gift.search_term, country)}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="group relative bg-white rounded-2xl border border-slate-200 p-5 hover:border-[#FF9900] hover:shadow-xl hover:shadow-[#FF9900]/10 transition-all duration-300 flex flex-col h-full overflow-hidden hover:-translate-y-1"
                        >
                          {/* Amazon-like button effect on hover */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                          <div className="flex justify-between items-start mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl group-hover:bg-[#FF9900]/10 group-hover:scale-110 transition-all duration-300">
                              🛍️
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-[#232F3E] group-hover:text-white transition-colors">
                                {gift.price_range}
                            </span>
                          </div>

                          <h5 className="font-bold text-slate-900 text-sm mb-2 leading-snug group-hover:text-[#C77700] transition-colors relative z-10 line-clamp-2">
                            {gift.title}
                          </h5>

                          <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-grow relative z-10 line-clamp-3">
                            {gift.reason}
                          </p>

                          <div className="mt-auto relative z-10">
                            <div className="w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] hover:border-[#F2C200] text-[#0F1111] text-xs font-bold py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors">
                              Ver en Amazon
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-6 text-center italic">
                      {CONFIG.AMAZON.DISCLAIMER}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Generator;
