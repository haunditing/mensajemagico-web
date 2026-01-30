
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CountryCode } from '../types';
import { getCurrentCountry as getInitialCountry, setUserCountry as saveCountry } from '../services/localizationService';

interface LocalizationContextType {
  country: CountryCode;
  setCountry: (country: CountryCode) => void;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [country, setCountryState] = useState<CountryCode>(getInitialCountry());

  const setCountry = (newCountry: CountryCode) => {
    saveCountry(newCountry); // Persiste en localStorage
    setCountryState(newCountry);
  };

  return (
    <LocalizationContext.Provider value={{ country, setCountry }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization debe usarse dentro de un LocalizationProvider');
  }
  return context;
};
