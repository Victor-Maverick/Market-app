'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Phone, Video } from 'lucide-react';
import { useCallPresence } from '@/providers/CallPresenceProvider';
import { toast } from 'react-toastify';

interface WebRTCCallButtonsProps {
  vendorEmail: string;
  vendorName?: string;
  productId?: number;
  shopId?: number;
  productName?: string;
  shopName?: string;
  className?: string;
}

const WebRTCCallButtons: React.FC<WebRTCCallButtonsProps> = ({
  vendorEmail,
  vendorName,
  productId,
  shopId,
  productName,
  shopName,
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

    if (session.user.email === vendorEmail) {
      toast.error('You cannot call yourself');
      return;
    }

    // Redirect to call page with parameters
    const params = new URLSearchParams({
      calleeEmail: vendorEmail,
      type: 'voice',
      ...(vendorName && { vendorName }),
      ...(productName && { productName }),
      ...(shopName && { shopName })
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

    if (session.user.email === vendorEmail) {
      toast.error('You cannot call yourself');
      return;
    }
    // Redirect to call page with parameters
    const params = new URLSearchParams({
      calleeEmail: vendorEmail,
      type: 'video',
      ...(vendorName && { vendorName }),
      ...(productName && { productName }),
      ...(shopName && { shopName })
    });

    router.push(`/call?${params.toString()}`);
  };

  if (!session?.user?.email || session.user.email === vendorEmail) {
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