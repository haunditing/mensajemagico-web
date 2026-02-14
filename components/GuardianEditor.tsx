import React, { useState } from "react";
import { api } from "../context/api";
import { useToast } from "../context/ToastContext";

interface GuardianEditorProps {
  generatedText: string;
  contactId?: string;
  isPremium: boolean;
  relationalHealth?: number;
  onTextChange?: (newText: string) => void;
}

const GuardianEditor: React.FC<GuardianEditorProps> = ({ generatedText, contactId, isPremium, relationalHealth = 5, onTextChange }) => {
  const [text, setText] = useState(generatedText);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { showToast } = useToast();

  const handleRestore = () => {
    setText(generatedText);
    if (onTextChange) onTextChange(generatedText);
  };

  // 2. Validación de Seguridad Relacional (Guardrail)
  const isRisky = relationalHealth < 4 && (text.length < 10 || text.toUpperCase() === text);

  const insertText = (insertion: string) => {
    setText(prev => {
      const trimmed = prev.trim();
      // Insertar al final de forma natural
      return trimmed.endsWith('.') ? `${trimmed} ${insertion}` : `${trimmed}, ${insertion}`;
    });
    if (onTextChange) onTextChange(text.endsWith('.') ? `${text} ${insertion}` : `${text}, ${insertion}`);
  };

  // 3. Inyección de Contexto Local (Píldoras de Sabor)
  const flavorPills = [
    { label: "☀️ Clima", text: "con este calor que está haciendo" },
    { label: "🌧️ Lluvia", text: "con este aguacero que cae" },
    { label: "🍻 Plan", text: "para ir por algo frío ahorita" },
    { label: "🚶 Vuelta", text: "para dar una vuelta cuando baje el sol" },
  ];

  // 4. Modo Vulnerabilidad Asistida (Salud < 4)
  const vulnerabilityOpeners = [
    "Sé que he estado perdido...",
    "He estado pensando en lo que pasó...",
    "No quiero que sigamos así...",
  ];

  const prependText = (prefix: string) => {
    setText(prev => `${prefix} ${prev}`);
    if (onTextChange) onTextChange(`${prefix} ${text}`);
  };

  const handleFinalize = async () => {
    if (!contactId || !isPremium) {
      // Si no es premium o no hay contacto, solo copiamos o hacemos una acción local
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          showToast("¡Copiado! Tu mensaje está listo para brillar.", "success");
        } catch (err) {
          showToast("No se pudo copiar automáticamente", "error");
        }
      } else {
        showToast("Tu navegador no soporta copiado automático", "info");
      }
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/api/guardian/learn', {
        contactId,
        originalText: generatedText,
        editedText: text
      });
      setIsSaved(true);
      showToast("¡Captado! El Guardián ha aprendido un poco más de tu esencia. ✨", "success");
    } catch (error) {
      console.error(error);
      showToast("Error guardando aprendizaje", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`w-full transition-colors duration-300 ${isRisky ? "p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50" : ""}`}>
      
      {/* Sugerencias de Vulnerabilidad (Solo si salud baja) */}
      {relationalHealth < 4 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {vulnerabilityOpeners.map((opener, idx) => (
            <button
              key={idx}
              onClick={() => prependText(opener)}
              className="whitespace-nowrap px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-full border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              + {opener}
            </button>
          ))}
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (onTextChange) onTextChange(e.target.value);
        }}
        className="w-full min-h-[120px] p-0 border-0 focus:ring-0 text-slate-800 dark:text-slate-200 leading-relaxed font-medium text-base md:text-lg resize-none bg-transparent"
        placeholder="Escribe tu mensaje aquí..."
      />

      {/* Píldoras de Sabor (Contexto Local) */}
      <div className="mt-2 flex flex-wrap gap-2">
        {flavorPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => insertText(pill.text)}
            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            title={`Añadir: "${pill.text}"`}
          >
            + {pill.label}
          </button>
        ))}
      </div>

      {isRisky && (
        <div className="mt-2 text-[10px] text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1 animate-pulse">
          <span>⚠️</span> Cuando el vínculo es frágil, la suavidad es fuerza. Este tono podría tensar más las cosas.
        </div>
      )}
      
      {contactId && isPremium && !isSaved && text !== generatedText && (
        <div className="mt-4 flex justify-between items-center animate-fade-in">
          <button
            onClick={handleRestore}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
            Restaurar original
          </button>
          <button
            onClick={handleFinalize}
            disabled={isSaving}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:scale-105 transition-transform shadow-md flex items-center gap-2"
          >
            {isSaving ? "Aprendiendo..." : "✨ Enseñar al Guardián"}
          </button>
        </div>
      )}
      
      {isSaved && (
        <div className="mt-2 text-right text-xs font-bold text-green-600 dark:text-green-400 animate-fade-in">
          ✓ Estilo aprendido
        </div>
      )}
    </div>
  );
};

export default GuardianEditor;