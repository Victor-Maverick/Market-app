'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Phone, PhoneCall, PhoneOff, Clock, Calendar } from 'lucide-react';
import { webRTCCallService, CallResponse } from '@/services/callService';
import { CallHistorySkeleton } from '@/components/LoadingSkeletons';
import { toast } from 'react-toastify';

const BuyerCallsPage: React.FC = () => {
  const { data: session } = useSession();
  const [calls, setCalls] = useState<CallResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ANSWERED' | 'MISSED' | 'REJECTED'>('ALL');

  useEffect(() => {
    if (session?.user?.email) {
      fetchCalls();
    }
  }, [session?.user?.email, filter]);

  const fetchCalls = async () => {
    if (!session?.user?.email) return;

    try {
      setLoading(true);
      const callsData = await webRTCCallService.getCallHistory(session.user.email);
      
      // Filter calls based on selected filter
      let filteredCalls = callsData;
      if (filter !== 'ALL') {
        const statusMap: Record<string, string[]> = {
          'ANSWERED': ['accepted', 'active', 'ended'],
          'MISSED': ['initiated'],
          'REJECTED': ['declined']
        };
        const allowedStatuses = statusMap[filter] || [];
        filteredCalls = callsData.filter(call => allowedStatuses.includes(call.status));
      }
      
      setCalls(filteredCalls);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
      toast.error('Failed to load calls');
    } finally {
      setLoading(false);
    }
  };

  const callBack = async (call: CallResponse) => {
    try {
      const callRequest = {
        callerEmail: session?.user?.email || '',
        calleeEmail: call.calleeEmail,
        type: call.type
      };

      const response = await webRTCCallService.initiateCall(callRequest);
      
      // Open call modal
      window.dispatchEvent(new CustomEvent('openWebRTCCall', {
        detail: {
          call: response,
          isInitiator: true
        }
      }));

    } catch (error) {
      console.error('Failed to call back:', error);
      toast.error('Failed to initiate call back');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ANSWERED':
        return <PhoneCall className="w-4 h-4 text-green-500" />;
      case 'MISSED':
        return <Phone className="w-4 h-4 text-red-500" />;
      case 'REJECTED':
        return <PhoneOff className="w-4 h-4 text-red-500" />;
      default:
        return <Phone className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ANSWERED':
        return 'text-green-600 bg-green-50';
      case 'MISSED':
        return 'text-red-600 bg-red-50';
      case 'REJECTED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string | number) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <CallHistorySkeleton itemCount={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Calls</h1>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'ANSWERED', 'MISSED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                filter === status
                  ? 'bg-[#022B23] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {calls.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <Phone className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No calls found</h3>
          <p className="text-sm sm:text-base text-gray-500 px-4">
            {filter === 'ALL' ? 'You haven\'t made any calls yet.' : `No ${filter.toLowerCase()} calls found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {calls.map((call) => (
            <div
              key={call.id || call.roomName}
              className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                    {getStatusIcon(call.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-1 sm:gap-0">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                        {call.calleeName || call.calleeEmail}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium self-start sm:self-auto ${getStatusColor(call.status)}`}>
                        {call.status}
                      </span>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">
                      {call.calleeEmail}
                    </p>
                    
                    <div className="mt-1 sm:mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-1 sm:gap-0 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(call.createdAt || call.timeInitiated)}</span>
                      </div>
                      
                      {call.startedAt && call.endedAt && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(call.startedAt, call.endedAt)}</span>
                        </div>
                      )}
                      
                      <span className="capitalize">{call.type} call</span>
                    </div>
                    
                    <div className="mt-1 text-xs sm:text-sm text-gray-600">
                      <p className="truncate">Room: {call.roomName}</p>
                      {call.message && (
                        <p className="truncate">Message: {call.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end sm:justify-start">
                  <button
                    onClick={() => callBack(call)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-[#022B23] hover:bg-[#033d30] active:bg-[#044d3a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#022B23] touch-manipulation"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call Again
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerCallsPage;