import React, { useMemo } from "react";
import PlanManager from "../services/PlanManager";

interface ContextInputSectionProps {
  isPensamiento: boolean;
  occasionId: string;
  tone?: string;
  isContextLocked: boolean;
  maxContext: number;
  currentWord: string;
  onCurrentWordChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  contextWords: string[];
  onAddWord: () => void;
  onRemoveWord: (word: string) => void;
  onTrendingTopicClick: (topic: string) => void;
  showHandAnimation: boolean;
  onTriggerUpsell: (message: string) => void;
}

const SUGGESTIONS_BY_OCCASION: Record<string, string[]> = {
  pensamiento: [
    "Propósito",
    "Minimalismo",
    "Fracaso",
    "Conexión",
    "Tiempo",
    "Silencio",
  ],
  amor: ["Cena romántica", "Confianza", "Futuro", "Risas", "Te extraño", "Gracias"],
  birthday: ["Fiesta", "Regalo", "Sorpresa", "Agradecimiento", "Un año más", "Deseos"],
  saludo: ["Buenos días", "Buenas noches", "Ánimo", "Café", "Lluvia", "Sol"],
  responder: ["Interés", "Duda", "Afirmación", "Negación", "Cita", "Broma"],
  perdoname: ["Arrepentimiento", "Segunda oportunidad", "Error", "Promesa", "Te quiero"],
  anniversary: ["Recuerdos", "Viaje", "Celebración", "Amor eterno", "Paciencia"],
  mothers_day: ["Gratitud", "Ejemplo", "Cariño", "Flores", "Infancia"],
  fathers_day: ["Orgullo", "Enseñanzas", "Fuerza", "Gracias", "Héroe"],
  christmas: ["Paz", "Familia", "Unión", "Regalos", "Cena", "Próspero año"],
  visto: ["Humor", "Dignidad", "Misterio", "Hola", "¿Todo bien?"],
};

const SUGGESTIONS_BY_TONE: Record<string, string[]> = {
  // Tones
  romantic: ["Besos", "Caricias", "Eternidad", "Sueños", "Juntos"],
  funny: ["Risas", "Broma", "Locura", "Payaso", "Diversión"],
  flirty: ["Miradas", "Fuego", "Secreto", "Travesura", "Noche"],
  direct: ["Ahora", "Decisión", "Claridad", "Verdad", "Punto"],
  subtle: ["Quizás", "Tal vez", "Suave", "Detalle", "Gesto"],
  sarcastic: ["Obvio", "Genio", "Aplausos", "Wow", "Increíble"],
  short: ["Breve", "Rápido", "Conciso", "Resumen", "Ya"],
  profound: ["Alma", "Universo", "Esencia", "Destino", "Sentido"],
  formal: ["Respeto", "Cordialidad", "Atención", "Estimado", "Saludos"],
  light_desperation: ["Por favor", "Ayuda", "Necesito", "Urgente", "Espera"],
  belated: ["Tarde", "Perdón", "Olvido", "Tiempo", "Ayer"],

  // Emotional States
  tranquilo: ["Paz", "Calma", "Respiro", "Silencio", "Naturaleza"],
  reflexivo: ["Por qué", "Aprendizaje", "Camino", "Duda", "Verdad"],
  triste: ["Lágrima", "Ausencia", "Gris", "Recuerdo", "Dolor"],
  motivado: ["Fuerza", "Meta", "Logro", "Pasión", "Éxito"],
  neutro: ["Balance", "Centro", "Realidad", "Hecho", "Día"],
  feliz: ["Sonrisa", "Sol", "Color", "Música", "Regalo"],
  sorprendido: ["Wow", "Inesperado", "Magia", "Cambio", "Novedad"],

  // Greetings
  dulce: ["Cariño", "Abrazo", "Luz", "Dulzura", "Ternura"],
  atento: ["Cuidado", "Detalle", "Interés", "Escucha", "Tiempo"],
  fuerte: ["Energía", "Poder", "Ánimo", "Grito", "Vamos"],
  fresco: ["Nuevo", "Aire", "Mañana", "Inicio", "Libertad"],
  sobrio: ["Serio", "Correcto", "Justo", "Medido", "Calmado"],
  alegre: ["Fiesta", "Risa", "Baile", "Juego", "Vida"],
};

const DEFAULT_SUGGESTIONS = ["Alegría", "Gratitud", "Motivación", "Esperanza"];

const ContextInputSection: React.FC<ContextInputSectionProps> = ({
  isPensamiento,
  occasionId,
  tone,
  isContextLocked,
  maxContext,
  currentWord,
  onCurrentWordChange,
  onKeyDown,
  contextWords,
  onAddWord,
  onRemoveWord,
  onTrendingTopicClick,
  showHandAnimation,
  onTriggerUpsell,
}) => {
  // Helper local para conteo de palabras
  const getWordCount = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  const currentContextCount = useMemo(() => 
    contextWords.reduce((acc, w) => acc + getWordCount(w), 0)
  , [contextWords]);

  const suggestions = useMemo(() => {
    const occasionSuggestions = SUGGESTIONS_BY_OCCASION[occasionId] || [];
    const toneSuggestions = tone ? SUGGESTIONS_BY_TONE[tone] || [] : [];

    if (toneSuggestions.length > 0) {
      const combined = Array.from(new Set([...toneSuggestions, ...occasionSuggestions]));
      return combined.slice(0, 8);
    }

    return occasionSuggestions.length > 0 ? occasionSuggestions : DEFAULT_SUGGESTIONS;
  }, [occasionId, tone]);

  // Calcular si la palabra actual haría exceder el límite
  const pendingWordCount = getWordCount(currentWord);
  const totalWordCount = currentContextCount + pendingWordCount;
  const willExceedLimit = totalWordCount > maxContext;
  const percentage = maxContext > 0 ? Math.min(100, (totalWordCount / maxContext) * 100) : 0;

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-end mb-2">
        <label
          htmlFor="context-word-input"
          className="block text-sm font-bold text-slate-700"
        >
          {isPensamiento
            ? "¿Sobre qué quieres reflexionar?"
            : "Añade detalles o palabras clave"}{" "}
          {isContextLocked && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-2">
              Premium 💎
            </span>
          )}
        </label>
        {!isContextLocked && (
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs font-bold transition-colors ${willExceedLimit ? "text-red-500" : "text-slate-400"}`}>
              {totalWordCount}/{maxContext} palabras
            </span>
            <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${willExceedLimit ? "bg-red-500" : percentage > 80 ? "bg-amber-400" : "bg-blue-500"}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 mb-3">
        <div className="relative flex-grow">
          <input
            id="context-word-input"
            type="text"
            value={currentWord}
            onChange={(e) => onCurrentWordChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              isContextLocked
                ? "Desbloquea palabras clave con Premium 🔒"
                : isPensamiento
                  ? "Ej: La brevedad del tiempo o el valor de los silencios"
                  : "Ej: playa, pizza, 5 años..."
            }
            disabled={currentContextCount >= maxContext || isContextLocked}
            className={`w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isContextLocked ? "bg-slate-100 text-slate-400" : ""}`}
          />
          {isContextLocked && (
            <div
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={() =>
                onTriggerUpsell(PlanManager.getUpsellMessage("on_context_limit"))
              }
            />
          )}
        </div>
        <div className="relative">
          {showHandAnimation && (
            <div className="absolute -top-8 md:-top-10 left-1/2 -translate-x-1/2 animate-bounce text-xl md:text-2xl pointer-events-none z-20 filter drop-shadow-sm">
              👇
            </div>
          )}
          <button
            onClick={onAddWord}
            disabled={
              !currentWord.trim() ||
              willExceedLimit ||
              isContextLocked
            }
            className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors disabled:opacity-50"
            title="Añadir palabra"
            aria-label="Añadir palabra al contexto"
          >
            <span className="text-xl font-bold" aria-hidden="true">
              {isContextLocked ? "🔒" : "+"}
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {contextWords.map((word, idx) => (
          <div
            key={idx}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in-up shadow-sm"
            title={word}
          >
            <span>{word.length > 30 ? `${word.substring(0, 27)}...` : word}</span>
            <button
              onClick={() => onRemoveWord(word)}
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

      {/* Pills de Sugerencias del Guardián */}
      {!isContextLocked && (
        <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
          {suggestions.map((topic) => (
            <button
              key={topic}
              onClick={() => onTrendingTopicClick(topic)}
              className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full hover:bg-slate-200 transition-colors border border-slate-200"
            >
              + {topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContextInputSection;