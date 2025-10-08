'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Phone } from 'lucide-react';
import { webRTCCallService, CallResponse } from '../services/callService';
import { PendingCallsBadgeSkeleton } from './LoadingSkeletons';

interface PendingCallsBadgeProps {
  className?: string;
}

const PendingCallsBadge: React.FC<PendingCallsBadgeProps> = ({ className = '' }) => {
  const { data: session } = useSession();
  const [pendingCalls, setPendingCalls] = useState<CallResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchPendingCalls = async () => {
      try {
        setIsLoading(true);
        const calls = await webRTCCallService.getPendingCalls(session.user.email);
        setPendingCalls(calls);
      } catch (error) {
        console.error('Failed to fetch pending calls:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingCalls();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCalls, 30000);
    return () => clearInterval(interval);
  }, [session?.user?.email]);

  if (!session?.user?.email) {
    return null;
  }

  if (isLoading) {
    return <PendingCallsBadgeSkeleton />;
  }

  if (pendingCalls.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium">
        <div className="flex items-center space-x-1">
          <Phone className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
          <span className="hidden sm:inline">Pending Calls</span>
          <span className="sm:hidden">Calls</span>
        </div>
        <span className="bg-orange-200 text-orange-900 px-1.5 py-0.5 rounded-full text-xs font-bold min-w-[18px] text-center">
          {pendingCalls.length}
        </span>
      </div>
      
      {/* Tooltip for mobile */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 sm:hidden">
        {pendingCalls.length} pending call{pendingCalls.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default PendingCallsBadge;