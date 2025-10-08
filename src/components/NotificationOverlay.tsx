'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Phone, Bell, Package, CreditCard } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { usePusher } from '../providers/PusherProvider';
import { useGlobalNotifications } from '../hooks/useGlobalNotifications';

interface SimpleNotification {
  id: string;
  type: 'chat' | 'call' | 'order' | 'payment' | 'general';
  message: string;
  timestamp: number;
  from?: string;
  actionUrl?: string;
}

const NotificationOverlay: React.FC = () => {
  const { data: session } = useSession();
  const { pusher } = usePusher();
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  
  // Initialize global notifications
  useGlobalNotifications();

  // Setup notification listeners
  useEffect(() => {
    if (!pusher || !session?.user?.email) return;

    const channelName = `user-${session.user.email}`;
    console.log('🔔 Setting up notification overlay for:', channelName);
    
    try {
      const userChannel = pusher.subscribe(channelName);

      // Chat notifications
      userChannel.bind('new-message', (data: any) => {
        console.log('💬 Chat notification received:', data);
        showNotification({
          type: 'chat',
          message: `New message from ${data.senderName || data.senderEmail || 'someone'}`,
          from: data.senderEmail,
          actionUrl: '/chat'
        });
      });

      // Call notifications
      userChannel.bind('incoming-call', (data: any) => {
        console.log('📞 Call notification received:', data);
        showNotification({
          type: 'call',
          message: `${data.type === 'video' ? 'Video' : 'Voice'} call from ${data.callerName || data.callerEmail}`,
          from: data.callerEmail,
          actionUrl: '/call'
        });
      });

      // Order notifications
      userChannel.bind('order-update', (data: any) => {
        console.log('📦 Order notification received:', data);
        showNotification({
          type: 'order',
          message: data.message || 'You have an order update',
          actionUrl: '/buyer/orders'
        });
      });

      // Payment notifications
      userChannel.bind('payment-update', (data: any) => {
        console.log('💳 Payment notification received:', data);
        showNotification({
          type: 'payment',
          message: data.message || 'You have a payment update',
          actionUrl: '/buyer/orders'
        });
      });

      // General notifications
      userChannel.bind('notification', (data: any) => {
        console.log('🔔 General notification received:', data);
        showNotification({
          type: 'general',
          message: data.message || 'You have a new notification',
          actionUrl: data.actionUrl || '/dashboard'
        });
      });

      return () => {
        userChannel.unbind_all();
        pusher.unsubscribe(channelName);
      };

    } catch (error) {
      console.error('Error setting up notification overlay:', error);
    }
  }, [pusher, session?.user?.email]);

  const showNotification = (notificationData: Omit<SimpleNotification, 'id' | 'timestamp'>) => {
    const notification: SimpleNotification = {
      ...notificationData,
      id: `${notificationData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 2)]); // Keep max 3 notifications

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification('BDIC Marketplace', {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });

      browserNotification.onclick = () => {
        if (notification.actionUrl) {
          window.focus();
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto-close browser notification
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: SimpleNotification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    removeNotification(notification.id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'call':
        return <Phone className="w-5 h-5 text-green-500" />;
      case 'order':
        return <Package className="w-5 h-5 text-orange-500" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'chat':
        return 'bg-blue-500';
      case 'call':
        return 'bg-green-500';
      case 'order':
        return 'bg-orange-500';
      case 'payment':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-lg border p-4 transition-all duration-300 hover:shadow-xl cursor-pointer animate-slide-in-right"
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationOverlay;