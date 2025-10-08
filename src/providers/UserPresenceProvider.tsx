'use client';

import React from 'react';
import { useUserPresence } from '@/hooks/useUserPresence';

interface UserPresenceProviderProps {
  children: React.ReactNode;
}

export const UserPresenceProvider: React.FC<UserPresenceProviderProps> = ({ children }) => {
  useUserPresence();

  return <>{children}</>;
};