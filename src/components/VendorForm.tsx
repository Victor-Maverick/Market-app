'use client';
import React, { useState } from 'react';
import useResponsive from '@/hooks/useResponsive';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'select' | 'textarea';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  error?: string;
  className?: string;
}

const VendorFormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  options = [],
  rows = 3,
  error,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  const [isFocused, setIsFocused] = useState(false);

  const baseInputClasses = `
    w-full px-3 sm:px-4 py-2 sm:py-3
    border-2 rounded-lg sm:rounded-xl
    text-sm sm:text-base
    transition-colors duration-200
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${error 
      ? 'border-red-300 focus:border-red-500' 
      : 'border-gray-300 focus:border-blue-500'
    }
    focus:outline-none focus:ring-0
    ${className}
  `;

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={baseInputClasses}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={isMobile ? Math.max(2, rows - 1) : rows}
            className={`${baseInputClasses} resize-none`}
          />
        );
      
      default:
        return (
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className="space-y-1 sm:space-y-2">
      <label
        htmlFor={id}
        className={`
          block text-sm sm:text-base font-medium
          ${error ? 'text-red-700' : 'text-gray-700'}
          ${isFocused ? 'text-blue-600' : ''}
        `}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {error && (
        <p className="text-xs sm:text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

interface VendorFormProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

const VendorForm: React.FC<VendorFormProps> = ({
  title,
  subtitle,
  children,
  onSubmit,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {(title || subtitle) && (
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
          {title && (
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <form onSubmit={onSubmit} className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          {children}
        </div>
      </form>
    </div>
  );
};

export { VendorForm, VendorFormField };