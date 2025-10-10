'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Phone, Video } from 'lucide-react';
import { useCallPresence } from '@/providers/CallPresenceProvider';
import { toast } from 'react-toastify';

interface WebRTCCallButtonsProps {
  calleeEmail: string;
  className?: string;
}

const WebRTCCallButtons: React.FC<WebRTCCallButtonsProps> = ({
  calleeEmail,
  className = ""
}) => {
  const { data: session } = useSession();
  const { isConnected } = useCallPresence();
  const router = useRouter();

  const handleVoiceCall = () => {
    if (!session?.user?.email) {
      toast.error('Please log in to make calls');
      return;
    }

    if (!isConnected) {
      toast.error('Call service not connected. Please try again.');
      return;
    }

    if (session.user.email === calleeEmail) {
      toast.error('You cannot call yourself');
      return;
    }

    // Redirect to call page with parameters
    const params = new URLSearchParams({
      calleeEmail: calleeEmail,
      type: 'voice'
    });

    router.push(`/call?${params.toString()}`);
  };

  const handleVideoCall = () => {
    if (!session?.user?.email) {
      toast.error('Please log in to make calls');
      return;
    }

    if (!isConnected) {
      toast.error('Call service not connected. Please try again.');
      return;
    }

    if (session.user.email === calleeEmail) {
      toast.error('You cannot call yourself');
      return;
    }
    // Redirect to call page with parameters
    const params = new URLSearchParams({
      calleeEmail: calleeEmail,
      type: 'video'
    });

    router.push(`/call?${params.toString()}`);
  };

  // Don't show call buttons for ADMIN users or if no session/same user
  if (!session?.user?.email || 
      session.user.email === calleeEmail || 
      session.user.roles?.includes('ADMIN')) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row gap-3 w-full ${className}`}>
      <button
        onClick={handleVoiceCall}
        disabled={!isConnected}
        className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-[14px] transition-all duration-200 transform hover:scale-105 font-medium text-sm shadow-lg hover:shadow-xl min-w-[140px] w-full sm:w-[165px] h-[48px] ${
          isConnected
            ? 'bg-green-400 hover:bg-green-500 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={isConnected ? 'Voice Call' : 'Call service not connected'}
      >
        <Phone className="w-4 h-4" />
        <span className="text-[15px] font-bold">Voice Call</span>
      </button>
      
      <button
        onClick={handleVideoCall}
        disabled={!isConnected}
        className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-[14px] transition-all duration-200 transform hover:scale-105 font-medium text-sm shadow-lg hover:shadow-xl min-w-[140px] w-full sm:w-[165px] h-[48px] ${
          isConnected
            ? 'bg-blue-400 hover:bg-blue-500 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={isConnected ? 'Video Call' : 'Call service not connected'}
      >
        <Video className="w-4 h-4" />
        <span className="text-[15px] font-bold">Video Call</span>
      </button>
    </div>
  );
};

export default WebRTCCallButtons;