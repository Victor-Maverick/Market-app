'use client';

import React from 'react';
import { Phone, Video } from 'lucide-react';
import { useSession } from 'next-auth/react';
import CallButton from './CallButton';

interface ChatCallButtonsProps {
  targetEmail: string;
  className?: string;
}

const ChatCallButtons: React.FC<ChatCallButtonsProps> = ({
  targetEmail,
  className = ''
}) => {
  const { data: session } = useSession();
  
  // Don't show chat/call buttons if target email is same as logged-in user
  if (!session?.user?.email || session.user.email === targetEmail) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CallButton
        targetEmail={targetEmail}
        type="voice"
        className="p-3 bg-green-400 hover:bg-green-500 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        <Phone className="w-4 h-4" />
      </CallButton>
      
      <CallButton
        targetEmail={targetEmail}
        type="video"
        className="p-3 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        <Video className="w-4 h-4" />
      </CallButton>
    </div>
  );
};

export default ChatCallButtons;