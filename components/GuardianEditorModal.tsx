import React, { useState, useEffect, useRef } from "react";
import { api } from "../context/api";
import { useToast } from "../context/ToastContext";
import Button from "./ui/Button";

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
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  
  const MAX_CHARS = 500;

  useEffect(() => {
    if (isOpen) setText(initialText);
  }, [isOpen, initialText]);

  // Modo protagonista: bloquea el scroll del fondo mientras el editor está abierto
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Manejo de Foco (Trap Focus) y Tecla Escape
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
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
        if (previousFocus.current) {
          previousFocus.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRestore = () => {
    setText(initialText);
  };

  // Validación de Seguridad Relacional (Guardrail)
  const isRisky = relationalHealth < 4 && (text.length < 10 || text.toUpperCase() === text);

  const handleFinalize = async () => {
    setIsSaving(true);
    try {
      if (contactId && isPremium && text !== initialText) {
        await api.post('/api/guardian/learn', {
          contactId,
          originalText: initialText,
          editedText: text
        });
        showToast("¡Captado! El Guardián ha aprendido un poco más de tu esencia. ✨", "success");
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Editor Mágico"
        className={`bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl shadow-2xl max-w-3xl w-full p-5 sm:p-8 relative overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[92vh] ${isRisky ? "border-2 border-orange-200 dark:border-orange-900/50" : ""}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>✨</span> Editor Mágico
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pule tu texto aquí. Al guardar, la IA aprende tu estilo y lo aplica en futuros mensajes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center shrink-0"
            aria-label="Cerrar editor"
          >
            ✕
          </button>
        </div>

        <div className="relative flex-grow">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-full min-h-[40vh] sm:min-h-[260px] p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none text-slate-800 dark:text-slate-200 leading-relaxed font-medium text-base resize-none bg-slate-50 dark:bg-slate-800 pb-8"
            placeholder="Escribe tu mensaje aquí..."
            autoFocus
          />
          <div className={`absolute bottom-3 right-3 text-[10px] font-bold transition-colors ${text.length > MAX_CHARS ? "text-red-500" : text.length > MAX_CHARS * 0.9 ? "text-orange-500" : "text-slate-400"}`}>
            {text.length} / {MAX_CHARS}
          </div>
        </div>

        {isRisky && (
          <div className="mt-3 text-[10px] text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1 animate-pulse">
            <span>⚠️</span> Cuando el vínculo es frágil, la suavidad es fuerza. Este tono podría tensar más las cosas.
          </div>
        )}

        <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestore}
            disabled={text === initialText}
            leftIcon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            }
          >
            Restaurar original
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleFinalize}
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuardianEditorModal;