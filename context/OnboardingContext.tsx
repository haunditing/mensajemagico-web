import React, { createContext, useContext, useState, useEffect } from 'react';

interface OnboardingContextType {
  activeTour: string | null;
  currentStepIndex: number;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  skipTour: () => void;
  isTourCompleted: (tourId: string) => boolean;
  resetTour: (tourId: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const startTour = (tourId: string) => {
    if (!completedTours.includes(tourId)) {
      setActiveTour(tourId);
      setCurrentStepIndex(0);
    }
  };

  const nextStep = () => {
    setCurrentStepIndex((prev) => prev + 1);
  };

  const skipTour = () => {
    if (activeTour) {
      setCompletedTours((prev) => [...prev, activeTour]);
      setActiveTour(null);
      setCurrentStepIndex(0);
    }
  };

  const isTourCompleted = (tourId: string) => completedTours.includes(tourId);

  const resetTour = (tourId: string) => {
    setCompletedTours((prev) => prev.filter((id) => id !== tourId));
    setActiveTour(null);
    setCurrentStepIndex(0);
  };

  return (
    <OnboardingContext.Provider value={{ activeTour, currentStepIndex, startTour, nextStep, skipTour, isTourCompleted, resetTour }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
};