import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface OnboardingContextType {
  activeTour: string | null;
  currentStepIndex: number;
  startTour: (tourId: string) => void;
  nextStep: (expectedCurrentIndex?: number) => void;
  skipTour: () => void;
  isTourCompleted: (tourId: string) => boolean;
  resetTour: (tourId: string) => void;
  goToStep: (index: number) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Inicializar desde sessionStorage para persistir entre navegaciones (Home -> Generator)
  const [activeTour, setActiveTour] = useState<string | null>(() => {
    return sessionStorage.getItem('onboarding_active_tour');
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    const saved = sessionStorage.getItem('onboarding_step_index');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [completedTours, setCompletedTours] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('onboarding_completed_tours');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('onboarding_completed_tours', JSON.stringify(completedTours));
  }, [completedTours]);

  // Persistir estado activo
  useEffect(() => {
    if (activeTour) {
      sessionStorage.setItem('onboarding_active_tour', activeTour);
      sessionStorage.setItem('onboarding_step_index', currentStepIndex.toString());
    } else {
      sessionStorage.removeItem('onboarding_active_tour');
      sessionStorage.removeItem('onboarding_step_index');
    }
  }, [activeTour, currentStepIndex]);

  const startTour = useCallback((tourId: string) => {
    if (!completedTours.includes(tourId)) {
      setActiveTour(tourId);
      setCurrentStepIndex(0);
    }
  }, [completedTours]);

  const nextStep = useCallback((expectedCurrentIndex?: number) => {
    // Si estamos en el paso 0 (Home) y avanzamos, navegar a la ocasión por defecto (Pensamiento)
    // Solo si NO estamos ya en una ruta de mensajes (para permitir navegación manual)
    if (currentStepIndex === 0 && activeTour === 'onboarding_tour' && !location.pathname.includes('/mensajes/')) {
      navigate('/mensajes/pensamiento-del-dia');
    }

    setCurrentStepIndex((prev) => {
      if (expectedCurrentIndex !== undefined && prev !== expectedCurrentIndex) return prev;
      return prev + 1;
    });
  }, [currentStepIndex, activeTour, navigate, location.pathname]);

  const skipTour = useCallback(() => {
    if (activeTour) {
      setCompletedTours((prev) => [...prev, activeTour]);
      setActiveTour(null);
      setCurrentStepIndex(0);
    }
  }, [activeTour]);

  const isTourCompleted = useCallback((tourId: string) => completedTours.includes(tourId), [completedTours]);

  const resetTour = useCallback((tourId: string) => {
    setCompletedTours((prev) => prev.filter((id) => id !== tourId));
    setActiveTour(null);
    setCurrentStepIndex(0);
  }, []);

  const goToStep = useCallback((index: number) => {
    setCurrentStepIndex(index);
  }, []);

  const value = useMemo(() => ({
    activeTour, currentStepIndex, startTour, nextStep, skipTour, isTourCompleted, resetTour, goToStep
  }), [activeTour, currentStepIndex, startTour, nextStep, skipTour, isTourCompleted, resetTour, goToStep]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
};