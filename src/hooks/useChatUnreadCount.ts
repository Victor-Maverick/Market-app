import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { chatService } from '@/services/chatService';
import Pusher from 'pusher-js';
import type { Channel } from 'pusher-js';

export const useChatUnreadCount = () => {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<Channel | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!session?.user?.email) return;
    
    try {
      setLoading(true);
      const count = await chatService.getUnreadMessagesCount(session.user.email);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching chat unread count:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  const markAllAsRead = useCallback(async () => {
    if (!session?.user?.email) return;
    
    try {
      await chatService.markAllMessagesAsRead(session.user.email);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      throw error;
    }
  }, [session?.user?.email]);

  const refreshCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Setup real-time updates
  useEffect(() => {
    if (!session?.user?.email) return;

    // Setup Pusher for real-time unread count updates
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });
    }

    const channelName = `user-${session.user.email.replace('@', '-at-').replace(/\./g, '-dot-')}`;
    channelRef.current = pusherRef.current.subscribe(channelName);
    
    channelRef.current.bind('unread-count-update', (data: { unreadCount: number }) => {
      console.log('Received unread count update:', data);
      setUnreadCount(data.unreadCount);
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusherRef.current?.unsubscribe(channelName);
      }
    };
  }, [session?.user?.email]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, []);

  return {
    unreadCount,
    loading,
    markAllAsRead,
    refreshCount
  };
};