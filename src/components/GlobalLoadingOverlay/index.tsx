'use client';

import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export const GlobalLoadingOverlay: React.FC = () => {
  const { isAnyLoading } = useLoading();

  if (!isAnyLoading()) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4 shadow-xl">
        <LoadingSpinner className="w-8 h-8" />
        <p className="text-gray-700 font-medium">Processing...</p>
      </div>
    </div>
  );
};