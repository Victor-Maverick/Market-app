'use client';
import React from 'react';
import Image from 'next/image';
import useResponsive from '@/hooks/useResponsive';

interface VendorCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  value?: string | number;
  status?: 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const VendorCard: React.FC<VendorCardProps> = ({
  title,
  subtitle,
  icon,
  value,
  status,
  onClick,
  className = '',
  children
}) => {
  const { isMobile } = useResponsive();

  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div
      className={`
        ${getStatusStyles()}
        border rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            {icon && (
              <Image
                src={icon}
                alt={title}
                width={isMobile ? 16 : 20}
                height={isMobile ? 16 : 20}
                className="flex-shrink-0"
              />
            )}
            <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
              {title}
            </h3>
          </div>
          
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              {subtitle}
            </p>
          )}
          
          {value && (
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
              {value}
            </p>
          )}
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default VendorCard;