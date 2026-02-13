import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUpsell } from "../context/UpsellContext";
import { ENABLE_UPGRADES } from "../config";
const UpsellModal: React.FC = () => {
  const { isOpen, message, closeUpsell } = useUpsell();
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Manejo de Foco (Trap Focus) y Tecla Escape
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeUpsell();
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
      // Enfocar el primer botón al abrir
      const firstButton = modalRef.current?.querySelector('button') as HTMLElement;
      if (firstButton) firstButton.focus();

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        if (previousFocus.current) {
          previousFocus.current.focus();
        }
      };
    }
  }, [isOpen, closeUpsell]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeUpsell}>
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600" />

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          🚀 Desbloquea esta función
        </h3>
        <p className="text-gray-600 mb-6 text-lg leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={closeUpsell}
            className="flex-1 px-4 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
          >
            Quizás luego
          </button>
          {ENABLE_UPGRADES && (
            <button
              onClick={() => {
                closeUpsell();
                navigate("/pricing");
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all"
            >
              Mejorar Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpsellModal;
