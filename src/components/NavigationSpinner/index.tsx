'use client';
import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';

const NavigationSpinner: React.FC = () => {
  const { isNavigating, navigationMessage } = useNavigation();

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 bg-[#808080]/20 flex items-center justify-center z-[50]">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-2xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022B23] mb-4"></div>
        <p className="text-[#022B23] font-medium text-lg">{navigationMessage}</p>
        <p className="text-[#7C7C7C] text-sm mt-2">Please wait while we redirect you</p>
      </div>
    </div>
  );
};

export default NavigationSpinner;