'use client';

import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { CallResponse } from '../services/callService';
import { AudioUtils } from '../utils/audioUtils';

interface IncomingCallModalProps {
  isOpen: boolean;
  call: CallResponse;
  onAccept: () => void;
  onDecline: () => void;
  onClose?: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  call,
  onAccept,
  onDecline,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(isOpen);
    if (isOpen) {
      // Only play incoming call sound for the callee (not for notifications)
      // Sound will be controlled by the call management system
      
      // Auto-dismiss after 40 seconds
      const timeout = setTimeout(() => {
        handleDecline();
      }, 40000);

      return () => {
        clearTimeout(timeout);
        // Ensure sounds are stopped when modal closes
        AudioUtils.stopIncomingCallSound();
        AudioUtils.stopRingbackSound();
      };
    } else {
      // Stop all call sounds when modal closes
      AudioUtils.stopIncomingCallSound();
      AudioUtils.stopRingbackSound();
    }
  }, [isOpen]);

  const handleAccept = async () => {
    // Stop all notification sounds when accepting
    AudioUtils.stopIncomingCallSound();
    AudioUtils.stopRingbackSound();
    onAccept();
    setIsVisible(false);
  };

  const handleDecline = async () => {
    // Stop all notification sounds when declining
    AudioUtils.stopIncomingCallSound();
    AudioUtils.stopRingbackSound();
    onDecline();
    setIsVisible(false);
  };

  if (!isVisible || !call) return null;

  return (
    <div className="fixed top-2 sm:top-4 right-2 sm:right-4 left-2 sm:left-auto z-50">
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 overflow-hidden w-full sm:w-80 max-w-sm mx-auto sm:mx-0">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 sm:p-3">
          <h3 className="text-base sm:text-lg font-semibold">Incoming {call.type === 'video' ? 'Video' : 'Voice'} Call</h3>
        </div>
        
        <div className="p-3 sm:p-4">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0 mr-3">
              {call.type === 'video' ? (
                <Video className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 animate-pulse" />
              ) : (
                <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 animate-pulse" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                {call.callerEmail}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {call.type === 'video' ? 'Video Call' : 'Voice Call'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 sm:space-x-3 mt-4">
            <button
              onClick={handleDecline}
              className="flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
              title="Decline call"
            >
              <PhoneOff className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleAccept}
              className={`flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 rounded-full transition-colors ${
                call.type === 'video' 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
              title={`Accept ${call.type} call`}
            >
              {call.type === 'video' ? (
                <Video className="w-5 h-5 text-white" />
              ) : (
                <Phone className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;