import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BannerBase from "./BannerBase";
import { shouldShowOfferBanner } from "../services/bannerVisibility";

const OfferBanner: React.FC = () => {
  const { planLevel, availablePlans, user, isLoading } = useAuth();
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

  const isDismissed = offerId && dismissedId === offerId;

  // Lógica de oferta activa (Sincronizada con PricingPage)
  const { isOfferActive, displayDate } = useMemo(() => {
    if (!rawOfferDate) {
      if (rawOfferDuration && Number(rawOfferDuration) > 0) {
        return { isOfferActive: true, displayDate: null };
      }
      return { isOfferActive: false, displayDate: null };
    }

    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (isoDateRegex.test(rawOfferDate)) {
      const [year, month, day] = rawOfferDate.split("-").map(Number);
      const expiryDate = new Date(year, month - 1, day, 23, 59, 59);

      if (new Date() > expiryDate) {
        return { isOfferActive: false, displayDate: null };
      }

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

    return { isOfferActive: true, displayDate: rawOfferDate };
  }, [rawOfferDate, rawOfferDuration]);

  const canShow = shouldShowOfferBanner({
    user,
    pathname: location.pathname,
    isLoading,
    isOfferActive,
    offerBannerDismissed: Boolean(isDismissed),
  });

  if (!canShow || planLevel === "premium") return null;

  const handleDismiss = () => {
    if (offerId) {
      setDismissedId(offerId);
      sessionStorage.setItem("offer_banner_dismissed_id", offerId);
    }
  };

  const message = (
    <>
      Desbloquea Premium con precio especial{" "}
      {displayDate ? `hasta el ${displayDate}` : "por tiempo limitado"}.
    </>
  );

  return (
    <BannerBase
      gradientFrom="from-rose-600"
      gradientTo="to-orange-600"
      gradientDarkFrom="dark:from-rose-900"
      gradientDarkTo="dark:to-orange-900"
      badge="🔥 Oferta"
      message={message}
      buttonText="Ver oferta"
      buttonHref="/pricing"
      buttonColorClass="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800"
      onDismiss={handleDismiss}
    />
  );
};

export default OfferBanner;
