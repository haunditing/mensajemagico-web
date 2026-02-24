
import { CONFIG } from '../config';
import PlanManager from './PlanManager';

// Límite dinámico que puede ser actualizado al iniciar sesión
let currentDailyLimit = CONFIG.USAGE.DAILY_LIMIT;

export const setDailyLimit = (limit: number) => {
  currentDailyLimit = limit;
};

export const resetDailyLimit = () => {
  currentDailyLimit = CONFIG.USAGE.DAILY_LIMIT;
};

export const syncUsage = (count: number) => {
  const dailyKey = `usage_daily_${new Date().toISOString().split('T')[0]}`;
  localStorage.setItem(dailyKey, count.toString());
};

export const canGenerate = (): { allowed: boolean; message?: string; delay?: number } => {
  const now = Date.now();
  
  const lastRequest = Number(sessionStorage.getItem('last_request_time') || 0);
  const timeSinceLast = now - lastRequest;

  if (timeSinceLast < CONFIG.USAGE.MIN_INTERVAL_MS) {
    return { allowed: true, delay: 1000 }; 
  }

  const sessionCount = Number(sessionStorage.getItem('usage_session_count') || 0);
  if (sessionCount >= CONFIG.USAGE.SESSION_LIMIT) {
    return { 
      allowed: false, 
      message: "Límite de sesión alcanzado. Descansa un momento y vuelve a intentar." 
    };
  }

  const dailyKey = `usage_daily_${new Date().toISOString().split('T')[0]}`;
  const dailyCount = Number(localStorage.getItem(dailyKey) || 0);
  
  if (dailyCount >= currentDailyLimit) {
    return { 
      allowed: false, 
      message: PlanManager.getUpsellMessage('on_limit_reached') || "Has agotado tus créditos mágicos diarios. ¡Vuelve mañana!" 
    };
  }

  return { allowed: true };
};

export const recordGeneration = () => {
  const now = Date.now();
  const dailyKey = `usage_daily_${new Date().toISOString().split('T')[0]}`;

  const sessionCount = Number(sessionStorage.getItem('usage_session_count') || 0);
  sessionStorage.setItem('usage_session_count', (sessionCount + 1).toString());
  sessionStorage.setItem('last_request_time', now.toString());

  const dailyCount = Number(localStorage.getItem(dailyKey) || 0);
  localStorage.setItem(dailyKey, (dailyCount + 1).toString());

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('usage_daily_') && key !== dailyKey) {
      localStorage.removeItem(key);
    }
  });
};

// --- Control de Visibilidad de Badges (Nuevo) ---
export const markOccasionVisited = (occasionId: string) => {
  if (typeof window === 'undefined') return;
  const key = `visited_occasion_${occasionId}`;
  if (localStorage.getItem(key) !== 'true') {
    localStorage.setItem(key, 'true');
  }
};

export const shouldShowBadge = (occasionId: string): boolean => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(`visited_occasion_${occasionId}`) !== 'true';
};

export const markToneVisited = (toneId: string) => {
  if (typeof window === 'undefined') return;
  const key = `visited_tone_${toneId}`;
  if (localStorage.getItem(key) !== 'true') {
    localStorage.setItem(key, 'true');
  }
};

export const shouldShowToneBadge = (toneId: string): boolean => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(`visited_tone_${toneId}`) !== 'true';
};
