'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  isNavigating: boolean;
  setIsNavigating: (loading: boolean) => void;
  navigationMessage: string;
  setNavigationMessage: (message: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationMessage, setNavigationMessage] = useState('Loading...');

  return (
    <NavigationContext.Provider value={{ 
      isNavigating, 
      setIsNavigating, 
      navigationMessage, 
      setNavigationMessage 
    }}>
      {children}
    </NavigationContext.Provider>
  );
};