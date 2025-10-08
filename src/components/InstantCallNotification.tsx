'use client';

import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Video, X } from 'lucide-react';
import { CallResponse } from '../services/callService';
import { AudioUtils } from '../utils/audioUtils';

interface InstantCallNotificationProps {
  isVisible: boolean;
  call: CallResponse | null;
  onAccept: () => void;
  onDecline: () => void;
  onDismiss: () => void;
}

const InstantCallNotification: React.FC<InstantCallNotificationProps> = ({
  isVisible,
  call,
  onAccept,
  onDecline,
  onDismiss
}) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (isVisible && call) {
      // Play incoming call sound
      AudioUtils.playIncomingCallSound();
      
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Auto-decline when timer reaches 0
            handleDecline();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        AudioUtils.stopIncomingCallSound();
      };
    } else {
      setTimeLeft(30); // Reset timer when not visible
    }
  }, [isVisible, call]);

  const handleAccept = () => {
    AudioUtils.stopIncomingCallSound();
    onAccept();
  };

  const handleDecline = () => {
    AudioUtils.stopIncomingCallSound();
    onDecline();
  };

  const handleDismiss = () => {
    AudioUtils.stopIncomingCallSound();
    onDismiss();
  };

  if (!isVisible || !call) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] transform transition-all duration-300 ease-out animate-pulse">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-80 max-w-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {call.type === 'video' ? (
                <Video className="w-5 h-5 animate-pulse" />
              ) : (
                <Phone className="w-5 h-5 animate-pulse" />
              )}
              <span className="font-semibold text-sm">
                Incoming {call.type === 'video' ? 'Video' : 'Voice'} Call
              </span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Timer bar */}
          <div className="mt-2">
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className="bg-white h-1 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {call.callerEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {call.callerEmail.split('@')[0]}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {call.callerEmail}
              </p>
            </div>
          </div>

          {/* Timer display */}
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500">
              Auto-decline in {timeLeft}s
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleDecline}
              className="flex-1 flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
              title="Decline call"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Decline</span>
            </button>
            <button
              onClick={handleAccept}
              className={`flex-1 flex items-center justify-center space-x-2 text-white py-3 px-4 rounded-lg transition-colors font-medium ${
                call.type === 'video' 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
              title={`Accept ${call.type} call`}
            >
              {call.type === 'video' ? (
                <Video className="w-4 h-4" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
              <span>Accept</span>
            </button>
          </div>
        </div>

        {/* Pulse animation for urgency */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-blue-500/10 animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default InstantCallNotification;