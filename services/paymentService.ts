import { api } from "../context/api";

/**
 * Inicia el proceso de actualización a Premium creando una sesión de Checkout en Stripe.
 * @param userId El ID del usuario que se va a suscribir.
 * @param interval El intervalo de facturación: 'monthly' o 'yearly'.
 */
export const handleUpgrade = async (userId: string, interval: 'monthly' | 'yearly'): Promise<void> => {
  try {
    const data = await api.post<{ url: string }>('/api/payments/create-checkout-session', {
      userId,
      interval
    });

    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('No se recibió la URL de redirección de Stripe');
    }
  } catch (error) {
    console.error('Error en handleUpgrade:', error);
    throw error; // Re-lanzamos el error para que el componente UI pueda mostrar una alerta o toast
  }
};

/**
 * Cancela la suscripción del usuario al final del periodo actual.
 */
export const cancelSubscription = async (userId: string): Promise<any> => {
  return await api.post('/api/payments/cancel-subscription', { userId });
};

/**
 * Obtiene el estado actual de la suscripción desde Stripe.
 */
export const getSubscriptionStatus = async (userId: string): Promise<{ planLevel: string, subscription: any }> => {
  return await api.get(`/api/payments/subscription-status?userId=${userId}`);
};

/**
 * Reactiva una suscripción cancelada (pero aún no expirada).
 */
export const reactivateSubscription = async (userId: string): Promise<any> => {
  return await api.post('/api/payments/reactivate-subscription', { userId });
};