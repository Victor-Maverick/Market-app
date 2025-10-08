//components/CallNotificationBadge.tsx
'use client';

import React from 'react';
import { Phone, Video } from 'lucide-react';
import { CallResponse } from '../services/callService';

interface CallNotificationBadgeProps {
  incomingCall: CallResponse;
  onAccept: () => void;
  onReject: () => void;
}

const CallNotificationBadge: React.FC<CallNotificationBadgeProps> = ({
  incomingCall,
  onAccept,
  onReject
}) => {
  return (
    <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 sm:p-4 w-[calc(100vw-16px)] sm:w-auto sm:max-w-sm animate-slide-in-right">
      <div className="flex items-start space-x-2 sm:space-x-3">
        <div className="flex-shrink-0">
          {incomingCall.type === 'video' ? (
            <Video className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          ) : (
            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 animate-pulse" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-medium text-gray-900">
            Incoming {incomingCall.type} call
          </h4>
          <p className="text-xs sm:text-sm text-gray-600 truncate">
            From: {incomingCall.callerName}
          </p>
          {incomingCall.message && (
            <p className="text-xs text-gray-500 truncate">
              Message: {incomingCall.message}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-3">
        <button
          onClick={onReject}
          className="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-md transition-colors touch-manipulation"
        >
          Decline
        </button>
        <button
          onClick={onAccept}
          className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-green-500 hover:bg-green-600 active:bg-green-700 rounded-md transition-colors touch-manipulation"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CallNotificationBadge;