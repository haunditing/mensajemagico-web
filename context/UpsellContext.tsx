import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UpsellContextType {
  isOpen: boolean;
  message: string;
  triggerUpsell: (message: string) => void;
  closeUpsell: () => void;
}

const UpsellContext = createContext<UpsellContextType | undefined>(undefined);

export const UpsellProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const triggerUpsell = (msg: string) => {
    setMessage(msg);
    setIsOpen(true);
  };

  const closeUpsell = () => {
    setIsOpen(false);
    setMessage('');
  };

  return (
    <UpsellContext.Provider value={{ isOpen, message, triggerUpsell, closeUpsell }}>
      {children}
    </UpsellContext.Provider>
  );
};

export const useUpsell = () => {
  const context = useContext(UpsellContext);
  if (context === undefined) {
    throw new Error('useUpsell must be used within an UpsellProvider');
  }
  return context;
};