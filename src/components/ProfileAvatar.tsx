'use client'
import React from 'react';
import Image from 'next/image';
import { useUserProfile } from '@/hooks/useUserProfile';

interface ProfileAvatarProps {
    size?: 'sm' | 'md' | 'lg';
    showName?: boolean;
    className?: string;
    fallbackName?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
    size = 'md', 
    showName = true, 
    className = '',
    fallbackName = 'User'
}) => {
    const { userProfile, loading } = useUserProfile();

    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-7 h-7',
        lg: 'w-10 h-10'
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    const displayName = userProfile?.firstName 
        ? `${userProfile.firstName}${userProfile.lastName ? ` ${userProfile.lastName}` : ''}`
        : fallbackName;

    if (loading) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                {showName && (
                    <span className={`${textSizeClasses[size]} font-medium text-gray-900`}>
                        Loading...
                    </span>
                )}
                <div className={`${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse`} />
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {showName && (
                <span className={`${textSizeClasses[size]} font-medium text-gray-900`}>
                    Hey, {displayName}
                </span>
            )}
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden border border-gray-200 flex-shrink-0`}>
                {userProfile?.imageUrl ? (
                    <Image
                        src={userProfile.imageUrl}
                        alt={`${displayName}'s profile`}
                        width={size === 'lg' ? 40 : size === 'md' ? 28 : 24}
                        height={size === 'lg' ? 40 : size === 'md' ? 28 : 24}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className={`text-white font-semibold ${size === 'lg' ? 'text-lg' : size === 'md' ? 'text-sm' : 'text-xs'}`}>
                            {displayName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileAvatar;