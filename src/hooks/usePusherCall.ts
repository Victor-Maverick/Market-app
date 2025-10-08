'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { usePusher } from '@/providers/PusherProvider';
import { CallResponse, webRTCCallService } from '@/services/callService';

interface PusherCallHook {
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

export const usePusherCall = (): PusherCallHook => {
  const { data: session } = useSession();
  const { pusher, isConnected } = usePusher();
  const [lastError, setLastError] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallResponse | null>(null);
  const [currentCall, setCurrentCall] = useState<CallResponse | null>(null);

  // Debug: Log Pusher connection status
  useEffect(() => {
    console.log('🔌 Pusher connection status:', isConnected);
    console.log('👤 Current user:', session?.user?.email);
  }, [isConnected, session?.user?.email]);

  const setupCallNotifications = useCallback(() => {
    if (!pusher || !session?.user?.email) return;

    try {
      const channelName = `user-${session.user.email}`;
      // Subscribe to user's public channel for call notifications
      const userChannel = pusher.subscribe(channelName);

      console.log('✅ Successfully subscribed to channel:', channelName);

      // Handle incoming call notifications
      userChannel.bind('incoming-call', (data: CallResponse) => {
        console.log('Incoming call from:', data.callerEmail);
        setIncomingCall(data);
      });

      // Handle call accepted notifications
      userChannel.bind('call-accepted', (data: CallResponse) => {
        console.log('Received call-accepted notification:', data);
        // Update current call status for both parties
        setCurrentCall(prevCall => {
          if (prevCall && prevCall.roomName === data.roomName) {
            return { ...prevCall, status: 'accepted' };
          }
          return data;
        });
        setIncomingCall(null);
      });

      // Handle call declined notifications
      userChannel.bind('call-declined', (data: CallResponse) => {
        setIncomingCall(null);
        setCurrentCall(null);
        // Route back to previous location when call is declined
        if (typeof window !== 'undefined' && window.location.pathname === '/call') {
          window.history.back();
        }
      });

      // Handle call ended notifications
      userChannel.bind('call-ended', (data: CallResponse) => {
        setIncomingCall(null);
        setCurrentCall(null);
        // Route back to previous location when call ends
        if (typeof window !== 'undefined' && window.location.pathname === '/call') {
          window.history.back();
        }
      });

      return () => {
        userChannel.unbind_all();
        pusher.unsubscribe(`user-${session.user.email}`);
      };

    } catch (error) {
      console.error('Error setting up call notifications:', error);
      setLastError('Failed to setup call notifications');
    }
  }, [pusher, session?.user?.email]);

  useEffect(() => {
    if (pusher && session?.user?.email) {
      return setupCallNotifications();
    }
  }, [pusher, session?.user?.email, setupCallNotifications]);

  const initiateCall = useCallback(async (calleeEmail: string, type: 'video' | 'voice') => {
    if (!session?.user?.email) {
      setLastError('User not authenticated');
      return;
    }

    // Clear any previous errors
    setLastError(null);

    try {
      console.log(`🚀 Initiating ${type} call from ${session.user.email} to ${calleeEmail}`);
      console.log('🔌 Pusher connection status:', isConnected);
      console.log('📡 Pusher instance:', pusher ? 'Available' : 'Not available');
      
      const callRequest = {
        callerEmail: session.user.email,
        calleeEmail,
        type,
      };

      console.log('📞 Call request payload:', callRequest);

      // Make the API call - backend creates call and sends notification to callee
      const response = await webRTCCallService.initiateCall(callRequest);

      console.log('✅ Call initiated successfully:', response);
      // Set the call with real data from backend
      setCurrentCall(response);

      console.log('📢 Pusher notification should be sent to callee:', calleeEmail);
      console.log('🔔 Callee should receive notification on channel:', `user-${calleeEmail}`);

      // Verify the call was created by checking if we have a room name
      if (!response.roomName) {
        console.error('❌ No room name received from backend - call may not have been created properly');
        setLastError('Call creation failed - no room name');
        setCurrentCall(null);
        return;
      }

    } catch (error) {
      console.error('❌ Error initiating call:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      
      // Check if it's a network error
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (error.code === 'ERR_CERT_DATE_INVALID' || error.message?.includes('certificate')) {
        setLastError('SSL Certificate Error - Try using HTTP instead of HTTPS');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
      } else if (error.code === 'ERR_NETWORK') {
        setLastError('Network Error - Check if backend server is running');
      } else {
        setLastError('Failed to initiate call');
      }
      
      setCurrentCall(null);
    }
  }, [session?.user?.email, isConnected, pusher]);

  const acceptCall = useCallback(async (roomName: string) => {
    if (!session?.user?.email || !incomingCall) {
      setLastError('User not authenticated or no incoming call');
      return;
    }

    try {
      const response = await webRTCCallService.acceptCall(roomName, incomingCall.callerEmail, session.user.email, incomingCall.type);

      // Set current call for callee - this will open the same modal as caller
      setCurrentCall(response);
      setIncomingCall(null);
      setLastError(null);

    } catch (error) {
      console.error('Error accepting call:', error);
      setLastError('Failed to accept call');
    }
  }, [session?.user?.email, incomingCall]);

  const declineCall = useCallback(async (roomName: string) => {
    if (!session?.user?.email || !incomingCall) {
      setLastError('User not authenticated or no incoming call');
      return;
    }

    try {
      await webRTCCallService.declineCall(roomName, incomingCall.callerEmail, session.user.email, incomingCall.type);

      setIncomingCall(null);

    } catch (error) {
      console.error('Error declining call:', error);
      setLastError('Failed to decline call');
    }
  }, [session?.user?.email, incomingCall]);

  const endCall = useCallback(async (roomName: string) => {
    if (!session?.user?.email || !currentCall) {
      setLastError('User not authenticated or no current call');
      return;
    }

    try {
      await webRTCCallService.endCall(roomName, currentCall.callerEmail, currentCall.calleeEmail, currentCall.timeInitiated, currentCall.type);

      setCurrentCall(null);

    } catch (error) {
      console.error('Error ending call:', error);
      setLastError('Failed to end call');
    }
  }, [session?.user?.email, currentCall]);

  const dismissIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  return {
    isConnected,
    lastError,
    incomingCall,
    currentCall,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    dismissIncomingCall,
  };
};