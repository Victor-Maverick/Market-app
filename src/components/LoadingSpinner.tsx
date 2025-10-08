// components/LoadingSpinner.tsx
'use client'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    color?: string
    className?: string
}

export default function LoadingSpinner({
                                           size = 'md',
                                           color = '#022B23',
                                           className = '',
                                       }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-[3px]',
        lg: 'h-12 w-12 border-4',
    }

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div
                className={`animate-spin rounded-full ${sizeClasses[size]}`}
                style={{ borderBottomColor: color, borderLeftColor: color }}
            ></div>
        </div>
    )
}