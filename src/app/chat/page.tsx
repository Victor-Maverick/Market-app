'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Pusher, { Channel } from 'pusher-js';
import { chatService, ChatMessage } from '@/services/chatService';
import { Send, Phone, Video } from 'lucide-react';
import MarketPlaceHeader from '@/components/marketPlaceHeader';
import BackButton from '@/components/BackButton';
import blueCircle from '../../../public/assets/images/blueGreenCircle.png';
import Image from 'next/image';
import { usePusherCall } from '@/hooks/usePusherCall';
import { toast } from 'react-hot-toast';

// Remove the empty interface and use React.FC directly
const ChatPage: React.FC = () => {
    const { data: session } = useSession();
    const searchParams = useSearchParams();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pusherRef = useRef<Pusher | null>(null);
    const channelRef = useRef<Channel | null>(null);

    // Call functionality
    const { initiateCall, isConnected } = usePusherCall();

    const vendorEmail = searchParams.get('vendor') || '';
    const vendorName = searchParams.get('vendorName') || vendorEmail;

    // Call handlers
    const handleVoiceCall = async () => {
        if (!session?.user?.email) {
            toast.error('Please log in to make calls');
            return;
        }

        if (!isConnected) {
            toast.error('Call service not connected. Please try again.');
            return;
        }

        if (session.user.email === vendorEmail) {
            toast.error('You cannot call yourself');
            return;
        }

        try {
            await initiateCall(vendorEmail, 'voice');
        } catch (error) {
            toast.error('Failed to initiate call');
        }
    };

    const handleVideoCall = async () => {
        if (!session?.user?.email) {
            toast.error('Please log in to make calls');
            return;
        }

        if (!isConnected) {
            toast.error('Call service not connected. Please try again.');
            return;
        }

        if (session.user.email === vendorEmail) {
            toast.error('You cannot call yourself');
            return;
        }

        try {
            await initiateCall(vendorEmail, 'video');
        } catch (error) {
            toast.error('Failed to initiate call');
        }
    };

    const initializeChat = useCallback(async () => {
        if (!session?.user?.email) return;

        try {
            setIsLoading(true);
            const existingMessages = await chatService.getMessages(session.user.email, vendorEmail);
            setMessages(existingMessages);
            await chatService.markMessagesAsRead(vendorEmail, session.user.email);
        } catch (error) {
            console.error('Error initializing chat:', error);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.email, vendorEmail]);

    const setupPusher = useCallback(() => {
        if (!session?.user?.email || !vendorEmail) return;

        const convId = chatService.generateConversationId(session.user.email, vendorEmail);

        pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        // Connection event handlers
        pusherRef.current.connection.bind('connected', () => {
            console.log('Pusher connected successfully');
        });

        pusherRef.current.connection.bind('error', (err: { type: string; error: unknown }) => {
            console.error('Pusher connection error:', err);
        });

        pusherRef.current.connection.bind('disconnected', () => {
            console.log('Pusher disconnected');
        });

        channelRef.current = pusherRef.current.subscribe(convId);

        // Channel event handlers
        channelRef.current.bind('pusher:subscription_succeeded', () => {
            console.log('Successfully subscribed to channel:', convId);
        });

        channelRef.current.bind('pusher:subscription_error', (status: number) => {
            console.error('Pusher subscription error. Status:', status);
        });

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
    }, [session?.user?.email, vendorEmail]);

    const sendMessage = async (): Promise<void> => {
        if (!newMessage.trim() || !session?.user?.email) return;

        try {
            const messageData = {
                fromEmail: session.user.email,
                toEmail: vendorEmail,
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

    useEffect(() => {
        if (!session?.user?.email || !vendorEmail) return;

        initializeChat();
        const cleanupPusher = setupPusher();

        return () => {
            cleanupPusher?.();
            if (pusherRef.current) {
                pusherRef.current.disconnect();
            }
        };
    }, [session, vendorEmail, initializeChat, setupPusher]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022B23] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <MarketPlaceHeader />
            <div className="h-[48px] w-full border-b-[0.5px] border-[#EDEDED]">
                <div className="h-[48px] px-25 gap-[8px] items-center flex">
                    <BackButton variant="default" text="Go back" />
                    <p className="text-[14px] text-[#3F3E3E]">
                        Home // <span className="font-medium text-[#022B23]">Chat with {vendorName}</span>
                    </p>
                </div>
            </div>

            <div className="mx-25 my-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[calc(100vh-200px)]">
                    {/* Chat Header */}
                    <div className="border-b border-gray-200 px-6 py-4 rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {vendorName}
                                </h2>
                                <span className="text-sm text-gray-500">
                  12:23 PM
                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={handleVideoCall}
                                    disabled={!isConnected || !session?.user?.email || session.user.email === vendorEmail}
                                    className={`p-2 rounded-lg border border-gray-200 transition-colors ${
                                        isConnected && session?.user?.email && session.user.email !== vendorEmail
                                            ? 'hover:bg-blue-50 hover:border-blue-300 text-blue-600'
                                            : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                    title={isConnected ? 'Video Call' : 'Call service not connected'}
                                >
                                    <Video size={18} />
                                </button>
                                <button 
                                    onClick={handleVoiceCall}
                                    disabled={!isConnected || !session?.user?.email || session.user.email === vendorEmail}
                                    className={`p-2 rounded-lg border border-gray-200 transition-colors ${
                                        isConnected && session?.user?.email && session.user.email !== vendorEmail
                                            ? 'hover:bg-green-50 hover:border-green-300 text-green-600'
                                            : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                    title={isConnected ? 'Voice Call' : 'Call service not connected'}
                                >
                                    <Phone size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50 max-h-[calc(100vh-300px)]">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-8">
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={`${message.id}-${message.timestamp}`}
                                        className={`flex ${
                                            message.fromEmail === session?.user?.email ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        {message.fromEmail !== session?.user?.email ? (
                                            <div className="flex items-end gap-3">
                                                <div className="w-[24px] h-[24px] rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-medium">
                            {vendorName.charAt(0).toUpperCase()}
                          </span>
                                                </div>
                                                <div className="bg-gray-200 rounded-2xl rounded-tl-md px-4 py-2 max-w-xs">
                                                    <p className="text-sm text-gray-900">{message.message}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 items-end">
                                                <div className="bg-[#022B23] text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-xs">
                                                    <p className="text-sm">{message.message}</p>
                                                    <div className="flex items-center justify-end mt-1 gap-1">
                            <span className="text-xs text-gray-300">
                              {formatTime(message.timestamp)}
                            </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Image src={blueCircle} alt="User avatar" height={24} width={24} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-gray-200 px-6 py-4 bg-white rounded-b-lg">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type here"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#022B23] focus:border-transparent text-sm"
                                />
                            </div>
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                className="p-3 bg-[#022B23] text-white rounded-full hover:bg-[#033d32] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatPage;