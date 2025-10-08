//components/IncomingCallNotification.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { webRTCCallService, CallResponse } from '../services/callService';
import { AudioUtils } from '../utils/audioUtils';

interface IncomingCallNotificationProps {
  incomingCall: CallResponse | null;
  onDismiss: () => void;
}

const IncomingCallNotification: React.FC<IncomingCallNotificationProps> = ({
  incomingCall,
  onDismiss
}) => {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (incomingCall) {
      setIsVisible(true);
      // Play incoming call sound
      AudioUtils.playIncomingCallSound();
      
      // Auto-dismiss after 45 seconds to match backend timeout
      const timeout = setTimeout(() => {
        handleDecline();
      }, 45000);

      return () => clearTimeout(timeout);
    } else {
      setIsVisible(false);
    }
  }, [incomingCall]);

  const handleAccept = async () => {
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

      onDismiss();
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to answer call:', error);
      onDismiss();
      setIsVisible(false);
    }
  };

  const handleDecline = async () => {
    if (!incomingCall || !session?.user?.email) return;

    try {
      await webRTCCallService.declineCall(incomingCall.roomName, incomingCall.callerEmail, session.user.email, incomingCall.type);
    } catch (error) {
      console.error('Failed to reject call:', error);
    }

    onDismiss();
    setIsVisible(false);
  };

  if (!isVisible || !incomingCall) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg animate-slide-down">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {incomingCall.type === 'video' ? (
                <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              ) : (
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base sm:text-lg truncate">
                Incoming {incomingCall.type} call
              </h3>
              <p className="text-blue-100 text-sm truncate">
                From: {incomingCall.callerName}
              </p>
              <p className="text-blue-100 text-xs truncate sm:hidden">
                {incomingCall.callerEmail}
              </p>
              {incomingCall.message && (
                <p className="text-blue-100 text-xs truncate">
                  Message: {incomingCall.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={handleAccept}
              className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-full flex items-center justify-center space-x-1 sm:space-x-2 transition-colors duration-200 flex-1 sm:flex-none touch-manipulation"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm sm:text-base">Accept</span>
            </button>
            
            <button
              onClick={handleDecline}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-full flex items-center justify-center space-x-1 sm:space-x-2 transition-colors duration-200 flex-1 sm:flex-none touch-manipulation"
            >
              <PhoneOff className="w-4 h-4" />
              <span className="text-sm sm:text-base">Decline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallNotification;