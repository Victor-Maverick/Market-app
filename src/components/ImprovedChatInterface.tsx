'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, ChevronUp, Loader2 } from 'lucide-react';
import { chatService, ChatMessage } from '@/services/chatService';
import Pusher, { Channel } from 'pusher-js';
import Image from 'next/image';
import blueCircle from '../../public/assets/images/blueGreenCircle.png';

interface ImprovedChatInterfaceProps {
  otherUserEmail: string;
  otherUserName: string;
  onClose?: () => void;
  className?: string;
  showHeader?: boolean;
  headerActions?: React.ReactNode;
}

const MESSAGES_PER_PAGE = 30;

const ImprovedChatInterface: React.FC<ImprovedChatInterfaceProps> = ({
  otherUserEmail,
  otherUserName,
  onClose,
  className = '',
  showHeader = true,
  headerActions
}) => {
  const { data: session } = useSession();
  
  // Message state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  
  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<Channel | null>(null);
  const previousScrollHeight = useRef<number>(0);

  // Initialize chat and load recent messages
  const initializeChat = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      setIsLoading(true);
      const result = await chatService.getMessagesWithPagination(
        session.user.email, 
        otherUserEmail, 
        0, 
        MESSAGES_PER_PAGE
      );
      
      setMessages(result.messages.reverse()); // Reverse to show newest at bottom
      setHasMoreMessages(result.hasMore);
      setCurrentPage(0);
      
      // Mark messages as read
      await chatService.markMessagesAsRead(otherUserEmail, session.user.email);
      
      // Scroll to bottom after initial load
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email, otherUserEmail]);

  // Load older messages
  const loadOlderMessages = useCallback(async () => {
    if (!session?.user?.email || isLoadingMore || !hasMoreMessages) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      
      // Store current scroll position
      const container = messagesContainerRef.current;
      if (container) {
        previousScrollHeight.current = container.scrollHeight;
      }
      
      const result = await chatService.getMessagesWithPagination(
        session.user.email, 
        otherUserEmail, 
        nextPage, 
        MESSAGES_PER_PAGE
      );
      
      if (result.messages.length > 0) {
        // Prepend older messages (they come in reverse order from API)
        setMessages(prev => [...result.messages.reverse(), ...prev]);
        setCurrentPage(nextPage);
        setHasMoreMessages(result.hasMore);
        
        // Maintain scroll position
        setTimeout(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight.current;
          }
        }, 50);
      }
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [session?.user?.email, otherUserEmail, currentPage, hasMoreMessages, isLoadingMore]);

  // Setup Pusher for real-time messages
  const setupPusher = useCallback(() => {
    if (!session?.user?.email || !otherUserEmail) return;

    const convId = chatService.generateConversationId(session.user.email, otherUserEmail);

    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    channelRef.current = pusherRef.current.subscribe(convId);

    channelRef.current.bind('new-message', (data: ChatMessage) => {
      addMessageSafely(data);
      scrollToBottom();
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusherRef.current?.unsubscribe(convId);
      }
    };
  }, [session?.user?.email, otherUserEmail]);

  // Send message
  const sendMessage = async (): Promise<void> => {
    if (!newMessage.trim() || !session?.user?.email) return;

    try {
      const messageData = {
        fromEmail: session.user.email,
        toEmail: otherUserEmail,
        message: newMessage.trim()
      };

      const sentMessage = await chatService.sendMessage(messageData);
      addMessageSafely(sentMessage);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Utility functions
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addMessageSafely = (newMsg: ChatMessage): void => {
    setMessages(prev => prev.some(msg => msg.id === newMsg.id) ? prev : [...prev, newMsg]);
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach(message => {
      const dateKey = new Date(message.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return Object.entries(groups).map(([date, msgs]) => ({
      date,
      messages: msgs
    }));
  };

  // Effects
  useEffect(() => {
    if (!session?.user?.email || !otherUserEmail) return;

    initializeChat();
    const cleanupPusher = setupPusher();

    return () => {
      cleanupPusher?.();
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [session, otherUserEmail, initializeChat, setupPusher]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022B23] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="border-b border-gray-200 px-4 sm:px-6 py-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {otherUserName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {otherUserName}
                </h2>
                <span className="text-sm text-gray-500">Online</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {headerActions}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 sm:hidden"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-gray-50 min-h-0 overscroll-behavior-contain"
        style={{ 
          maxHeight: 'calc(100vh - 300px)',
          WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
        }}
      >
        {/* Load More Button */}
        {hasMoreMessages && (
          <div className="text-center mb-4">
            <button
              onClick={loadOlderMessages}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#022B23] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoadingMore ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ChevronUp size={16} />
              )}
              {isLoadingMore ? 'Loading...' : 'Load older messages'}
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messageGroups.map(({ date, messages: dayMessages }) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="text-center mb-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatMessageDate(dayMessages[0].timestamp)}
                  </span>
                </div>
                
                {/* Messages for this date */}
                <div className="space-y-3">
                  {dayMessages.map((message, index) => {
                    const isOwn = message.fromEmail === session?.user?.email;
                    const showAvatar = !isOwn && (
                      index === 0 || 
                      dayMessages[index - 1]?.fromEmail !== message.fromEmail
                    );
                    
                    return (
                      <div
                        key={`${message.id}-${message.timestamp}`}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwn ? (
                          <div className="flex items-end gap-2 max-w-xs sm:max-w-sm">
                            {showAvatar ? (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-medium">
                                  {otherUserName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            ) : (
                              <div className="w-6 h-6 flex-shrink-0" />
                            )}
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-3 py-2 shadow-sm">
                              <p className="text-sm text-gray-900 break-words">{message.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-end max-w-xs sm:max-w-sm">
                            <div className="bg-[#022B23] text-white rounded-2xl rounded-tr-md px-3 py-2 shadow-sm">
                              <p className="text-sm break-words">{message.message}</p>
                              <div className="flex items-center justify-end mt-1 gap-1">
                                <span className="text-xs text-gray-300">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                            </div>
                            <div className="w-6 h-6 flex-shrink-0">
                              <Image src={blueCircle} alt="User avatar" height={24} width={24} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 px-4 sm:px-6 py-4 bg-white rounded-b-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#022B23] focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-[#022B23] text-white rounded-full hover:bg-[#033d32] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImprovedChatInterface;