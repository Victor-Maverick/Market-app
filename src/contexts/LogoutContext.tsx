'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LogoutContextType {
  isLoggingOut: boolean;
  setIsLoggingOut: (loading: boolean) => void;
}

const LogoutContext = createContext<LogoutContextType | undefined>(undefined);

export const useLogout = () => {
  const context = useContext(LogoutContext);
  if (context === undefined) {
    throw new Error('useLogout must be used within a LogoutProvider');
  }
  return context;
};

interface LogoutProviderProps {
  children: ReactNode;
}

export const LogoutProvider: React.FC<LogoutProviderProps> = ({ children }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <LogoutContext.Provider value={{ isLoggingOut, setIsLoggingOut }}>
      {children}
    </LogoutContext.Provider>
  );
};