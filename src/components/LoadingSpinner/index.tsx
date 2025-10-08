import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    text?: string;
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'md', 
    color = '#022B23', 
    text,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div 
                className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]}`}
                style={{ borderColor: `${color} transparent transparent transparent` }}
            />
            {text && (
                <span className="ml-2 text-sm" style={{ color }}>
                    {text}
                </span>
            )}
        </div>
    );
};

export default LoadingSpinner;