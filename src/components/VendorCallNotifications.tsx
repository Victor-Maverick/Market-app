'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { webRTCCallService, CallResponse } from '@/services/callService';
import { useCallPresence } from '@/providers/CallPresenceProvider';

const VendorCallNotifications: React.FC = () => {
  const { data: session } = useSession();
  const { isConnected } = useCallPresence();
  const [pendingCalls, setPendingCalls] = useState<CallResponse[]>([]);
  const [showPendingCalls, setShowPendingCalls] = useState(false);

  const fetchPendingCalls = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const calls = await webRTCCallService.getPendingCalls(session.user.email);
      console.log('📞 Fetched pending calls:', calls);
      setPendingCalls(calls);
    } catch (error) {
      console.error('❌ Error fetching pending calls:', error);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchPendingCalls();
      // Refresh pending calls every 30 seconds as backup
      const interval = setInterval(fetchPendingCalls, 30000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.email, fetchPendingCalls]);

  // Real-time: Add incoming calls to pending calls list immediately
  // This would be handled by the actual call system
  useEffect(() => {
    // Placeholder for real-time call handling
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.pending-calls-container')) {
        setShowPendingCalls(false);
      }
    };

    if (showPendingCalls) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPendingCalls]);

  const handleAcceptPendingCall = async (call: CallResponse) => {
    try {
      console.log('🎯 Accepting pending call:', call);

      // Handle call acceptance - this would typically open a call modal
      console.log('Accepting call:', call);

      // Remove from pending calls
      setPendingCalls(prev => prev.filter(c => c.id !== call.id));
      setShowPendingCalls(false);

    } catch (error) {
      console.error('❌ Error accepting call:', error);
      alert('Failed to join the call. Please try again.');
    }
  };

  const handleDeclinePendingCall = async (call: CallResponse) => {
    try {
      await webRTCCallService.declineCall(call.roomName, call.callerEmail, session?.user?.email || '', call.type);

      // Remove from pending calls
      setPendingCalls(prev => prev.filter(c => c.id !== call.id));

      console.log('Declined call:', call.roomName);
    } catch (error) {
      console.error('Error declining call:', error);
      alert('Failed to decline the call. Please try again.');
    }
  };

  if (!session?.user?.email) return null;

  return (
      <div className="fixed top-4 right-4 z-40 pending-calls-container">
        {/* Real-time Incoming Call Indicator - Shows immediately when call comes in */}
        {false && (
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg mb-2 animate-pulse">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-sm font-medium">Incoming video call!</span>
              </div>
            </div>
        )}

        {/* Pending Calls Count - Clickable */}
        {pendingCalls.length > 0 && (
            <div
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer transition-colors"
                onClick={() => setShowPendingCalls(!showPendingCalls)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <span className="text-sm font-medium">
                {pendingCalls.length} pending call{pendingCalls.length !== 1 ? 's' : ''}
              </span>
                </div>
                <svg
                    className={`w-4 h-4 transition-transform ${showPendingCalls ? 'rotate-180' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
        )}

        {/* Pending Calls Dropdown */}
        {showPendingCalls && pendingCalls.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg mt-2 max-w-sm">
              <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Pending Calls</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {pendingCalls.map((call) => (
                    <div key={call.id} className="p-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {call.callerEmail}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(call.createdAt || call.timeInitiated).toLocaleString()}
                          </p>
                          <p className="text-xs text-blue-600 capitalize">{call.type} call</p>
                        </div>
                        <div className="flex space-x-2 ml-3">
                          <button
                              onClick={() => handleAcceptPendingCall(call)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Accept
                          </button>
                          <button
                              onClick={() => handleDeclinePendingCall(call)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
        )}
      </div>
  );
};

export default VendorCallNotifications;