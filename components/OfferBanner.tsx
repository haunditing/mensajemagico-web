import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OfferBanner: React.FC = () => {
  const { planLevel, availablePlans, isLoading } = useAuth();
  const location = useLocation();

  const premiumConfig = availablePlans?.premium || {};
  const rawOfferDate = premiumConfig.pricing_hooks?.offer_end_date;
  const rawOfferDuration = premiumConfig.pricing_hooks?.offer_duration_months;

  // Generar ID único para la oferta actual
  const offerId = useMemo(() => {
    if (rawOfferDate) return `date_${rawOfferDate}`;
    if (rawOfferDuration) return `duration_${rawOfferDuration}`;
    return null;
  }, [rawOfferDate, rawOfferDuration]);

  const [dismissedId, setDismissedId] = useState(() => {
    try {
      return sessionStorage.getItem("offer_banner_dismissed_id");
    } catch {
      return null;
    }
  });

  // Si ya se descartó ESTA oferta específica, no mostrar
  const isDismissed = offerId && dismissedId === offerId;

  // 2. Lógica de oferta activa (Sincronizada con PricingPage)
  const { isOfferActive, displayDate } = useMemo(() => {
    if (!rawOfferDate) {
      // Si no hay fecha límite pero sí duración, asumimos que es una oferta activa permanente
      if (rawOfferDuration && Number(rawOfferDuration) > 0) {
        return { isOfferActive: true, displayDate: null };
      }
      return { isOfferActive: false, displayDate: null };
    }

    // Intentamos parsear formato ISO (YYYY-MM-DD) para automatización
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (isoDateRegex.test(rawOfferDate)) {
      const [year, month, day] = rawOfferDate.split("-").map(Number);
      const expiryDate = new Date(year, month - 1, day, 23, 59, 59); // Final del día local

      if (new Date() > expiryDate) {
        return { isOfferActive: false, displayDate: null };
      }

      // Formatear para mostrar (ej. "15 de octubre")
      try {
        const formatter = new Intl.DateTimeFormat("es-ES", {
          day: "numeric",
          month: "long",
        });
        return {
          isOfferActive: true,
          displayDate: formatter.format(expiryDate),
        };
      } catch (e) {
        return { isOfferActive: true, displayDate: rawOfferDate };
      }
    }

    // Si es texto libre (ej. "Pronto"), se muestra siempre
    return { isOfferActive: true, displayDate: rawOfferDate };
  }, [rawOfferDate, rawOfferDuration]);

  // 1. Si está cargando o el usuario ya es Premium, no mostrar nada
  if (
    isLoading ||
    planLevel === "premium" ||
    isDismissed ||
    location.pathname === "/pricing"
  )
    return null;

  if (!isOfferActive) return null;

  return (
    <div className="bg-gradient-to-r from-rose-600 to-orange-600 dark:from-rose-900 dark:to-orange-900 text-white py-2.5 px-4 text-center relative z-40 shadow-md dark:shadow-none animate-slide-down overflow-hidden">
      <style>{`
        @keyframes slide-down {
          0% { transform: translateY(-100%); opacity: 0; max-height: 0; }
          100% { transform: translateY(0); opacity: 1; max-height: 500px; }
        }
        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap text-sm pr-8">
        <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/10">
          🔥 Oferta
        </span>
        <p className="font-medium">
          Desbloquea Premium con precio especial{" "}
          {displayDate ? `hasta el ${displayDate}` : "por tiempo limitado"}.
        </p>
        <Link
          to="/pricing"
          className="bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full text-xs font-bold hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1"
        >
          Ver oferta <span>→</span>
        </Link>
      </div>
      <button
        onClick={() => {
          if (offerId) {
            setDismissedId(offerId);
            sessionStorage.setItem("offer_banner_dismissed_id", offerId);
          }
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
        aria-label="Cerrar oferta"
      >
        ✕
      </button>
    </div>
  );
};

export default OfferBanner;
