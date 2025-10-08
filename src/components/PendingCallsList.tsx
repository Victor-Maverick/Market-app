'use client';

import React from 'react';
import { Phone, Video, Clock, X } from 'lucide-react';

interface PendingCallsListProps {
    calls: any[];
    onAnswer: (callId: number) => void;
    onReject: (callId: number) => void;
}

const PendingCallsList: React.FC<PendingCallsListProps> = ({
                                                               calls,
                                                               onAnswer,
                                                               onReject
                                                           }) => {
    const [isMinimized, setIsMinimized] = React.useState(false);

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString();
    };

    if (isMinimized) {
        return (
            <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Pending Calls ({calls.length})</span>
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="ml-2 p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">Pending Calls ({calls.length})</h3>
                <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {calls.map((call) => (
                <div key={call.id} className="border-b border-gray-100 py-3 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            {call.callType === 'VIDEO' ? (
                                <Video className="w-4 h-4 text-blue-500 mr-2" />
                            ) : (
                                <Phone className="w-4 h-4 text-green-500 mr-2" />
                            )}
                            <span className="font-medium">{call.callerName}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(call.createdAt)}
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{call.callerEmail}</p>

                    {call.productName && (
                        <p className="text-xs text-gray-500 mb-2">About: {call.productName}</p>
                    )}

                    <div className="flex space-x-2">
                        <button
                            onClick={() => onReject(call.id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            onClick={() => onAnswer(call.id)}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                            Answer
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PendingCallsList;