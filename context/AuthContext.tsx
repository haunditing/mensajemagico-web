import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';
import { syncUsage, setDailyLimit, resetDailyLimit } from '../services/usageControlService';
import PlanManager from '@/services/PlanManager';

// Definición de tipos alineada con el backend (plans.js)
export type PlanLevel = 'guest' | 'freemium' | 'premium';

export interface MonetizationConfig {
  show_ads: boolean;
  watermark: boolean;
}

export interface PlanAccess {
  daily_limit: number;
  exclusive_tones: boolean | string[];
  occasions: string[] | "all";
  context_words_limit: number;
}

export interface PlanStrategy {
  access: PlanAccess;
  monetization: MonetizationConfig;
  ai_config?: any;
}

export interface User {
  _id: string;
  email: string;
  planLevel: PlanLevel;
  usage: {
    generationsCount: number;
  };
}

interface AuthContextType {
  user: User | null;
  planLevel: PlanLevel;
  isPremium: boolean;
  remainingCredits: number;
  monetization: MonetizationConfig;
  isLoading: boolean;
  availablePlans: any;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Configuración por defecto para usuarios no autenticados (Guest)
const GUEST_MONETIZATION: MonetizationConfig = {
  show_ads: true,
  watermark: true
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [planConfig, setPlanConfig] = useState<PlanStrategy | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [availablePlans, setAvailablePlans] = useState<any>(null);

  // Derivados del estado
  const planLevel = user?.planLevel || 'guest';
  const isPremium = planLevel === 'premium';
  const monetization = planConfig?.monetization || GUEST_MONETIZATION;

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setUser(null);
      setPlanConfig(null);
      setIsLoading(false);
      return;
    }

    try {
      // api.get ya incluye el token de localStorage automáticamente
      const data = await api.get('/api/auth/me');
      setUser(data.user);
      setRemainingCredits(data.remainingCredits);
      setPlanConfig(data.plan);

      // Sincronizar el control de uso local con los datos del backend
      syncUsage(data.user.usage.generationsCount);
      setDailyLimit(data.plan.access.daily_limit);
    } catch (error) {
      console.error("Error fetching user session:", error);
      // Si el token expiró o es inválido (api lanza error en status != 2xx)
        logout();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const config = await api.get('/api/config/plans');
      setAvailablePlans(config.subscription_plans);
      PlanManager.initialize(config);
    } catch (error) {
      console.error("Error fetching plan config:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchConfig();
      await fetchUser();
    };
    init();
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsLoading(true);
    fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPlanConfig(null);
    setRemainingCredits(0);
    resetDailyLimit(); // Volver a límites de invitado
  };

  return (
    <AuthContext.Provider value={{
      user,
      planLevel,
      isPremium,
      remainingCredits,
      monetization,
      isLoading,
      availablePlans,
      login,
      logout,
      refreshUser: fetchUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};