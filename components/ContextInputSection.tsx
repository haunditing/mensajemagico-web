import React, { useMemo } from "react";
import { createPortal } from "react-dom";
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
    "Gratitud",
    "Cambio",
    "Paciencia",
  ],
  amor: ["Cena romántica", "Confianza", "Futuro", "Risas", "Te extraño", "Gracias", "Destino", "Complicidad"],
  birthday: ["Fiesta", "Regalo", "Sorpresa", "Agradecimiento", "Un año más", "Deseos", "Salud", "Éxito"],
  saludo: ["Buenos días", "Buenas noches", "Ánimo", "Café", "Lluvia", "Sol", "Energía", "¿Cómo estás?"],
  responder: ["Interés", "Duda", "Afirmación", "Negación", "Cita", "Broma", "Pregunta", "Empatía"],
  perdoname: ["Arrepentimiento", "Segunda oportunidad", "Error", "Promesa", "Te quiero", "Lo siento", "Escúchame"],
  anniversary: ["Recuerdos", "Viaje", "Celebración", "Amor eterno", "Paciencia", "Aventura", "Brindis"],
  mothers_day: ["Gratitud", "Ejemplo", "Cariño", "Flores", "Infancia", "Sacrificio", "Mamá"],
  fathers_day: ["Orgullo", "Enseñanzas", "Fuerza", "Gracias", "Héroe", "Ejemplo", "Papá"],
  christmas: ["Paz", "Familia", "Unión", "Regalos", "Cena", "Próspero año", "Luces", "Magia"],
  visto: ["Humor", "Dignidad", "Misterio", "Hola", "¿Todo bien?", "Señal de vida", "Fantasma"],
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
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousFocus = React.useRef<HTMLElement | null>(null);

  // Manejo de Foco (Trap Focus) y Tecla Escape para Accesibilidad
  React.useEffect(() => {
    if (isHelpOpen) {
      previousFocus.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsHelpOpen(false);
          return;
        }

        if (e.key === "Tab" && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        // Restaurar foco al cerrar para mantener el flujo de navegación
        if (previousFocus.current) {
          previousFocus.current.focus();
        }
      };
    }
  }, [isHelpOpen]);

  // Helper local para conteo de palabras
  const getWordCount = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  const currentContextCount = useMemo(() => 
    contextWords.reduce((acc, w) => acc + getWordCount(w), 0)
  , [contextWords]);

  const suggestions = useMemo(() => {
    const occasionSuggestions = SUGGESTIONS_BY_OCCASION[occasionId] || [];
    const toneSuggestions = tone ? SUGGESTIONS_BY_TONE[tone] || [] : [];

    // Combinar listas y eliminar duplicados
    let combined = Array.from(new Set([...occasionSuggestions, ...toneSuggestions]));
    
    // Filtrar palabras ya seleccionadas para que no aparezcan de nuevo y refrescar la lista
    const selectedSet = new Set(contextWords.map(w => w.toLowerCase()));
    combined = combined.filter(w => !selectedSet.has(w.toLowerCase()));

    // Usar defaults si no hay suficientes
    const pool = combined.length > 0 ? combined : DEFAULT_SUGGESTIONS;

    // Aleatorizar para mostrar variedad (Fisher-Yates shuffle)
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 8);
  }, [occasionId, tone, contextWords]);

  // Calcular si la palabra actual haría exceder el límite
  const pendingWordCount = getWordCount(currentWord);
  const totalWordCount = currentContextCount + pendingWordCount;
  const willExceedLimit = totalWordCount > maxContext;
  const percentage = maxContext > 0 ? Math.min(100, (totalWordCount / maxContext) * 100) : 0;

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-wrap justify-between items-end mb-2 gap-2">
        <div className="flex items-center gap-2">
          <label
            htmlFor="context-word-input"
            className="block text-sm font-bold text-slate-700 dark:text-slate-300"
          >
            {isPensamiento
              ? "¿Sobre qué quieres reflexionar?"
              : "Añade detalles o palabras clave"}
          </label>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            title="¿Cómo funciona el contexto?"
            aria-label="Ayuda sobre contexto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.27 1.453 3.629-.108 4.829a.75.75 0 01-.918-1.186c.95-1.01 1.061-2.281-.022-3.19l.061.676zM12 17a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </button>
          {isContextLocked && (
            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
              Premium 💎
            </span>
          )}
        </div>
        {!isContextLocked && totalWordCount > 0 && (
          <div className="flex flex-col items-end gap-1 ml-auto">
            <span className={`text-xs font-bold transition-colors ${willExceedLimit ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}>
              {totalWordCount}/{maxContext} palabras
            </span>
            <div className="w-20 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
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
            className={`w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-500 dark:placeholder:text-slate-400 ${isContextLocked ? "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 disabled:opacity-100" : ""}`}
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
            className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
            title="Añadir palabra"
            aria-label="Añadir palabra al contexto"
          >
            <span className="text-xl font-bold" aria-hidden="true">
              {isContextLocked ? "🔒" : "+"}
            </span>
          </button>
        </div>
      </div>

      <div className={`flex gap-2 ${contextWords.length > 0 ? "overflow-x-auto pb-2 md:flex-wrap md:pb-0 no-scrollbar snap-x" : "flex-wrap"}`}>
        {contextWords.map((word, idx) => (
          <div key={idx} className="snap-center shrink-0">
            <div
              className="bg-blue-600 dark:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in-up shadow-sm whitespace-nowrap"
              title={word}
            >
              <span>{word.length > 30 ? `${word.substring(0, 27)}...` : word}</span>
              <button
                onClick={() => onRemoveWord(word)}
                className="hover:text-blue-200 dark:hover:text-blue-300 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {contextWords.length === 0 && (
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium italic">
            Opcional: añade palabras para personalizar el mensaje.
          </span>
        )}
      </div>

      {/* Pills de Sugerencias del Guardián */}
      {!isContextLocked && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:gap-2 md:pb-0 no-scrollbar snap-x animate-fade-in">
          {suggestions.map((topic) => (
            <div key={topic} className="snap-center shrink-0">
              <button
                onClick={() => onTrendingTopicClick(topic)}
                className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 whitespace-nowrap"
              >
                + {topic}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Ayuda de Contexto */}
      {isHelpOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsHelpOpen(false)}>
          <div 
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="context-help-title"
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden border border-slate-100 dark:border-slate-800" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Cerrar ayuda"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xl">
                💡
              </div>
              <h3 id="context-help-title" className="text-lg font-bold text-slate-900 dark:text-white">Guía de Contexto</h3>
            </div>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">1. Cómo agregar palabras</h4>
                <p>Escribe una palabra o frase corta (ej. "cena", "ayer") y presiona <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs">Enter</kbd> o el botón <strong>+</strong>. Aparecerá como una etiqueta azul.</p>
              </div>
              
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">2. Cómo lo interpreta la IA</h4>
                <p>El Guardián recibe estas palabras como una lista de "ingredientes" crudos. No analiza gramática aquí.</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li><strong>Úsalas para anclar:</strong> Si pones "playa", la IA situará el mensaje en ese escenario.</li>
                  <li><strong>Define el tono:</strong> Palabras como "nostalgia" o "alegría" guían la emoción.</li>
                  <li><strong>Sé específico:</strong> Mejor "pizza" que "comida".</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-xs">
                <strong>Ejemplo técnico:</strong> Si agregas "cine" y "noche", la IA recibe: <br/>
                <code className="block mt-1 bg-slate-200 dark:bg-slate-900 p-1 rounded text-slate-700 dark:text-slate-300">Context: cine, noche</code>
                <span className="block mt-1">Y generará algo como: "Qué linda noche la del cine..."</span>
              </div>
            </div>

            <button 
              onClick={() => setIsHelpOpen(false)}
              className="w-full mt-6 bg-slate-900 dark:bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default ContextInputSection;