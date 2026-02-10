import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import confetti from "canvas-confetti";

const SuccessPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Stripe
  const sessionId = searchParams.get("session_id");
  
  // Mercado Pago
  const paymentId = searchParams.get("payment_id");
  const statusMP = searchParams.get("status") || searchParams.get("collection_status");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!sessionId && !paymentId) {
      navigate("/");
      return;
    }

    const verifyPayment = async () => {
      try {
        // Esperamos un momento breve para dar tiempo al Webhook de Stripe de procesar el evento en el backend
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Forzamos la actualización del usuario para obtener el nuevo planLevel (Premium)
        await refreshUser();

        // Validación adicional para Mercado Pago
        if (paymentId && statusMP && statusMP !== "approved") {
           console.warn("Pago de MercadoPago no aprobado:", statusMP);
           setStatus("error");
           return;
        }

        setStatus("success");

        // Efecto de celebración con confeti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = {
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 0,
        };
        const randomInRange = (min: number, max: number) =>
          Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          const particleCount = 50 * (timeLeft / duration);
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          });
        }, 250);
      } catch (error) {
        console.error("Error verificando pago:", error);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [sessionId, paymentId, statusMP, refreshUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 animate-fade-in-up">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 max-w-lg w-full text-center border border-slate-100 relative overflow-hidden">
        {status === "loading" && (
          <div className="animate-pulse">
            <div className="text-6xl mb-6">🔄</div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Confirmando tu magia...
            </h2>
            <p className="text-slate-500 font-medium">
              Estamos activando tu cuenta Premium.
            </p>
          </div>
        )}

        {status === "success" && (
          <>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="text-7xl mb-6 animate-bounce">✨</div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              ¡Ya eres{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Premium!
              </span>
            </h1>
            <p className="text-slate-600 mb-8 text-lg leading-relaxed">
              Gracias por tu apoyo. Ahora tienes acceso ilimitado a todos los
              tonos, ocasiones y sin anuncios.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-600 hover:shadow-blue-500/30 transition-all active:scale-[0.98] text-lg"
            >
              Empezar a crear magia
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-6">⏳</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Casi listo...
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              {paymentId && statusMP !== "approved" 
                ? "El pago está en proceso o fue rechazado. Por favor verifica en unos minutos."
                : "Tu pago se ha procesado, pero el sistema está tardando un poco en actualizar tu cuenta. No te preocupes, recibirás un correo de confirmación."}
            </p>
            <button
              onClick={() => {
                refreshUser();
                navigate("/");
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              Ir al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
