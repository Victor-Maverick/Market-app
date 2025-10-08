'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Phone, Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { usePusher } from '../providers/PusherProvider';

interface NotificationData {
  id: string;
  type: 'chat' | 'call' | 'general';
  title: string;
  message: string;
  timestamp: number;
  from?: string;
  roomName?: string;
}

const GlobalNotificationOverlay: React.FC = () => {
  const { data: session } = useSession();
  const { pusher } = usePusher();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Setup notification listeners
  useEffect(() => {
    if (!pusher || !session?.user?.email) return;

    const channelName = `user-${session.user.email}`;
    console.log('🔔 Setting up global notifications for:', channelName);
    
    try {
      const userChannel = pusher.subscribe(channelName);

      // Listen for chat notifications
      userChannel.bind('new-message', (data: any) => {
        console.log('💬 New chat message notification:', data);
        
        const notification: NotificationData = {
          id: `chat-${Date.now()}`,
          type: 'chat',
          title: 'New Message',
          message: `You have a new message from ${data.senderName || data.senderEmail || 'someone'}`,
          timestamp: Date.now(),
          from: data.senderEmail,
          roomName: data.roomName
        };

        showNotification(notification);
      });

      // Listen for call notifications
      userChannel.bind('incoming-call', (data: any) => {
        console.log('📞 New call notification:', data);
        
        const notification: NotificationData = {
          id: `call-${Date.now()}`,
          type: 'call',
          title: 'Incoming Call',
          message: `${data.type === 'video' ? 'Video' : 'Voice'} call from ${data.callerName || data.callerEmail}`,
          timestamp: Date.now(),
          from: data.callerEmail,
          roomName: data.roomName
        };

        showNotification(notification);
      });

      // Listen for general notifications
      userChannel.bind('notification', (data: any) => {
        console.log('🔔 General notification:', data);
        
        const notification: NotificationData = {
          id: `general-${Date.now()}`,
          type: 'general',
          title: data.title || 'Notification',
          message: data.message || 'You have a new notification',
          timestamp: Date.now()
        };

        showNotification(notification);
      });

      return () => {
        userChannel.unbind_all();
        pusher.unsubscribe(channelName);
      };

    } catch (error) {
      console.error('Error setting up global notifications:', error);
    }
  }, [pusher, session?.user?.email]);

  const showNotification = (notification: NotificationData) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5 notifications
    setIsVisible(true);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      if (updated.length === 0) {
        setIsVisible(false);
      }
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setIsVisible(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'call':
        return <Phone className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'chat':
        return 'border-l-blue-500 bg-blue-50';
      case 'call':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-lg border p-3">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={clearAllNotifications}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="Clear all notifications"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications */}
      <div className="space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg shadow-lg border-l-4 p-4 transition-all duration-300 hover:shadow-xl ${getNotificationColor(notification.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {getNotificationIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action buttons for specific notification types */}
            {notification.type === 'chat' && (
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => {
                    // Navigate to chat
                    window.location.href = '/chat';
                    removeNotification(notification.id);
                  }}
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  View Chat
                </button>
              </div>
            )}

            {notification.type === 'call' && (
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => {
                    // Navigate to call page
                    window.location.href = '/call';
                    removeNotification(notification.id);
                  }}
                  className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                >
                  View Call
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalNotificationOverlay;