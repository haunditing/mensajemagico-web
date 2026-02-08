import React, { useState, useEffect } from "react";
import { Occasion, Relationship, Tone, GeneratedMessage } from "../types";
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
import { generateAmazonLink } from "../services/amazonService";

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
}

const Generator: React.FC<GeneratorProps> = ({
  occasion,
  initialRelationship,
  onRelationshipChange,
}) => {
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

  const MAX_CHARS = 400;
  const MAX_CONTEXT = CONFIG.USAGE.MAX_CONTEXT_WORDS;

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
    if (safetyError || isLoading) return;

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
    let augmentedContext = [...contextWords];
    if (showGifts) {
      const jsonInstruction = `[SYSTEM: IMPORTANTE: Tu respuesta DEBE ser un JSON válido (sin bloques de código markdown) con esta estructura: { "message": "texto del mensaje", "gift_suggestions": [{ "title": "nombre corto", "search_term": "termino busqueda generico", "reason": "breve explicacion", "price_range": "rango precio" }] }. Máximo 3 regalos. Si no puedes generar JSON, devuelve solo el texto del mensaje.]`;
      augmentedContext.push(jsonInstruction);
    }

    const text = await generateMessage({
      occasion: occasion.name,
      relationship: relLabel,
      tone: isPensamiento
        ? (EMOTIONAL_STATES.find((s) => s.id === relationshipId)
            ?.label as any) || tone
        : tone,
      receivedMessageType: isResponder ? receivedMessageType : undefined,
      receivedText: isResponder ? receivedText : undefined,
      contextWords: augmentedContext,
    });

    let content = text;
    let gifts: GiftSuggestion[] = [];

    try {
      // Intentar limpiar y parsear JSON
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      if (cleanText.startsWith('{')) {
         const parsed = JSON.parse(cleanText);
         if (parsed.message) {
           content = parsed.message;
           gifts = parsed.gift_suggestions || [];
         }
      }
    } catch (e) {
      // Si falla, asumimos que es texto plano (fallback)
    }

    const newMessage: ExtendedGeneratedMessage = {
      id: Math.random().toString(36).substr(2, 9),
      content: content,
      timestamp: Date.now(),
      gifts: gifts
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

  return (
    <div className={`w-full ${isPensamiento ? "max-w-3xl mx-auto" : ""}`}>
      <div
        className={`bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 p-6 md:p-10 shadow-sm ${isPensamiento ? "border-blue-100 bg-blue-50/10" : ""}`}
      >
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="rel-select"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                {isPensamiento
                  ? "¿Sobre qué quieres reflexionar?"
                  : "Destinatario"}
              </label>
              <select
                id="rel-select"
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
              <label
                htmlFor="tone-select"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                {isPensamiento ? "Estado emocional" : "Tono"}
              </label>
              <select
                id="tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full h-12 md:h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {isPensamiento
                  ? EMOTIONAL_STATES.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.label}
                      </option>
                    ))
                  : availableTones.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          {/* Sección de Palabras de Contexto */}
          <div className="animate-fade-in-up">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Añade detalles o palabras clave (Máx {MAX_CONTEXT})
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentWord}
                onChange={(e) => setCurrentWord(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ej: playa, pizza, 5 años..."
                disabled={contextWords.length >= MAX_CONTEXT}
                className="flex-grow h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={addContextWord}
                disabled={
                  !currentWord.trim() || contextWords.length >= MAX_CONTEXT
                }
                className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors disabled:opacity-50"
                title="Añadir palabra"
              >
                <span className="text-xl font-bold">+</span>
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
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${showGifts ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>
            {showGifts && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
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
          disabled={isLoading || !!safetyError}
          className={`w-full h-14 md:h-16 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
            ${
              isLoading || safetyError
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
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
                : isPensamiento
                  ? "Obtener mi pensamiento"
                  : "Generar Mensaje Mágico"}
            </span>
          )}
        </button>
      </div>

      <AdBanner position="middle" hasContent={messages.length > 0} />

      <div id="results-section" className="mt-6 space-y-6">
        {messages.map((msg) => {
          const isError = msg.content === AI_ERROR_FALLBACK;

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

              <div className="pt-6 border-t border-slate-100 relative z-10">
                <ShareBar
                  content={msg.content}
                  platforms={occasion.allowedPlatforms}
                  disabled={isError || isLoading}
                  className="animate-fade-in-up"
                />

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
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span>🎁</span> Sugerencias para acompañar
                    </h4>
                    <div className="grid gap-3">
                      {msg.gifts.map((gift, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-blue-200 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-slate-800 text-sm">{gift.title}</span>
                              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">{gift.price_range}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{gift.reason}</p>
                          </div>
                          <a 
                            href={generateAmazonLink(gift.search_term, country)}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="bg-[#FF9900] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-[#ff8c00] transition-colors shadow-sm whitespace-nowrap flex items-center gap-2 w-full sm:w-auto justify-center"
                          >
                            Ver en Amazon <span>↗</span>
                          </a>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-4 text-center italic">
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
