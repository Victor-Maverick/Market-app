'use client';

import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { CallResponse } from '../services/callService';

interface ActiveCallNotificationProps {
    call: CallResponse;
    isVisible: boolean;
    onEndCall: () => void;
    onToggleAudio: () => void;
    onTogglVideo: () => void;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    bothUsersConnected: boolean;
}

const ActiveCallNotification: React.FC<ActiveCallNotificationProps> = ({
    call,
    isVisible,
    onEndCall,
    onToggleAudio,
    onTogglVideo,
    isAudioEnabled,
    isVideoEnabled,
    bothUsersConnected
}) => {
    const [callDuration, setCallDuration] = useState(0);

    useEffect(() => {
        if (isVisible && bothUsersConnected) {
            const interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - call.timeInitiated) / 1000);
                setCallDuration(elapsed);
            }, 1000);

            return () => clearInterval(interval);
        } else {
            setCallDuration(0); // Reset duration when not both connected
        }
    }, [isVisible, bothUsersConnected, call.timeInitiated]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isVisible || !bothUsersConnected) return null;

    return (
        <div className="fixed top-4 right-4 z-50 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 min-w-[250px]">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${call.type === 'video' ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`}></div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {call.type === 'video' ? 'Video Call' : 'Voice Call'}
                        </p>
                        <p className="text-xs text-gray-500">
                            {formatDuration(callDuration)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {call.type === 'video' && (
                        <button
                            onClick={onTogglVideo}
                            className={`p-1.5 rounded-full ${isVideoEnabled ? 'bg-gray-100 hover:bg-gray-200' : 'bg-red-100 hover:bg-red-200'
                                }`}
                            title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
                        >
                            {isVideoEnabled ? (
                                <Video className="w-4 h-4 text-gray-600" />
                            ) : (
                                <VideoOff className="w-4 h-4 text-red-600" />
                            )}
                        </button>
                    )}

                    <button
                        onClick={onToggleAudio}
                        className={`p-1.5 rounded-full ${isAudioEnabled ? 'bg-gray-100 hover:bg-gray-200' : 'bg-red-100 hover:bg-red-200'
                            }`}
                        title={isAudioEnabled ? 'Mute' : 'Unmute'}
                    >
                        {isAudioEnabled ? (
                            <Mic className="w-4 h-4 text-gray-600" />
                        ) : (
                            <MicOff className="w-4 h-4 text-red-600" />
                        )}
                    </button>

                    <button
                        onClick={onEndCall}
                        className="p-1.5 rounded-full bg-red-500 hover:bg-red-600"
                        title="End call"
                    >
                        <PhoneOff className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveCallNotification;