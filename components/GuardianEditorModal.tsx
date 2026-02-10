import React, { useState, useEffect } from "react";
import { api } from "../context/api";
import { useToast } from "../context/ToastContext";

interface GuardianEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  contactId?: string;
  isPremium: boolean;
  relationalHealth?: number;
  onSave: (newText: string) => void;
}

const GuardianEditorModal: React.FC<GuardianEditorModalProps> = ({
  isOpen,
  onClose,
  initialText,
  contactId,
  isPremium,
  relationalHealth = 5,
  onSave,
}) => {
  const [text, setText] = useState(initialText);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();
  
  const MAX_CHARS = 500;

  useEffect(() => {
    if (isOpen) setText(initialText);
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const handleRestore = () => {
    setText(initialText);
  };

  // Validación de Seguridad Relacional (Guardrail)
  const isRisky = relationalHealth < 4 && (text.length < 10 || text.toUpperCase() === text);

  const insertText = (insertion: string) => {
    setText(prev => {
      const trimmed = prev.trim();
      return trimmed.endsWith('.') ? `${trimmed} ${insertion}` : `${trimmed}, ${insertion}`;
    });
  };

  const prependText = (prefix: string) => {
    setText(prev => `${prefix} ${prev}`);
  };

  // Píldoras de Sabor
  const flavorPills = [
    { label: "☀️ Clima", text: "con este calor que está haciendo" },
    { label: "🌧️ Lluvia", text: "con este aguacero que cae" },
    { label: "🍻 Plan", text: "para ir por algo frío ahorita" },
    { label: "🚶 Vuelta", text: "para dar una vuelta cuando baje el sol" },
  ];

  // Vulnerabilidad Asistida
  const vulnerabilityOpeners = [
    "Sé que he estado perdido...",
    "He estado pensando en lo que pasó...",
    "No quiero que sigamos así...",
  ];

  const handleFinalize = async () => {
    setIsSaving(true);
    try {
      if (contactId && isPremium && text !== initialText) {
        await api.post('/api/guardian/learn', {
          contactId,
          originalText: initialText,
          editedText: text
        });
        showToast("¡El Guardián ha aprendido tu estilo! ✨", "success");
      }
      onSave(text);
    } catch (error) {
      console.error(error);
      showToast("Error guardando cambios", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative overflow-hidden flex flex-col max-h-[90vh] ${isRisky ? "border-2 border-orange-200" : ""}`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Editar Mensaje</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>

        {relationalHealth < 4 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {vulnerabilityOpeners.map((opener, idx) => (
              <button key={idx} onClick={() => prependText(opener)} className="whitespace-nowrap px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors">
                + {opener}
              </button>
            ))}
          </div>
        )}

        <div className="relative flex-grow">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-full min-h-[200px] p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 leading-relaxed font-medium text-base resize-none bg-slate-50 pb-8"
            placeholder="Escribe tu mensaje aquí..."
          />
          <div className={`absolute bottom-3 right-3 text-[10px] font-bold transition-colors ${text.length > MAX_CHARS ? "text-red-500" : text.length > MAX_CHARS * 0.9 ? "text-orange-500" : "text-slate-400"}`}>
            {text.length} / {MAX_CHARS}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {flavorPills.map((pill, idx) => (
            <button key={idx} onClick={() => insertText(pill.text)} className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md hover:bg-slate-200 hover:text-slate-700 transition-colors" title={`Añadir: "${pill.text}"`}>
              + {pill.label}
            </button>
          ))}
        </div>

        {isRisky && (
          <div className="mt-3 text-[10px] text-orange-600 font-bold flex items-center gap-1 animate-pulse">
            <span>⚠️</span> Cuidado, la relación está frágil. Quizás este tono sea muy directo.
          </div>
        )}

        <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-100">
          <button onClick={handleRestore} className="text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors flex items-center gap-1" disabled={text === initialText}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg> Restaurar original
          </button>
          <button onClick={handleFinalize} disabled={isSaving} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-50">{isSaving ? "Guardando..." : "Guardar Cambios"}</button>
        </div>
      </div>
    </div>
  );
};

export default GuardianEditorModal;