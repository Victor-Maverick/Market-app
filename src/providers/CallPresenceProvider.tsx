'use client';

import React, { createContext, useContext } from 'react';
import { usePusherCall } from '../hooks/usePusherCall';
import { CallResponse } from '../services/callService';

interface CallPresenceContextType {
  isConnected: boolean;
  lastError: string | null;
  incomingCall: CallResponse | null;
  currentCall: CallResponse | null;
  initiateCall: (calleeEmail: string, type: 'video' | 'voice') => Promise<void>;
  acceptCall: (roomName: string) => Promise<void>;
  declineCall: (roomName: string) => Promise<void>;
  endCall: (roomName: string) => Promise<void>;
  dismissIncomingCall: () => void;
}

export const CallPresenceContext = createContext<CallPresenceContextType>({
  isConnected: false,
  lastError: null,
  incomingCall: null,
  currentCall: null,
  initiateCall: async () => {},
  acceptCall: async () => {},
  declineCall: async () => {},
  endCall: async () => {},
  dismissIncomingCall: () => {}
});

export const useCallPresence = () => {
  const context = useContext(CallPresenceContext);
  if (!context) {
    throw new Error('useCallPresence must be used within CallPresenceProvider');
  }
  return context;
};

interface CallPresenceProviderProps {
  children: React.ReactNode;
}

export const CallPresenceProvider: React.FC<CallPresenceProviderProps> = ({ children }) => {
  const pusherCall = usePusherCall();

  return (
    <CallPresenceContext.Provider value={pusherCall}>
      {children}
    </CallPresenceContext.Provider>
  );
};