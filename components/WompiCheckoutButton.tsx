import React, { useState } from "react";
import { api } from "../context/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface WompiCheckoutButtonProps {
  planId: string; // 'premium_monthly' | 'premium_yearly'
  buttonText?: string;
  className?: string;
}

declare global {
  interface Window {
    WidgetCheckout: any;
  }
}

const WompiCheckoutButton: React.FC<WompiCheckoutButtonProps> = ({
  planId,
  buttonText = "Pagar con Wompi",
  className = "",
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

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

  const handlePayment = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Cargar script si no existe
      await loadWompiScript();

      // 2. Obtener datos de transacción del backend
      const data = await api.post<{
        reference: string;
        amountInCents: number;
        currency: string;
        signature: string;
        publicKey: string;
        redirectUrl: string;
      }>("/api/checkout", {
        userId: user._id,
        planId,
      });

      // 3. Configurar Widget
      const checkout = new window.WidgetCheckout({
        currency: data.currency,
        amountInCents: data.amountInCents,
        reference: data.reference,
        publicKey: data.publicKey,
        signature: { integrity: data.signature },
        redirectUrl: data.redirectUrl,
        customerData: {
          email: user.email,
          fullName: user.email.split("@")[0], // Fallback simple
        },
      });

      // 4. Abrir Widget
      checkout.open((result: any) => {
        const transaction = result.transaction;
      });
    } catch (error) {
      console.error("Error en checkout Wompi:", error);
      alert("Error al iniciar el pago con Wompi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`bg-[#10069f] text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-[#1a0e8a] transition-all flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <LoadingSpinner size="sm" color="current" />
      ) : (
        <>
          <span>🇨🇴</span> {buttonText}
        </>
      )}
    </button>
  );
};

export default WompiCheckoutButton;
