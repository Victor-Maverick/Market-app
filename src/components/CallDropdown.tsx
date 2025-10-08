'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Phone, ChevronDown, Video, Mic, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
// import { pendingCallService } from '../../src/services/pendingCallService';

interface CallDropdownProps {
  vendorEmail: string;
  shopId: number;
  shopName: string;
  productId?: number;
  productName?: string;
  className?: string;
  buttonText?: string;
}

const CallDropdown: React.FC<CallDropdownProps> = ({
  vendorEmail,
  shopId,
  shopName,
  productId,
  productName,
  className = '',
  buttonText = 'Call vendor'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCallSystemAvailable, setIsCallSystemAvailable] = useState<boolean | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Check if call system is available
    const checkCallSystem = async () => {
      if (process.env.NEXT_PUBLIC_DISABLE_CALL_SYSTEM === 'true') {
        setIsCallSystemAvailable(false);
        return;
      }

      try {
        // const isAvailable = await pendingCallService.testConnection();
        setIsCallSystemAvailable(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setIsCallSystemAvailable(false);
      }
    };

    checkCallSystem();
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const initiateCall = async (callType: 'voice' | 'video') => {
    if (!session?.user?.email) {
      toast.error('Please log in to make calls');
      return;
    }

    if (!isCallSystemAvailable) {
      toast.error('Call system is currently unavailable');
      return;
    }

    try {
      const roomId = `${callType}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      
      // WebRTC call only
      window.dispatchEvent(new CustomEvent('openCallModal', {
        detail: {
          type: callType,
          roomId,
          vendorEmail,
          shopName,
          productName,
          userEmail: session.user.email
        }
      }));
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to start call');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        onClick={toggleDropdown}
        className={`inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-[#ffeebe] text-[#461602] hover:bg-[#ffd700] rounded-[14px] font-medium transition-colors text-sm sm:text-base ${className}`}
      >
        <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">{buttonText}</span>
        <span className="sm:hidden">Call</span>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {isCallSystemAvailable === false ? (
              <div className="px-3 py-2">
                <div className="flex items-center text-gray-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Call system unavailable
                </div>
              </div>
            ) : isCallSystemAvailable === null ? (
              <div className="px-3 py-2">
                <div className="flex items-center text-gray-500 text-sm">
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  Checking availability...
                </div>
              </div>
            ) : (
              <>
                {/* Voice Call Option */}
                <div className="px-3 py-2">
                  <button
                    onClick={() => initiateCall('voice')}
                    className="w-full flex items-center text-left text-gray-700 hover:text-green-600 text-sm"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Voice Call
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-1"></div>

                {/* Video Call Option */}
                <div className="px-3 py-2">
                  <button
                    onClick={() => initiateCall('video')}
                    className="w-full flex items-center text-left text-gray-700 hover:text-blue-600 text-sm"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video Call
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallDropdown;