'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import WebRTCCallModal from '@/components/WebRTCCallModal';
import { usePusherCall } from '@/hooks/usePusherCall';
import { CallResponse } from '@/services/callService';

const CallPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { initiateCall, currentCall, endCall } = usePusherCall();
  
  const [isInitiating, setIsInitiating] = useState(false);
  const [callData, setCallData] = useState<CallResponse | null>(null);
  const hasInitiatedCall = useRef(false);

  // Get call parameters from URL
  const calleeEmail = searchParams.get('calleeEmail');
  const callType = searchParams.get('type') as 'video' | 'voice';
  const vendorName = searchParams.get('vendorName');
  const productName = searchParams.get('productName');

  useEffect(() => {
    // Prevent re-rendering and re-initiating call on page reload
    if (hasInitiatedCall.current) {
      return;
    }

    // Redirect if no session or missing parameters
    if (!session?.user?.email) {
      router.push('/auth/signin');
      return;
    }

    if (!calleeEmail || !callType) {
      router.push('/');
      return;
    }

    // Prevent calling yourself
    if (session.user.email === calleeEmail) {
      router.push('/');
      return;
    }

    // Initiate the call only once
    const startCall = async () => {
      if (hasInitiatedCall.current) return;
      
      hasInitiatedCall.current = true;
      setIsInitiating(true);
      
      try {
        await initiateCall(calleeEmail, callType);
      } catch (error) {
        console.error('Failed to initiate call:', error);
        hasInitiatedCall.current = false;
        router.push('/');
      } finally {
        setIsInitiating(false);
      }
    };

    startCall();
  }, [session?.user?.email, calleeEmail, callType, router, initiateCall]);

  // Update call data when currentCall changes
  useEffect(() => {
    if (currentCall) {
      setCallData(currentCall);
    }
  }, [currentCall]);

  const handleCloseCall = async () => {
    if (currentCall) {
      try {
        await endCall(currentCall.roomName);
      } catch (error) {
        console.error('Failed to end call:', error);
      }
    }
    hasInitiatedCall.current = false;
    // Route back to previous page instead of home
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // Show loading while initiating call
  if (isInitiating || !callData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">
            Initiating {callType} call...
          </h2>
          <p className="text-gray-300">
            Calling {vendorName || calleeEmail}
          </p>
          {productName && (
            <p className="text-sm text-gray-400 mt-2">
              Regarding: {productName}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <WebRTCCallModal
        isOpen={true}
        call={callData}
        isInitiator={true}
        onClose={handleCloseCall}
      />
    </div>
  );
};

export default CallPage;