import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { ENABLE_UPGRADES, CONFIG } from "../config";
import { useLocalization } from "../context/LocalizationContext";
import { api } from "../context/api";
import PaymentGateways from "../components/PaymentGateways";
import PlanCard from "../components/PlanCard";
import { useToast } from "../context/ToastContext";

declare global {
  interface Window {
    WidgetCheckout: any;
  }
}

const PricingPage: React.FC = () => {
  const { user, planLevel, availablePlans, isLoading: authLoading } = useAuth();
  const { country } = useLocalization();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    () => {
      const state = location.state as { interval?: string } | null;
      return state?.interval === "yearly" ? "yearly" : "monthly";
    },
  );
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "free" | "premium_lite" | "premium"
  >("premium_lite");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"premium_lite" | "premium">(
    "premium_lite",
  );

  const isValentine = CONFIG.THEME.IS_VALENTINE;
  const isChristmas = CONFIG.THEME.IS_CHRISTMAS;
  const isHalloween = CONFIG.THEME.IS_HALLOWEEN;
  const isBlackFriday = CONFIG.THEME.IS_BLACK_FRIDAY;

  useEffect(() => {
    // Fix para bfcache: Si el usuario vuelve atrás, aseguramos que el loading esté apagado
    const handlePageShow = (event: any) => {
      if (event.persisted) {
        setIsPaymentLoading(false);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // Cargar script de seguridad de Mercado Pago para Device ID
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.mercadopago.com/v2/security.js";
    script.setAttribute("view", "checkout");
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Helper para cargar el script de Wompi dinámicamente
  const loadWompiScript = () => {
    return new Promise((resolve, reject) => {
      if (document.getElementById("wompi-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "wompi-script";
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Error cargando Wompi"));
      document.body.appendChild(script);
    });
  };

  // Movemos la lógica de hooks ANTES del return condicional para evitar error de React
  const freeConfig = availablePlans?.freemium || {};
  const premiumLiteConfig = availablePlans?.premium_lite || {};
  const premiumConfig = availablePlans?.premium || {};

  // --- Lógica de Precios Localizados ---
  const isColombia = country === "CO";
  const rawOfferDate = premiumConfig.pricing_hooks?.offer_end_date;
  const rawOfferDuration = premiumConfig.pricing_hooks?.offer_duration_months;

  // Lógica de expiración de oferta automática
  const { isOfferActive, displayDate } = React.useMemo(() => {
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

  // Helper: Crear objeto de configuración de precios para cualquier plan
  const generatePriceConfig = (
    config: any,
    isColombia: boolean,
    isOfferActive: boolean,
    displayDate: string | null,
  ) => {
    const parsePrice = (val: any) => {
      const num = Number(val);
      return !isNaN(num) && num > 0 ? num : undefined;
    };

    const monthlyUSD =
      parsePrice(config.pricing_hooks?.mercadopago_price_monthly_usd) ||
      parsePrice(config.pricing?.monthly) ||
      2.99;
    const yearlyUSD =
      parsePrice(config.pricing_hooks?.mercadopago_price_yearly_usd) ||
      parsePrice(config.pricing?.yearly) ||
      29.99;

    const monthlyUSDOriginal = parsePrice(
      config.pricing_hooks?.mercadopago_price_monthly_usd_original,
    );
    const yearlyUSDOriginal = parsePrice(
      config.pricing_hooks?.mercadopago_price_yearly_usd_original,
    );

    const monthlyCOP =
      parsePrice(config.pricing_hooks?.mercadopago_price_monthly) || 12990;
    const yearlyCOP =
      parsePrice(config.pricing_hooks?.mercadopago_price_yearly) || 129900;
    const monthlyCOPOriginal = parsePrice(
      config.pricing_hooks?.mercadopago_price_monthly_original,
    );
    const yearlyCOPOriginal = parsePrice(
      config.pricing_hooks?.mercadopago_price_yearly_original,
    );

    const offerDuration =
      Number(config.pricing_hooks?.offer_duration_months) || 0;

    // Helper para resolver el precio activo (Oferta vs Original)
    const resolvePrice = (active: number, original: number | undefined) => {
      if (isOfferActive) return active;
      return original || active;
    };

    const finalMonthly = isColombia
      ? resolvePrice(monthlyCOP, monthlyCOPOriginal)
      : resolvePrice(monthlyUSD, monthlyUSDOriginal);

    const finalYearly = isColombia
      ? resolvePrice(yearlyCOP, yearlyCOPOriginal)
      : resolvePrice(yearlyUSD, yearlyUSDOriginal);

    const referenceMonthly = isColombia
      ? monthlyCOPOriginal || monthlyCOP
      : monthlyUSDOriginal || monthlyUSD;

    const yearlySavings = referenceMonthly * 12 - finalYearly;

    const discountPercentage = Math.round(
      (1 - finalYearly / (referenceMonthly * 12)) * 100,
    );

    return {
      monthly: finalMonthly,
      yearly: finalYearly,
      monthlyOriginal: isOfferActive
        ? isColombia
          ? monthlyCOPOriginal
          : monthlyUSDOriginal
        : undefined,
      yearlyOriginal: isOfferActive
        ? isColombia
          ? yearlyCOPOriginal
          : yearlyUSDOriginal
        : undefined,
      offerDuration: isOfferActive ? offerDuration : 0,
      yearly_monthly_equivalent: finalYearly / 12,
      offerEndDate: isOfferActive ? displayDate : undefined,
      currency: isColombia ? "COP" : "USD",
      locale: isColombia ? "es-CO" : "en-US",
      discountPercentage: discountPercentage > 0 ? discountPercentage : 0,
      yearlySavings: yearlySavings > 0 ? yearlySavings : 0,
    };
  };

  // Optimización: Memorizar la configuración de precios para ambos planes
  const priceConfig = React.useMemo(() => {
    return generatePriceConfig(
      premiumConfig,
      isColombia,
      isOfferActive,
      displayDate,
    );
  }, [isColombia, isOfferActive, displayDate, premiumConfig]);

  const priceConfigLite = React.useMemo(() => {
    return generatePriceConfig(
      premiumLiteConfig,
      isColombia,
      isOfferActive,
      displayDate,
    );
  }, [isColombia, isOfferActive, displayDate, premiumLiteConfig]);

  // Optimización: Memorizar el formateador para evitar recrear Intl.NumberFormat
  const formatPrice = React.useCallback(
    (amount: number) => {
      const formatted = new Intl.NumberFormat(priceConfig.locale, {
        style: "currency",
        currency: priceConfig.currency,
        minimumFractionDigits: priceConfig.currency === "COP" ? 0 : 2,
        maximumFractionDigits: priceConfig.currency === "COP" ? 0 : 2,
      }).format(amount);

      return (
        <>
          {formatted} <span className="text-sm">{priceConfig.currency}</span>
        </>
      );
    },
    [priceConfig],
  );

  const handleSubscribe = async (gateway: string) => {
    if (!ENABLE_UPGRADES) {
      showToast(
        "Las nuevas suscripciones están temporalmente deshabilitadas.",
        "info",
      );
      return;
    }

    if (!user) {
      navigate("/login", { state: { from: location.pathname } }); // Para volver después del login
      return;
    }

    setIsPaymentLoading(true);
    try {
      // Determinar el plan basado en selectedPlan
      const planType =
        selectedPlan === "premium_lite" ? "premium_lite" : "premium";

      // --- 1. Mercado Pago ---
      if (gateway === "mercadopago") {
        const planId =
          billingInterval === "monthly"
            ? `${planType}_monthly`
            : `${planType}_yearly`;

        // Obtener Device ID generado por el script de MP (si existe)
        const deviceId = (window as any).MP_DEVICE_SESSION_ID;

        const response = await api.post("/api/mercadopago/create_preference", {
          userId: user._id,
          planId,
          country: country || "US",
          deviceId,
        });

        const data = response?.data || response;

        if (data?.init_point) {
          // Detección robusta de entorno de desarrollo (Localhost, IPs locales, Ngrok)
          const isDev =
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1" ||
            window.location.hostname.startsWith("192.168.") ||
            window.location.hostname.includes("ngrok");

          const redirectUrl =
            isDev && data.sandbox_init_point
              ? data.sandbox_init_point
              : data.init_point;
          window.location.href = redirectUrl;
          return; // Mantenemos loading true mientras redirige
        } else {
          throw new Error(
            "No se pudo obtener el enlace de pago de Mercado Pago.",
          );
        }
      }

      // --- 2. Wompi ---
      if (gateway === "wompi") {
        await loadWompiScript();

        const planId =
          billingInterval === "monthly"
            ? `${planType}_monthly`
            : `${planType}_yearly`;

        // Enviar el monto calculado (con oferta si aplica)
        // Usar precios de Wompi (en centavos), no de MercadoPago
        const selectedConfig =
          planType === "premium_lite" ? premiumLiteConfig : premiumConfig;
        const priceHooks = selectedConfig.pricing_hooks;

        // Fallbacks según el tipo de plan: premium_lite (12990/129900) o premium (sin fallback configurado)
        const defaultMonthlyWompi = planType === "premium_lite" ? 12990 : 0;
        const defaultYearlyWompi = planType === "premium_lite" ? 129900 : 0;

        const amount =
          billingInterval === "monthly"
            ? (priceHooks?.wompi_price_in_cents_monthly ||
                defaultMonthlyWompi) / 100
            : (priceHooks?.wompi_price_in_cents_yearly || defaultYearlyWompi) /
              100;

        // 1. Obtener datos de firma del backend
        const response = await api.post("/api/checkout", {
          userId: user._id,
          planId,
          amount,
        });

        const data = response.data || response;

        // 2. Configurar Widget
        const checkout = new window.WidgetCheckout({
          currency: data.currency,
          amountInCents: data.amountInCents,
          reference: data.reference,
          publicKey: data.publicKey,
          signature: { integrity: data.signature },
          redirectUrl: data.redirectUrl,
          customerData: {
            email: user.email,
            fullName: user.email.split("@")[0],
          },
        });

        // 3. Abrir Widget
        checkout.open((result: any) => {
          const transaction = result.transaction;
        });

        setIsPaymentLoading(false);
        return;
      }

      throw new Error("Método de pago no reconocido.");
    } catch (error: any) {
      console.error("Error de pago:", error);
      setIsPaymentLoading(false);

      // Manejo robusto de errores
      let errorMsg = error.message || "Hubo un problema al iniciar el pago.";
      if (error.response?.data?.error) errorMsg = error.response.data.error;
      if (error.response?.data?.details)
        errorMsg += `: ${error.response.data.details}`;

      showToast(errorMsg, "payment_error" as any);
    }
  };

  if (authLoading || !availablePlans) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentDisplayPrice =
    billingInterval === "monthly"
      ? priceConfig.monthly
      : priceConfig.yearly_monthly_equivalent;

  const currentOriginalPrice =
    billingInterval === "monthly"
      ? priceConfig.monthlyOriginal
      : priceConfig.yearlyOriginal
        ? priceConfig.yearlyOriginal / 12
        : priceConfig.monthly;

  const premiumBenefitsList = [
    {
      icon: "💬",
      title:
        premiumConfig.access?.daily_limit > 100
          ? "Inspiración Ilimitada"
          : `${premiumConfig.access?.daily_limit} mensajes diarios`,
      desc: "Nunca te quedes sin palabras.",
    },
    {
      icon: "✨",
      title: "Editor Mágico",
      desc: "La IA pule tus textos manteniendo tu esencia.",
    },
    {
      icon: "🧠",
      title: "Guardián de Sentimientos",
      desc: "Inteligencia emocional para tus relaciones.",
    },
    {
      icon: "🌎",
      title: "Acento Local",
      desc: "Conecta auténticamente con modismos.",
    },
    {
      icon: "⏰",
      title: "Fechas Importantes",
      desc: "Recordatorios para momentos especiales.",
    },
    {
      icon: "🔓",
      title: "Versatilidad Total",
      desc: "Acceso a todos los tonos.",
    },
    {
      icon: "🚫",
      title: "Sin anuncios",
      desc: "Experiencia limpia sin marcas de agua.",
    },
    {
      icon: "🛟",
      title: "Soporte prioritario",
      desc: "Ayuda rápida cuando la necesites.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
          Elige tu nivel de{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Magia
          </span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Desbloquea todo el potencial de nuestra IA y crea mensajes ilimitados.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center relative">
          <button
            onClick={() => setBillingInterval("monthly")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              billingInterval === "monthly"
                ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingInterval("yearly")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              billingInterval === "yearly"
                ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Anual
            {priceConfig.discountPercentage > 0 && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full">
                -{priceConfig.discountPercentage}%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Plan Tabs (Toggle) */}
      <div className="flex justify-center mb-12">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex w-full max-w-2xl gap-1">
          <button
            onClick={() => setActiveTab("free")}
            className={`flex-1 py-3 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === "free" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
          >
            Gratis
          </button>
          <button
            onClick={() => {
              setActiveTab("premium_lite");
              setSelectedPlan("premium_lite");
            }}
            className={`flex-1 py-3 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === "premium_lite" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
          >
            Premium Lite 💡
          </button>
          <button
            onClick={() => {
              setActiveTab("premium");
              setSelectedPlan("premium");
            }}
            className={`flex-1 py-3 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === "premium" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
          >
            Premium Pro ✨
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto pb-24 md:pb-12">
        {/* Premium Lite Plan */}
        {activeTab === "premium_lite" && (
          <PlanCard
            title="Premium Lite"
            description="Ideal para usuarios dedicados."
            tag={{
              text: isOfferActive
                ? "⭐ OFERTA ESPECIAL"
                : "⭐ Mejor Relación Precio-Valor",
              gradientClasses: "from-amber-500 to-orange-500",
            }}
            priceDisplay={
              <>
                <span className="text-5xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                  {formatPrice(
                    billingInterval === "monthly"
                      ? priceConfigLite.monthly
                      : priceConfigLite.yearly_monthly_equivalent,
                  )}
                </span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  /mes
                </span>
              </>
            }
            offer={
              priceConfigLite.monthlyOriginal && isOfferActive
                ? {
                    originalPrice: priceConfigLite.monthlyOriginal,
                    label:
                      priceConfigLite.offerDuration > 0
                        ? `OFERTA POR ${priceConfigLite.offerDuration} MESES`
                        : "OFERTA LIMITADA",
                    endDate: priceConfigLite.offerEndDate,
                  }
                : undefined
            }
            yearlyInfo={
              billingInterval === "yearly"
                ? {
                    price: priceConfigLite.yearly,
                    savings: priceConfigLite.yearlySavings,
                  }
                : undefined
            }
            benefits={[
              { icon: "💬", title: "20 mensajes/día" },
              { icon: "🧠", title: "Contexto personalizado" },
              { icon: "🎨", title: "Mayoría de tonos" },
              { icon: "🚫", title: "Sin anuncios" },
            ]}
            onSubscribe={() => setIsPaymentModalOpen(true)}
            ctaClasses="bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            containerClasses="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 rounded-[2.5rem] border-2 border-amber-300 dark:border-amber-600"
            tagColorClasses="border-amber-700"
          />
        )}

        {/* Premium Pro Plan */}
        {activeTab === "premium" && (
          <PlanCard
            title="Premium Pro"
            subtitle="Para creadores de contenido y románticos."
            tag={{
              text: isOfferActive ? "🔥 Oferta Especial" : "Recomendado",
              gradientClasses: isOfferActive
                ? "from-rose-600 to-orange-600"
                : "from-blue-600 to-purple-600",
              extraClasses: "border-slate-800",
            }}
            priceDisplay={
              <>
                <span className="text-5xl font-black text-white tracking-tight">
                  {formatPrice(currentDisplayPrice)}
                </span>
                <span className="text-slate-500 font-medium">/mes</span>
              </>
            }
            offer={
              currentOriginalPrice
                ? {
                    originalPrice: currentOriginalPrice,
                    label: isOfferActive
                      ? billingInterval === "yearly"
                        ? "OFERTA PRIMER AÑO"
                        : priceConfig.offerDuration > 0
                          ? `OFERTA POR ${priceConfig.offerDuration} MESES`
                          : "OFERTA LIMITADA"
                      : `AHORRAS ${priceConfig.discountPercentage}%`,
                    endDate: isOfferActive
                      ? priceConfig.offerEndDate
                      : undefined,
                  }
                : undefined
            }
            yearlyInfo={
              billingInterval === "yearly"
                ? {
                    price: priceConfig.yearly,
                    savings: priceConfig.yearlySavings,
                  }
                : undefined
            }
            benefits={premiumBenefitsList}
            onSubscribe={() => setIsPaymentModalOpen(true)}
            ctaClasses="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            containerClasses="bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] border border-slate-800 dark:border-slate-700 shadow-2xl shadow-blue-900/20 dark:shadow-none"
            benefitTextClasses="text-white"
          />
        )}

        {/* Free Plan */}
        {activeTab === "free" && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col animate-fade-in">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Gratis
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Para uso casual y esporádico.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  $0
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  /mes
                </span>
              </div>
            </div>

            <ul className="space-y-4 mb-6 md:mb-8 flex-1">
              <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <span className="text-green-500 text-xl">✓</span>
                <span>
                  {freeConfig.access?.daily_limit ?? 5} mensajes diarios
                </span>
              </li>
              <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <span className="text-green-500 text-xl">✓</span>
                <span>Tonos básicos</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <span
                  className={`${!freeConfig.monetization?.show_ads ? "text-green-500" : "text-slate-300 dark:text-slate-600"} text-xl`}
                >
                  {!freeConfig.monetization?.show_ads ? "✓" : "✕"}
                </span>
                <span>Sin anuncios</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <span
                  className={`${freeConfig.access?.exclusive_tones === "all" ? "text-green-500" : "text-slate-300 dark:text-slate-600"} text-xl`}
                >
                  {freeConfig.access?.exclusive_tones === "all" ? "✓" : "✕"}
                </span>
                <span>Tonos exclusivos</span>
              </li>
            </ul>

            <button
              disabled={true}
              className="w-full py-4 rounded-2xl font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-default"
            >
              {planLevel === "freemium" || planLevel === "guest"
                ? "Tu plan actual"
                : "Incluido"}
            </button>
          </div>
        )}
      </div>

      {/* Sticky Call to Action (Solo Premium - Solo Móvil) 
      {activeTab === "premium" && planLevel !== "premium" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-40 animate-slide-up-mobile md:hidden">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>✨</span> Suscribirse Ahora
            </button>
          </div>
        </div>
      )}*/}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsPaymentModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-md p-6 sm:p-8 relative animate-slide-up-mobile sm:animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 text-center">
              Elige tu método de pago
            </h3>

            <PaymentGateways
              onSelectGateway={handleSubscribe}
              isLoading={isPaymentLoading}
              planLevel={planLevel}
            />

            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="mt-4 w-full py-3 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
