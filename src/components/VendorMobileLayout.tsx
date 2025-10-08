'use client';
import React from 'react';
import useResponsive from '@/hooks/useResponsive';

interface VendorMobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  className?: string;
}

const VendorMobileLayout: React.FC<VendorMobileLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBackClick,
  className = ''
}) => {
  const { isMobile, isTablet } = useResponsive();

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile Header */}
      {(isMobile || isTablet) && (title || subtitle) && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={onBackClick}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="flex-1">
              {title && (
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default VendorMobileLayout;