'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    variant?: 'default' | 'minimal' | 'text';
    text?: string;
    onClick?: () => void;
    className?: string;
}

const BackButton = ({ 
    variant = 'default', 
    text = 'Go back', 
    onClick,
    className = '' 
}: BackButtonProps) => {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.back();
        }
    };

    if (variant === 'minimal') {
        return (
            <button
                onClick={handleClick}
                className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${className}`}
                aria-label="Go back"
            >
                <ArrowLeft size={20} className="text-gray-600" />
            </button>
        );
    }

    if (variant === 'text') {
        return (
            <div 
                onClick={handleClick}
                className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
            >
                <ArrowLeft size={16} className="text-[#022B23]" />
                <p className="text-[#022B23] text-[14px] font-medium">{text}</p>
            </div>
        );
    }

    // Default variant
    return (
        <div 
            onClick={handleClick}
            className={`flex items-center gap-[8px] cursor-pointer hover:opacity-80 transition-opacity ${className}`}
        >
            <ArrowLeft size={20} className="text-gray-600" />
            <p className="text-[14px] text-gray-600">{text}</p>
        </div>
    );
};

export default BackButton;