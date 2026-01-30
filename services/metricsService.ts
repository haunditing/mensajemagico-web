
import { CONFIG } from '../config';

/**
 * MetricsService - Gestión de conteos globales aproximados y volátiles.
 */

let sessionMessages = 0;

export const getEstimatedActiveUsers = (): number => {
  const hour = new Date().getHours();
  const baseTraffic = [
    40, 30, 20, 15, 10, 15, 30, 60, 100, 150, 200, 250, 
    300, 320, 280, 260, 300, 450, 600, 750, 850, 700, 500, 200
  ];
  
  const base = baseTraffic[hour] || 100;
  const jitter = Math.floor(Math.random() * (base * 0.1));
  return base + jitter;
};

export const getEstimatedDailyMessages = (): string => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const secondsSinceStart = Math.floor((now.getTime() - startOfDay) / 1000);
  
  // Utilizamos el factor definido en CONFIG
  const factor = CONFIG.METRICS.GLOBAL_ESTIMATE_FACTOR;
  const estimatedGlobal = Math.floor(secondsSinceStart * factor); 
  const total = estimatedGlobal + sessionMessages;
  
  return total.toLocaleString();
};

export const incrementGlobalCounter = () => {
  sessionMessages++;
};
