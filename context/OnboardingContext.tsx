import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface OnboardingContextType {
  shouldShowQuickStart: boolean;
  completeQuickStart: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Quick Start - solo mostrar para usuarios totalmente nuevos
  const [shouldShowQuickStart, setShouldShowQuickStart] = useState<boolean>(() => {
    // No mostrar si ya completó quickstart o si ya usó la app
    const quickStartCompleted = localStorage.getItem('quickstart_completed');
    const hasGeneratedBefore = localStorage.getItem('has_generated_message');
    const hasDismissedModal = sessionStorage.getItem('quickstart_dismissed');
    return !quickStartCompleted && !hasGeneratedBefore && !hasDismissedModal;
  });

  const completeQuickStart = useCallback(() => {
    localStorage.setItem('quickstart_completed', 'true');
    sessionStorage.setItem('quickstart_dismissed', 'true');
    setShouldShowQuickStart(false);
    
    // Track completion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'quickstart_flow_completed', {
        event_category: 'onboarding'
      });
    }
  }, []);

  const value = useMemo(() => ({
    shouldShowQuickStart,
    completeQuickStart,
  }), [shouldShowQuickStart, completeQuickStart]);

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