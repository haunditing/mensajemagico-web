import PlanManager from "../services/PlanManager";
import { useAuth } from "../context/AuthContext";

/**
 * Hook para acceder fácilmente a las características del plan actual.
 * Ejemplo: const dailyLimit = useFeature('access.daily_limit');
 */
export const useFeature = <T = any>(
  featurePath: string,
  defaultValue?: T,
): T => {
  const { planLevel, availablePlans } = useAuth();

  // Si la configuración aún no ha cargado, devolvemos undefined o el valor por defecto
  if (!availablePlans) {
    return defaultValue as T;
  }

  const value = PlanManager.getPlanFeature(planLevel, featurePath);
  return value !== undefined ? value : defaultValue;
};
