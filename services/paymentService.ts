import { api } from "../context/api";

/**
 * Cancela la suscripción del usuario al final del periodo actual.
 */
export const cancelSubscription = async (userId: string): Promise<any> => {
  return await api.post('/api/payments/cancel-subscription', { userId });
};

/**
 * Obtiene el estado actual de la suscripción.
 */
export const getSubscriptionStatus = async (userId: string): Promise<{ planLevel: string, subscription: any }> => {
  return await api.get(`/api/payments/subscription-status?userId=${userId}`);
};

/**
 * Obtiene el estado de renovación (específico para Wompi).
 */
export const getRenewalStatus = async (userId: string): Promise<{
  needsRenewal: boolean;
  daysUntilExpiration: number | null;
  expirationDate: string | null;
  provider: string | null;
  planLevel: string;
  planInterval: string;
}> => {
  return await api.get(`/api/payments/renewal-status?userId=${userId}`);
};

/**
 * Reactiva una suscripción cancelada (MercadoPago PreApproval).
 */
export const reactivateSubscription = async (userId: string): Promise<any> => {
  return await api.post('/api/payments/reactivate-subscription', { userId });
};