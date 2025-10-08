'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Pusher from 'pusher-js';

interface PusherContextType {
  pusher: Pusher | null;
  isConnected: boolean;
}

const PusherContext = createContext<PusherContextType>({
  pusher: null,
  isConnected: false,
});

export const usePusher = () => {
  const context = useContext(PusherContext);
  if (!context) {
    throw new Error('usePusher must be used within a PusherProvider');
  }
  return context;
};

interface PusherProviderProps {
  children: React.ReactNode;
}

export function PusherProvider({ children }: PusherProviderProps) {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Pusher without auth
    const pusherInstance = new Pusher('26620ec0c4ea19647ca8', {
      cluster: 'mt1',
      forceTLS: true,
    });

    pusherInstance.connection.bind('connected', () => {
      console.log('Pusher connected');
      setIsConnected(true);
    });

    pusherInstance.connection.bind('disconnected', () => {
      console.log('Pusher disconnected');
      setIsConnected(false);
    });

    pusherInstance.connection.bind('error', (error: any) => {
      // Only log actual errors, not empty objects
      if (error && Object.keys(error).length > 0) {
        console.error('Pusher connection error:', error);
      } else {
        console.log('Pusher connection event (no error details)');
      }
      setIsConnected(false);
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (pusherInstance.connection.state === 'disconnected') {
          console.log('Attempting to reconnect Pusher...');
          pusherInstance.connect();
        }
      }, 3000);
    });

    setPusher(pusherInstance);

    return () => {
      pusherInstance.disconnect();
    };
  }, []);

  return (
    <PusherContext.Provider value={{ pusher, isConnected }}>
      {children}
    </PusherContext.Provider>
  );
}