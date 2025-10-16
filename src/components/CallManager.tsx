'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePusherCall } from '../hooks/usePusherCall';
import WebRTCCallModal from './WebRTCCallModal';
import InstantCallNotification from './InstantCallNotification';

interface CallManagerProps {
  children?: React.ReactNode;
}

const CallManager: React.FC<CallManagerProps> = ({ children }) => {
  const { data: session } = useSession();
  const {
    incomingCall,
    currentCall,
    acceptCall,
    declineCall,
    endCall,
    dismissIncomingCall
  } = usePusherCall();

  const [showInstantNotification, setShowInstantNotification] = useState(false);

  // Handle incoming call notifications - instant top-right notification
  useEffect(() => {
    if (incomingCall && !currentCall) {
      console.log('📞 Showing instant call notification for:', incomingCall.callerEmail);
      setShowInstantNotification(true);
      
      // Ensure the page is focused and visible
      if (document.hidden) {
        // Try to bring the window to focus
        window.focus();
      }
    } else {
      setShowInstantNotification(false);
    }
  }, [incomingCall, currentCall]);

  const handleAcceptCall = async () => {
    if (incomingCall) {
      try {
        // Accept call immediately for instant connection
        await acceptCall(incomingCall.roomName);
        setShowInstantNotification(false);
      } catch (error) {
        console.error('Failed to accept call:', error);
      }
    }
  };

  const handleDeclineCall = async () => {
    if (incomingCall) {
      try {
        await declineCall(incomingCall.roomName);
        setShowInstantNotification(false);
        dismissIncomingCall();
      } catch (error) {
        console.error('Failed to decline call:', error);
      }
    }
  };

  const handleDismissCall = () => {
    setShowInstantNotification(false);
    dismissIncomingCall();
  };

  const handleEndCall = async () => {
    if (currentCall) {
      try {
        await endCall(currentCall.roomName);
      } catch (error) {
        console.error('Failed to end call:', error);
      }
    }
  };

  const handleCloseCallModal = () => {
    // End the call when modal is closed
    if (currentCall) {
      handleEndCall();
    }
    
    // Route back to previous location if on call page
    if (typeof window !== 'undefined' && window.location.pathname === '/call') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
  };



  if (!session?.user?.email) {
    return <>{children}</>;
  }

  // Skip call management for ADMINS and SUPER_ADMINS as they don't receive calls
  const userRoles = session.user.roles || [];
  if (userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN')) {
    return <>{children}</>;
  }

  return (
      <>
        {children}

        {/* Instant Call Notification - Top Right */}
        <InstantCallNotification
          isVisible={showInstantNotification}
          call={incomingCall}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
          onDismiss={handleDismissCall}
        />

        {/* Active Call Modal */}
        {currentCall && (
            <WebRTCCallModal
                isOpen={!!currentCall}
                call={currentCall}
                isInitiator={currentCall.callerEmail === session.user.email}
                onClose={handleCloseCallModal}
            />
        )}
      </>
  );
};

export default CallManager;