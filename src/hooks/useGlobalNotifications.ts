'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePusher } from '../providers/PusherProvider';

/**
 * Hook to handle global notifications across the application
 * This hook listens for various notification types and triggers browser notifications
 * Note: ADMINS and SUPER_ADMINS are excluded from call/message notifications
 */
export const useGlobalNotifications = () => {
  const { data: session } = useSession();
  const { pusher, isConnected } = usePusher();

  useEffect(() => {
    if (!pusher || !session?.user?.email || !isConnected) return;

    // Skip websocket setup for ADMINS and SUPER_ADMINS as they don't receive calls/messages
    const userRoles = session.user.roles || [];
    if (userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN')) {
      console.log('🔔 Skipping websocket setup for admin user:', session.user.email);
      return;
    }

    const channelName = `user-${session.user.email}`;
    console.log('🔔 Setting up global notifications for:', channelName);
    
    try {
      const userChannel = pusher.subscribe(channelName);

      // Chat message notifications - simplified
      userChannel.bind('new-message', (data: any) => {
        console.log('💬 Chat notification:', data);
        
        // Only show notification if user is not currently in chat
        const isInChat = window.location.pathname.includes('/chat');
        if (!isInChat) {
          showBrowserNotification(
            'New Message',
            `${data.senderName || data.senderEmail || 'Someone'} sent you a message`,
            'chat'
          );
        }
      });

      // Call notifications - disabled as handled by dedicated call system
      // userChannel.bind('incoming-call', (data: any) => {
      //   console.log('📞 Global call notification:', data);
      //   
      //   showBrowserNotification(
      //     'Incoming Call',
      //     `${data.type === 'video' ? 'Video' : 'Voice'} call from ${data.callerName || data.callerEmail}`,
      //     'call'
      //   );
      // });

      // Order notifications
      userChannel.bind('order-update', (data: any) => {
        console.log('📦 Global order notification:', data);
        
        showBrowserNotification(
          'Order Update',
          data.message || 'You have an order update',
          'order'
        );
      });

      // Payment notifications
      userChannel.bind('payment-update', (data: any) => {
        console.log('💳 Global payment notification:', data);
        
        showBrowserNotification(
          'Payment Update',
          data.message || 'You have a payment update',
          'payment'
        );
      });

      // General notifications
      userChannel.bind('notification', (data: any) => {
        console.log('🔔 Global general notification:', data);
        
        showBrowserNotification(
          data.title || 'Notification',
          data.message || 'You have a new notification',
          'general'
        );
      });

      return () => {
        userChannel.unbind_all();
        pusher.unsubscribe(channelName);
      };

    } catch (error) {
      console.error('Error setting up global notifications:', error);
    }
  }, [pusher, session?.user?.email, isConnected]);

  const showBrowserNotification = (title: string, message: string, type: string) => {
    // Request permission if not granted
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            createNotification(title, message, type);
          }
        });
      } else if (Notification.permission === 'granted') {
        createNotification(title, message, type);
      }
    }
  };

  const createNotification = (title: string, message: string, type: string) => {
    try {
      const notification = new Notification(`BDIC Marketplace - ${title}`, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `${type}-${Date.now()}`,
        requireInteraction: type === 'call', // Keep call notifications visible
        silent: false
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        
        // Navigate based on notification type
        switch (type) {
          case 'chat':
            window.location.href = '/chat';
            break;
          case 'call':
            window.location.href = '/call';
            break;
          case 'order':
            window.location.href = '/buyer/orders';
            break;
          case 'payment':
            window.location.href = '/buyer/orders';
            break;
          default:
            window.location.href = '/dashboard';
            break;
        }
        
        notification.close();
      };

      // Auto-close after 5 seconds (except for calls)
      if (type !== 'call') {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

    } catch (error) {
      console.error('Failed to create browser notification:', error);
    }
  };

  return {
    isConnected,
    userEmail: session?.user?.email
  };
};