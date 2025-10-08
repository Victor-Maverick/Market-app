'use client';

import React, { useState } from 'react';
import { Phone, Video, Loader2 } from 'lucide-react';
import { usePusherCall } from '../hooks/usePusherCall';

interface CallButtonProps {
  targetEmail: string;
  type?: 'video' | 'voice';
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const CallButton: React.FC<CallButtonProps> = ({
  targetEmail,
  type = 'video',
  className = '',
  children,
  disabled = false
}) => {
  const { initiateCall } = usePusherCall();
  const [isInitiating, setIsInitiating] = useState(false);

  const handleCall = async () => {
    if (disabled || isInitiating) return;

    setIsInitiating(true);
    try {
      await initiateCall(targetEmail, type);
    } catch (error) {
      console.error('Failed to initiate call:', error);
    } finally {
      setIsInitiating(false);
    }
  };

  const defaultClassName = `
    inline-flex items-center justify-center px-6 py-3 rounded-lg min-w-[140px]
    transition-all duration-200 transform hover:scale-105 font-medium text-sm
    ${type === 'video' 
      ? 'bg-blue-400 hover:bg-blue-500 text-white shadow-lg hover:shadow-xl' 
      : 'bg-green-400 hover:bg-green-500 text-white shadow-lg hover:shadow-xl'
    }
    ${disabled || isInitiating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <button
      onClick={handleCall}
      disabled={disabled || isInitiating}
      className={defaultClassName}
      aria-label={`Start ${type} call with ${targetEmail}`}
    >
      {isInitiating ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : type === 'video' ? (
        <Video className="w-4 h-4 mr-2" />
      ) : (
        <Phone className="w-4 h-4 mr-2" />
      )}
      {children || (isInitiating ? 'Calling...' : `${type === 'video' ? 'Video' : 'Voice'} Call`)}
    </button>
  );
};

export default CallButton;