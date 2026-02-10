import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
// import { handleUpgrade } from "../services/paymentService"; // Stripe deshabilitado
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { ENABLE_UPGRADES } from "../config";
import { useLocalization } from "../context/LocalizationContext";
import { api } from "../context/api";

const PricingPage: React.FC = () => {
  const { user, planLevel, availablePlans, isLoading: authLoading } = useAuth();
  const { country } = useLocalization();
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!ENABLE_UPGRADES) {
      alert(
        "Las nuevas suscripciones están temporalmente deshabilitadas por mantenimiento.",
      );
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    setIsPaymentLoading(true);
    try {
      // Integración MercadoPago (Reemplaza a Stripe)
      const planId =
        billingInterval === "monthly" ? "premium_monthly" : "premium_yearly";
      const response = await api.post("/api/mercadopago/create_preference", {
        userId: user._id,
        planId,
        country,
      });

      if (response.init_point) {
        window.location.href = response.init_point;
      }
      // await handleUpgrade(user._id, billingInterval); // Stripe original
    } catch (error) {
      console.error("Error de pago:", error);
      alert("Hubo un problema al iniciar el pago. Por favor intenta de nuevo.");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  if (authLoading || !availablePlans) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const freeConfig = availablePlans.freemium || {};
  const premiumConfig = availablePlans.premium || {};

  // --- Lógica de Precios Localizados ---
  const isColombia = country === "CO";

  const priceConfig = {
    monthly: isColombia
      ? premiumConfig.pricing_hooks?.mercadopago_price_monthly
      : premiumConfig.pricing?.monthly,
    yearly: isColombia
      ? premiumConfig.pricing_hooks?.mercadopago_price_yearly
      : premiumConfig.pricing?.yearly,
    yearly_monthly_equivalent: isColombia
      ? (premiumConfig.pricing_hooks?.mercadopago_price_yearly ?? 0) / 12
      : premiumConfig.pricing?.yearly_monthly_equivalent,
    currency: isColombia ? "COP" : "USD",
    locale: isColombia ? "es-CO" : "en-US",
  };

  // Fallbacks por si la config no carga
  if (!priceConfig.monthly) priceConfig.monthly = isColombia ? 19000 : 4.99;
  if (!priceConfig.yearly) priceConfig.yearly = isColombia ? 190000 : 47.9;
  if (!priceConfig.yearly_monthly_equivalent)
    priceConfig.yearly_monthly_equivalent = isColombia
      ? priceConfig.yearly / 12
      : 3.99;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(priceConfig.locale, {
      style: "currency",
      currency: priceConfig.currency,
      minimumFractionDigits: priceConfig.currency === "COP" ? 0 : 2,
    }).format(amount);
  };

  const currentDisplayPrice =
    billingInterval === "monthly"
      ? priceConfig.monthly
      : priceConfig.yearly_monthly_equivalent;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Elige tu nivel de{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Magia
          </span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          Desbloquea todo el potencial de nuestra IA y crea mensajes ilimitados.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-slate-100 p-1 rounded-xl flex items-center relative">
          <button
            onClick={() => setBillingInterval("monthly")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              billingInterval === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingInterval("yearly")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              billingInterval === "yearly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Anual
            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Gratis</h3>
            <p className="text-slate-500">Para uso casual y esporádico.</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">$0</span>
              <span className="text-slate-400 font-medium">/mes</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-slate-600">
              <span className="text-green-500 text-xl">✓</span>
              <span>
                {freeConfig.access?.daily_limit ?? 5} mensajes diarios
              </span>
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <span className="text-green-500 text-xl">✓</span>
              <span>Tonos básicos</span>
            </li>
            <li className="flex items-center gap-3 text-slate-400">
              <span
                className={`${!freeConfig.monetization?.show_ads ? "text-green-500" : "text-slate-300"} text-xl`}
              >
                {!freeConfig.monetization?.show_ads ? "✓" : "✕"}
              </span>
              <span>Sin anuncios</span>
            </li>
            <li className="flex items-center gap-3 text-slate-400">
              <span
                className={`${freeConfig.access?.exclusive_tones === "all" ? "text-green-500" : "text-slate-300"} text-xl`}
              >
                {freeConfig.access?.exclusive_tones === "all" ? "✓" : "✕"}
              </span>
              <span>Tonos exclusivos</span>
            </li>
          </ul>

          <button
            disabled={true}
            className="w-full py-4 rounded-xl font-bold text-slate-400 bg-slate-100 cursor-default"
          >
            {planLevel === "freemium" || planLevel === "guest"
              ? "Tu plan actual"
              : "Incluido"}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl shadow-blue-900/20 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-bl from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl">
            RECOMENDADO
          </div>

          <div className="mb-8 relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
            <p className="text-slate-400">
              Para creadores de contenido y románticos.
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">
                {formatPrice(currentDisplayPrice)}
              </span>
              <span className="text-slate-500 font-medium">/mes</span>
            </div>
            {billingInterval === "yearly" && (
              <p className="text-xs text-blue-400 mt-2 font-bold">
                Facturado {formatPrice(priceConfig.yearly)} anualmente
              </p>
            )}
          </div>

          <ul className="space-y-4 mb-8 flex-1 relative z-10">
            <li className="flex items-center gap-3 text-slate-200">
              <span className="text-blue-400 text-xl">✓</span>
              <span>
                <strong>
                  {premiumConfig.access?.daily_limit > 100
                    ? "Mensajes ilimitados"
                    : `${premiumConfig.access?.daily_limit} mensajes diarios`}
                </strong>
              </span>
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <span className="text-blue-400 text-xl">✓</span>
              <span>
                Acceso a{" "}
                <strong>
                  {premiumConfig.access?.exclusive_tones === "all"
                    ? "todos las ocasiones y tonos"
                    : "ocasiones y tonos exclusivos"}
                </strong>
              </span>
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <span className="text-blue-400 text-xl">✓</span>
              <span>
                <strong>Recordatorios</strong>
              </span>
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <span className="text-blue-400 text-xl">✓</span>
              <span>
                <strong className="relative inline-flex items-center gap-2">
                  Guardián de Sentimientos
                  <span className="text-lg animate-pulse">🔮</span>
                </strong>{" "}
                (Análisis de relaciones)
              </span>
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <span className="text-blue-400 text-xl">✓</span>
              <span>
                <strong>Editor Mágico</strong> (La IA aprende tu estilo)
              </span>
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <span className="text-blue-400 text-xl">✓</span>
              <span>
                <strong>Modo Regional</strong> (Contexto local inteligente)
              </span>
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <span className="text-blue-400 text-xl">✓</span>
              <span>
                {!premiumConfig.monetization?.show_ads
                  ? "Sin anuncios"
                  : "Con anuncios"}{" "}
                ni marcas de agua
              </span>
            </li>
            <li className="flex items-center gap-3 text-slate-200">
              <span className="text-blue-400 text-xl">✓</span>
              <span>Soporte prioritario</span>
            </li>
          </ul>

          <button
            onClick={handleSubscribe}
            disabled={
              isPaymentLoading || planLevel === "premium" || !ENABLE_UPGRADES
            }
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all relative z-10
              ${
                planLevel === "premium" || !ENABLE_UPGRADES
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
              }`}
          >
            {isPaymentLoading
              ? "Procesando..."
              : !ENABLE_UPGRADES
                ? "No disponible temporalmente"
                : planLevel === "premium"
                  ? "Plan Activo"
                  : "Mejorar ahora"}
          </button>

          {/* Wompi Integration for Colombia */}
          {/* Ocultando Wompi temporalmente
          {country === "CO" && planLevel !== "premium" && ENABLE_UPGRADES && (
            <div className="mt-4 relative z-10 w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px bg-slate-700 flex-1"></div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  O en pesos
                </span>
                <div className="h-px bg-slate-700 flex-1"></div>
              </div>
              <div
                onClickCapture={(e) => {
                  if (!user) {
                    e.stopPropagation();
                    navigate("/login");
                  }
                }}
              >
                <WompiCheckoutButton
                  planId={
                    billingInterval === "monthly"
                      ? "premium_monthly"
                      : "premium_yearly"
                  }
                  className="w-full"
                  buttonText="Pagar con Wompi / Nequi"
                />
              </div>
            </div>
          )} */}

          {/* Background decoration */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>

      <p className="text-center text-slate-400 text-sm mt-12">
        Pagos seguros procesados por MercadoPago. Puedes cancelar en cualquier
        momento.
      </p>
    </div>
  );
};

export default PricingPage;
