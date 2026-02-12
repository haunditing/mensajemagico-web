import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { handleUpgrade } from "../services/paymentService"; // Stripe habilitado
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { ENABLE_UPGRADES } from "../config";
import { useLocalization } from "../context/LocalizationContext";
import { api } from "../context/api";
import PaymentGateways from "../components/PaymentGateways";
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
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

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
      if (document.getElementById('wompi-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'wompi-script';
      script.src = 'https://checkout.wompi.co/widget.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Error cargando Wompi'));
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (gateway: string) => {
    if (!ENABLE_UPGRADES) {
      alert("Las nuevas suscripciones están temporalmente deshabilitadas.");
      return;
    }

    if (!user) {
      navigate("/login", { state: { from: location.pathname } }); // Para volver después del login
      return;
    }

    setIsPaymentLoading(true);
    try {
      // --- 1. Mercado Pago ---
      if (gateway === "mercadopago") {
        const planId = billingInterval === "monthly" ? "premium_monthly" : "premium_yearly";
        
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
          const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
          const redirectUrl = isDev && data.sandbox_init_point ? data.sandbox_init_point : data.init_point;
          window.location.href = redirectUrl;
          return; // Mantenemos loading true mientras redirige
        } else {
          throw new Error("No se pudo obtener el enlace de pago de Mercado Pago.");
        }
      }

      // --- 2. Stripe ---
      if (gateway === "stripe") {
        await handleUpgrade(user._id, billingInterval);
        return; // handleUpgrade maneja la redirección
      }

      // --- 3. Wompi ---
      if (gateway === "wompi") {
        await loadWompiScript();
        
        const planId = billingInterval === "monthly" ? "premium_monthly" : "premium_yearly";
        
        // 1. Obtener datos de firma del backend
        const response = await api.post('/api/checkout', {
          userId: user._id,
          planId
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
            fullName: user.email.split('@')[0], // Fallback simple
          }
        });

        // 3. Abrir Widget
        checkout.open((result: any) => {
          const transaction = result.transaction;
          console.log('Transaction Result:', transaction);
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
      if (error.response?.data?.details) errorMsg += `: ${error.response.data.details}`;
      
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
        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Gratis</h3>
            <p className="text-slate-500">Para uso casual y esporádico.</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">$0</span>
              <span className="text-slate-400 font-medium">/mes</span>
            </div>
          </div>

          <ul className="space-y-4 mb-6 md:mb-8 flex-1">
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
            className="w-full py-4 rounded-2xl font-bold text-slate-400 bg-slate-100 cursor-default"
          >
            {planLevel === "freemium" || planLevel === "guest"
              ? "Tu plan actual"
              : "Incluido"}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-800 shadow-2xl shadow-blue-900/20 flex flex-col relative overflow-hidden">
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

          <ul className="space-y-4 mb-6 md:mb-8 flex-1 relative z-10">
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

          <PaymentGateways 
            onSelectGateway={handleSubscribe} 
            isLoading={isPaymentLoading}
            planLevel={planLevel}
          />

          {/* Background decoration */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
