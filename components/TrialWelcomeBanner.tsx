import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { shouldShowTrialWelcomeBanner } from "../services/bannerVisibility";

/**
 * TrialWelcomeBanner - Banner de bienvenida para guests
 * 
 * Características:
 * - Solo aparece para guests (no autenticados)
 * - Se dismissa por sesión (sessionStorage)
 * - Tracking de eventos para analytics
 * - Soporta ESC para cerrar
 * - Fallback si falla la navegación
 * - Responde a cambios en el estado de autenticación
 */
const TrialWelcomeBanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isGuest = !user;
  const hasSeenOnboarding = (() => {
    try {
      return localStorage.getItem("trial_onboarding_seen") === "true";
    } catch {
      return false;
    }
  })();

  // 🔑 Estado de dismiss mejorado: localStorage + sessionStorage
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      // Si ya vio el modal de onboarding, NO mostrar banner
      const hasSeenOnboarding = localStorage.getItem("trial_onboarding_seen");
      if (hasSeenOnboarding) return true;
      
      // Si se dismissió en esta sesión, NO mostrar
      const sessionDismissed = sessionStorage.getItem("trial_welcome_dismissed");
      if (sessionDismissed === "true") return true;
      
      return false;
    } catch {
      return false;
    }
  });

  const [isNavigating, setIsNavigating] = useState(false);

  // Guardar en sessionStorage
  const saveToStorage = useCallback((key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn("SessionStorage no disponible:", error);
    }
  }, []);

  // Enviar evento de analytics
  const trackEvent = useCallback((eventName: string, eventData?: Record<string, any>) => {
    try {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", eventName, {
          event_category: "trial_welcome_banner",
          event_label: "trial_banner",
          ...eventData,
        });
      }
      console.log(`📊 Analytics: ${eventName}`, eventData);
    } catch (error) {
      console.warn("Analytics error:", error);
    }
  }, []);

  // Handler para descartar banner
  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    saveToStorage("trial_welcome_dismissed", "true");
    trackEvent("trial_banner_dismissed", {
      timestamp: new Date().toISOString(),
    });
  }, [saveToStorage, trackEvent]);

  // Handler para iniciar trial
  const handleStartTrial = useCallback(async () => {
    trackEvent("trial_banner_cta_clicked", {
      timestamp: new Date().toISOString(),
      action: "start_trial",
    });
    
    setIsNavigating(true);
    try {
      navigate("/signup?trial=1");
    } catch (error) {
      console.error("Error al navegar:", error);
      setIsNavigating(false);
      window.open("/signup?trial=1", "_blank");
    }
  }, [navigate, trackEvent]);

  // Soportar ESC para cerrar
  useEffect(() => {
    if (!isGuest || isDismissed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGuest, isDismissed, handleDismiss]);

  // Re-mostrar si usuario se autentica en otra pestaña
  useEffect(() => {
    if (user) {
      setIsDismissed(true);
    }
  }, [user]);

  const canShow = shouldShowTrialWelcomeBanner({
    user,
    pathname: location.pathname,
    hasSeenOnboarding,
    trialWelcomeDismissed: isDismissed,
  });

  if (!canShow) return null;

  const message = (
    <>
      Acceso completo a <strong>Premium Lite</strong> por 7 días.{" "}
      <span className="hidden sm:inline">Sin tarjeta de crédito.</span>
    </>
  );

  return (
    <div 
      className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-900 dark:to-pink-900 text-white py-2.5 px-4 text-center relative z-40 shadow-md dark:shadow-none animate-slide-down overflow-hidden"
      role="banner"
      aria-label="Promoción de prueba gratis"
    >
      <style>{`
        @keyframes slide-down {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm pr-8">
        <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/10 flex-shrink-0">
          🎁 Prueba Gratis
        </span>

        <p className="font-medium">{message}</p>

        <button
          onClick={handleStartTrial}
          disabled={isNavigating}
          className="bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-bold hover:bg-purple-50 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Abrir página de registro para prueba gratis"
          title="Inicia la prueba gratis (7 días)"
        >
          {isNavigating ? "Cargando..." : "Empezar"} <span aria-hidden="true">→</span>
        </button>
      </div>

      <button
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
        aria-label="Cerrar promoción (también puedes presionar ESC)"
        title="Cerrar banner"
      >
        ✕
      </button>
    </div>
  );
};

export default TrialWelcomeBanner;
