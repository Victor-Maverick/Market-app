//hooks/useWebRTCCall.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useCallPresence } from '../providers/CallPresenceProvider';

export const useWebRTCCall = () => {
  const { data: session } = useSession();
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [pendingCalls, setPendingCalls] = useState<any[]>([]);
  
  // Use the unified call WebSocket from CallPresenceProvider
  const { 
    incomingCall, 
    currentCall, 
    dismissIncomingCall: dismissCall,
    isConnected,
    lastError
  } = useCallPresence();

  const fetchPendingCalls = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/calls/pending?vendorEmail=${session.user.email}`
      );

      if (response.ok) {
        const calls = await response.json();
        setPendingCalls(calls);
      }
    } catch (error) {
      console.error('Failed to fetch pending calls:', error);
    }
  }, [session?.user?.email]);

  // Handle custom events for opening call modal
  useEffect(() => {
    const handleOpenWebRTCCall = (event: CustomEvent) => {
      setIsCallModalOpen(true);
    };
    window.addEventListener('openWebRTCCall', handleOpenWebRTCCall as EventListener);
    
    return () => {
      window.removeEventListener('openWebRTCCall', handleOpenWebRTCCall as EventListener);
    };
  }, []);

  // Auto-open modal when there's a current call
  useEffect(() => {
    if (currentCall) {
      setIsCallModalOpen(true);
    }
  }, [currentCall]);

  const dismissIncomingCall = useCallback(() => {
    dismissCall();
  }, [dismissCall]);

  const closeCallModal = useCallback(() => {
    setIsCallModalOpen(false);
  }, []);

  return {
    incomingCall,
    currentCall,
    isCallModalOpen,
    dismissIncomingCall,
    closeCallModal,
    isConnected,
    lastError,
    pendingCalls,
    fetchPendingCalls
  };
};