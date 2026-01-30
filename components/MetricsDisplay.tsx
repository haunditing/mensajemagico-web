
import React, { useState, useEffect } from 'react';
import { getEstimatedActiveUsers, getEstimatedDailyMessages } from '../services/metricsService';
import { CONFIG } from '../config';

const MetricsDisplay: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState(getEstimatedActiveUsers());
  const [dailyMessages, setDailyMessages] = useState(getEstimatedDailyMessages());

  useEffect(() => {
    // Actualización basada en la configuración global
    const interval = setInterval(() => {
      setActiveUsers(getEstimatedActiveUsers());
      setDailyMessages(getEstimatedDailyMessages());
    }, CONFIG.METRICS.REFRESH_RATE_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-4 px-6 border-t border-slate-100 bg-slate-50/50">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {activeUsers} personas creando magia ahora
        </span>
      </div>
      
      <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
      
      <div className="flex items-center gap-2">
        <span className="text-lg">🪄</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          ~{dailyMessages} mensajes generados hoy
        </span>
      </div>
    </div>
  );
};

export default MetricsDisplay;
