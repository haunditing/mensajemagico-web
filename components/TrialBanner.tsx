import React, { useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { shouldShowTrialBanner } from "../services/bannerVisibility";

/**
 * TrialBanner - Banner de countdown para usuarios en trial activo
 * 
 * Características:
 * - Solo aparece cuando usuario tiene trial activo
 * - Countdown dinámico (días restantes)
 * - Tracking de eventos para analytics
 * - Fallback si falla la navegación a pricing
 * - Descartar por sesión
 */
const TrialBanner: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const trialInfo = (user as any)?.trial;

  const trialId = useMemo(() => {
    if (trialInfo?.endDate) return `trial_${trialInfo.endDate}`;
    return null;
  }, [trialInfo?.endDate]);

  const [dismissedId, setDismissedId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem("trial_banner_dismissed_id");
    } catch {
      return null;
    }
  });

  const [isNavigating, setIsNavigating] = useState(false);

  const isDismissed = trialId && dismissedId === trialId;
  const isTrialActive = trialInfo?.active === true;

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
          event_category: "trial_banner",
          days_remaining: trialInfo?.daysRemaining,
          ...eventData,
        });
      }
      console.log(`📊 Trial Banner: ${eventName}`, { daysRemaining: trialInfo?.daysRemaining, ...eventData });
    } catch (error) {
      console.warn("Analytics error:", error);
    }
  }, [trialInfo?.daysRemaining]);

  const handleDismiss = useCallback(() => {
    if (trialId) {
      setDismissedId(trialId);
      saveToStorage("trial_banner_dismissed_id", trialId);
      trackEvent("trial_banner_dismissed", {
        days_remaining: trialInfo?.daysRemaining,
      });
    }
  }, [trialId, saveToStorage, trackEvent, trialInfo?.daysRemaining]);

  const handleNavigateToPricing = useCallback(async () => {
    trackEvent("trial_banner_cta_clicked", {
      action: "go_to_pricing",
      days_remaining: trialInfo?.daysRemaining,
    });

    setIsNavigating(true);
    try {
      navigate("/pricing");
    } catch (error) {
      console.error("Error navegando a pricing:", error);
      setIsNavigating(false);
      window.location.href = "/pricing";
    }
  }, [navigate, trackEvent, trialInfo?.daysRemaining]);

  const canShow = shouldShowTrialBanner({
    user,
    pathname: location.pathname,
    isLoading,
    trialBannerDismissed: Boolean(isDismissed),
  });

  if (!canShow) return null;

  const daysRemaining = trialInfo?.daysRemaining || 0;

  const message = useMemo(() => {
    if (daysRemaining === 0) {
      return <>Tu prueba gratis termina <strong>HOY</strong>. Actualiza ahora para mantener el acceso Premium Lite.</>;
    } else if (daysRemaining === 1) {
      return <>Te queda <strong>1 día</strong> de acceso Premium Lite. No pierdas tus beneficios.</>;
    } else {
      return <>Te quedan <strong>{daysRemaining} días</strong> de acceso Premium Lite con 20 mensajes diarios.</>;
    }
  }, [daysRemaining]);

  // Usar BannerBase pero con navegación mejorada
  return (
    <div 
      className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-900 dark:to-pink-900 text-white py-2.5 px-4 text-center relative z-40 shadow-md dark:shadow-none animate-slide-down overflow-hidden"
      role="banner"
      aria-label="Estado de tu prueba gratis"
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
          onClick={handleNavigateToPricing}
          disabled={isNavigating}
          className="bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-bold hover:bg-purple-50 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Ver planes de suscripción"
          title={`${daysRemaining === 0 ? "¡Actúa ahora!" : "Ver opciones de pago"}`}
        >
          {isNavigating ? "Cargando..." : "Ver planes"} <span aria-hidden="true">→</span>
        </button>
      </div>

      <button
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
        aria-label="Cerrar banner"
        title="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
};

export default TrialBanner;
