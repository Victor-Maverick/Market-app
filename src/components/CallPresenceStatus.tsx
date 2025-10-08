'use client';

import React from 'react';
import { useContext } from 'react';
import { CallPresenceContext } from '@/providers/CallPresenceProvider';

const CallPresenceStatus = () => {
  const { isConnected, lastError } = useContext(CallPresenceContext);

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-white shadow-md rounded-lg z-50">
      <h3 className="text-sm font-medium">WebSocket Status</h3>
      <div className="flex items-center mt-1">
        <div
          className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
        />
        <span className="text-xs">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      {lastError && (
        <div className="mt-1 text-xs text-red-500">{lastError}</div>
      )}
    </div>
  );
};

export default CallPresenceStatus;