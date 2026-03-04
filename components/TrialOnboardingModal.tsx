import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { shouldShowTrialOnboardingModal } from "../services/bannerVisibility";

/**
 * TrialOnboardingModal - Modal de bienvenida con prueba gratis
 * 
 * Aparece solo:
 * - Para guests (no autenticados)
 * - En /home (página principal)
 * - Primera visita (se guarda en localStorage)
 * 
 * Características:
 * - Cierre con ESC
 * - Animaciones suaves y atractivas
 * - Tracking de eventos
 * - Loading state en CTAs
 * - Efecto blur en fondo
 */
const TrialOnboardingModal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [shouldShow, setShouldShow] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [visibleBenefits, setVisibleBenefits] = useState<number[]>([]);

  // Mostrar modal con delay
  useEffect(() => {
    const timersRef: ReturnType<typeof setTimeout>[] = [];

    const checkAndShow = () => {
      
      let hasSeenOnboarding = false;
      let showAfterQuickStart = false;
      let quickStartCompleted = false;
      let quickStartDismissed = false;
      
      try {
        hasSeenOnboarding = localStorage.getItem("trial_onboarding_seen") === "true";
        showAfterQuickStart = sessionStorage.getItem("show_trial_after_quickstart") === "true";
        quickStartCompleted = localStorage.getItem("quickstart_completed") === "true";
        quickStartDismissed = sessionStorage.getItem("quickstart_dismissed") === "true";
      } catch {
        hasSeenOnboarding = false;
        showAfterQuickStart = false;
        quickStartCompleted = false;
        quickStartDismissed = false;
      }

      // BLOQUEAR si QuickStartModal debe aparecer (usuario no ha completado ni cerrado QuickStart)
      const quickStartShouldShow = !quickStartCompleted && !quickStartDismissed;
      
      if (quickStartShouldShow && !showAfterQuickStart) {
        // QuickStart tiene prioridad, NO mostrar Trial hasta que termine QuickStart
        setShouldShow(false);
        return;
      }

      // PRIORIDAD: Si viene de QuickStart, mostrar aunque ya haya visto el onboarding
      const canShow = showAfterQuickStart || shouldShowTrialOnboardingModal({
        user,
        pathname: location.pathname,
        hasSeenOnboarding,
      });

      if (!canShow) {
        setShouldShow(false);
        return;
      }

      const timer = setTimeout(() => {
        setShouldShow(true);
      }, 700);
      timersRef.push(timer);
    };

    // Ejecutar check inicial
    checkAndShow();

    // Listener para evento personalizado de QuickStart
    const handleQuickStartComplete = () => {
      checkAndShow();
    };

    window.addEventListener('quickstart_completed', handleQuickStartComplete);
    
    return () => {
      window.removeEventListener('quickstart_completed', handleQuickStartComplete);
      timersRef.forEach(timer => clearTimeout(timer));
    };
  }, [user, location.pathname]);

  // Animar beneficios cuando aparece modal
  useEffect(() => {
    if (!shouldShow) return;

    const timings = [100, 250, 400];
    const timers = timings.map((t, i) =>
      setTimeout(() => {
        setVisibleBenefits((prev) => [...prev, i]);
      }, t)
    );

    return () => timers.forEach(clearTimeout);
  }, [shouldShow]);

  const handleClose = useCallback(() => {
    setShouldShow(false);
    try {
      localStorage.setItem("trial_onboarding_seen", "true");
      sessionStorage.setItem("trial_welcome_dismissed", "true");
      // Limpiar flag de QuickStart para que no vuelva a aparecer
      sessionStorage.removeItem("show_trial_after_quickstart");
    } catch {
      // no-op
    }
  }, []);

  const handleStartTrial = useCallback(async () => {
    setIsStarting(true);
    try {
      // Track event
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "trial_onboarding_started", {
          event_category: "trial_modal",
          event_label: "onboarding",
        });
      }
      
      // Pequeño delay para feedback visual
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      handleClose();
      navigate("/signup?trial=1");
    } catch (error) {
      console.error("Error iniciando trial:", error);
      setIsStarting(false);
    }
  }, [handleClose, navigate]);

  // Soporte ESC
  useEffect(() => {
    if (!shouldShow) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shouldShow, handleClose]);

  // Bloquear scroll de fondo mientras el modal está abierto
  useEffect(() => {
    if (!shouldShow) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [shouldShow]);

  if (!shouldShow) return null;

  const benefits = [
    {
      icon: "✨",
      title: "20 mensajes diarios",
      description: "Ideal para crear múltiples mensajes personalizados",
    },
    {
      icon: "🎉",
      title: "Todas las ocasiones",
      description: "Cumpleaños, aniversarios, felicitaciones y más",
    },
    {
      icon: "🔓",
      title: "Sin tarjeta requerida",
      description: "Pruébalo gratis. Cancela cuando quieras",
    },
  ];

  return (
    <>
      {/* Background blur mejorado */}
      <div 
        className="fixed inset-0 bg-black/30 dark:bg-black/50 z-[70] backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 pointer-events-none onboarding-modal-shell">
        <div
          className="pointer-events-auto animate-modal-enter w-full max-w-[95vw] sm:max-w-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="trial-onboarding-title"
          aria-describedby="trial-onboarding-desc"
        >
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700/50 max-h-[90vh] flex flex-col onboarding-modal-card">
            <button
              onClick={handleClose}
              disabled={isStarting}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors disabled:opacity-50"
              aria-label="Cerrar modal"
              title="Cerrar"
            >
              ✕
            </button>
            {/* Header con gradiente y efectos */}
            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 dark:from-purple-700 dark:via-pink-700 dark:to-rose-700 p-5 sm:p-8 text-white text-center relative overflow-hidden flex-shrink-0">
              {/* Elementos decorativos animados */}
              <div className="absolute -top-10 -right-10 sm:-top-12 sm:-right-12 w-28 h-28 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-2xl animate-blob"></div>
              <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-2xl animate-blob animation-delay-2000"></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-2xl animate-blob animation-delay-4000"></div>

              <div className="relative z-10">
                {/* Emoji grande con escala */}
                <div className="text-5xl sm:text-7xl mb-3 sm:mb-4 animate-bounce-gentle" aria-hidden="true">
                  🎁
                </div>
                
                <h2 id="trial-onboarding-title" className="text-2xl sm:text-3xl font-bold mb-2">Prueba Gratis</h2>
                <p id="trial-onboarding-desc" className="text-white/90 text-sm font-medium">
                  7 días de acceso completo a Premium Lite
                </p>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-5 sm:p-8 overflow-y-auto overscroll-contain">
              {/* Beneficios con animación stagger */}
              <div className="space-y-3 mb-6 sm:mb-8">
                {benefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-slate-50 dark:from-slate-800/50 to-slate-50/50 dark:to-slate-800/30 border border-slate-100 dark:border-slate-700/50 transition-all duration-500 ${
                      visibleBenefits.includes(idx)
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4"
                    }`}
                  >
                    <div className="flex-shrink-0 text-xl sm:text-2xl">{benefit.icon}</div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {benefit.title}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info adicional */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30 rounded-lg p-3 sm:p-4 mb-6 text-center">
                <p className="text-purple-900 dark:text-purple-200 font-bold text-sm mb-1">
                  ☑️ Sin sorpresas
                </p>
                <p className="text-purple-800 dark:text-purple-300 text-xs">
                  Te recordaremos antes de que termine la prueba
                </p>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                {/* CTA Principal */}
                <button
                  onClick={handleStartTrial}
                  disabled={isStarting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-purple-600/50 disabled:to-pink-600/50 text-white font-bold py-3 sm:py-3.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-md disabled:cursor-not-allowed transform sm:hover:scale-105 active:scale-95"
                  title="Inicia tu prueba gratis de 7 días"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isStarting ? (
                      <>
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                        Cargando...
                      </>
                    ) : (
                      <>🚀 Empezar Prueba Gratis</>
                    )}
                  </span>
                </button>

                {/* Botón secundario */}
                <button
                  onClick={handleClose}
                  disabled={isStarting}
                  className="w-full text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2.5 rounded-lg transition-all duration-200"
                  title="Cerrar modal (también puedes presionar ESC)"
                >
                  Quizás después
                </button>
              </div>

              {/* Footer minimal */}
              <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-4 flex flex-wrap items-center justify-center gap-1.5">
                <span>🎁 7 días gratis</span>
                <span>•</span>
                <span>💳 Sin tarjeta</span>
                <span>•</span>
                <span>⚡ Cancela cuando quieras</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos globales para animaciones */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-modal-enter {
          animation: modal-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2.5s ease-in-out infinite;
        }

        .animate-blob {
          animation: blob 8s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .onboarding-modal-card {
          scrollbar-width: thin;
          scrollbar-color: rgba(99, 102, 241, 0.55) rgba(148, 163, 184, 0.18);
        }

        .onboarding-modal-card::-webkit-scrollbar {
          inline-size: 10px;
        }

        .onboarding-modal-card::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.18);
          border-radius: 9999px;
        }

        .onboarding-modal-card::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.55);
          border-radius: 9999px;
        }

        .onboarding-modal-card::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.75);
        }

        @media (min-inline-size: 1024px) and (max-block-size: 820px) {
          .onboarding-modal-shell {
            align-items: flex-start;
            padding-block-start: 1rem;
            padding-block-end: 1rem;
          }

          .onboarding-modal-card {
            max-block-size: calc(100vh - 2rem);
          }
        }
      `}</style>
    </>
  );
};

export default TrialOnboardingModal;
