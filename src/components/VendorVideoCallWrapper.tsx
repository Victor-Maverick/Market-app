'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useWebRTCCall } from '../hooks/useWebRTCCall';
import CallNotificationBadge from './CallNotificationBadge';
import WebRTCCallModal from './WebRTCCallModal';
import { webRTCCallService } from '../services/callService';

interface VendorVideoCallWrapperProps {
  children: React.ReactNode;
}

const VendorVideoCallWrapper: React.FC<VendorVideoCallWrapperProps> = ({ children }) => {
  const { data: session } = useSession();
  const {
    incomingCall,
    currentCall,
    isCallModalOpen,
    dismissIncomingCall,
    closeCallModal
  } = useWebRTCCall();

  const handleAcceptCall = async () => {
    if (!incomingCall || !session?.user?.email) return;

    try {
      const response = await webRTCCallService.acceptCall(incomingCall.roomName, incomingCall.callerEmail, session.user.email, incomingCall.type);
      
      // Open call modal with vendor's access token
      window.dispatchEvent(new CustomEvent('openWebRTCCall', {
        detail: {
          call: response,
          isInitiator: false
        }
      }));

      dismissIncomingCall();
    } catch (error) {
      console.error('Failed to answer call:', error);
      dismissIncomingCall();
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCall || !session?.user?.email) return;

    try {
      await webRTCCallService.declineCall(incomingCall.roomName, incomingCall.callerEmail, session.user.email, incomingCall.type);
    } catch (error) {
      console.error('Failed to reject call:', error);
    }

    dismissIncomingCall();
  };

  return (
    <>
      {children}
      
      {/* Call Notifications - Show badge for vendor pages */}
      {incomingCall && (
        <CallNotificationBadge
          incomingCall={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
      
      {/* Call Modal */}
      {isCallModalOpen && currentCall && (
        <WebRTCCallModal
          isOpen={isCallModalOpen}
          call={currentCall}
          isInitiator={false}
          onClose={closeCallModal}
        />
      )}
    </>
  );
};

export default VendorVideoCallWrapper;