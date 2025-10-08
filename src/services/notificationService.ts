// notificationService.ts - Global notification management
import { toast } from 'react-hot-toast';

export interface NotificationData {
  id: string;
  type: 'chat' | 'call' | 'general' | 'order' | 'payment';
  title: string;
  message: string;
  timestamp: number;
  from?: string;
  roomName?: string;
  data?: any;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: NotificationData[] = [];
  private listeners: ((notifications: NotificationData[]) => void)[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  constructor() {
    this.requestNotificationPermission();
  }

  /**
   * Request browser notification permission
   */
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        console.log('🔔 Notification permission:', permission);
      } catch (error) {
        console.error('Failed to request notification permission:', error);
      }
    }
  }

  /**
   * Add a new notification
   */
  addNotification(notification: Omit<NotificationData, 'id' | 'timestamp'>): void {
    const newNotification: NotificationData = {
      ...notification,
      id: `${notification.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    console.log('🔔 Adding notification:', newNotification);

    // Add to notifications array (keep max 10)
    this.notifications = [newNotification, ...this.notifications.slice(0, 9)];

    // Notify listeners
    this.notifyListeners();

    // Show browser notification
    this.showBrowserNotification(newNotification);

    // Show toast notification
    this.showToastNotification(newNotification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      this.removeNotification(newNotification.id);
    }, 10000);
  }

  /**
   * Remove a notification
   */
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Get all notifications
   */
  getNotifications(): NotificationData[] {
    return [...this.notifications];
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: NotificationData[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.notifications]);
      } catch (error) {
        console.error('Error notifying notification listener:', error);
      }
    });
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: NotificationData): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
          badge: '/favicon.ico',
          requireInteraction: notification.type === 'call', // Keep call notifications visible
          silent: false
        });

        // Auto-close after 5 seconds (except for calls)
        if (notification.type !== 'call') {
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        }

        // Handle click
        browserNotification.onclick = () => {
          this.handleNotificationClick(notification);
          browserNotification.close();
        };

      } catch (error) {
        console.error('Failed to show browser notification:', error);
      }
    }
  }

  /**
   * Show toast notification
   */
  private showToastNotification(notification: NotificationData): void {
    const icon = this.getNotificationIcon(notification.type);
    
    toast(
      `${icon} ${notification.title}: ${notification.message}`,
      {
        duration: notification.type === 'call' ? 30000 : 5000,
        position: 'top-right',
        style: {
          background: '#fff',
          color: '#333',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }
      }
    );
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(notification: NotificationData): void {
    console.log('🔔 Notification clicked:', notification);

    switch (notification.type) {
      case 'chat':
        if (notification.roomName) {
          window.location.href = `/chat?room=${notification.roomName}`;
        } else {
          window.location.href = '/chat';
        }
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

    // Remove the notification after clicking
    this.removeNotification(notification.id);
  }

  /**
   * Get notification icon
   */
  private getNotificationIcon(type: string): string {
    switch (type) {
      case 'chat':
        return '💬';
      case 'call':
        return '📞';
      case 'order':
        return '📦';
      case 'payment':
        return '💳';
      default:
        return '🔔';
    }
  }

  /**
   * Create chat notification
   */
  createChatNotification(senderName: string, senderEmail: string, message: string, roomName?: string): void {
    this.addNotification({
      type: 'chat',
      title: 'New Message',
      message: `${senderName}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
      from: senderEmail,
      roomName,
      data: { message, roomName }
    });
  }

  /**
   * Create call notification
   */
  createCallNotification(callerName: string, callerEmail: string, callType: 'video' | 'voice', roomName: string): void {
    this.addNotification({
      type: 'call',
      title: 'Incoming Call',
      message: `${callType === 'video' ? 'Video' : 'Voice'} call from ${callerName}`,
      from: callerEmail,
      roomName,
      data: { callType, roomName }
    });
  }

  /**
   * Create order notification
   */
  createOrderNotification(title: string, message: string, orderId?: string): void {
    this.addNotification({
      type: 'order',
      title,
      message,
      data: { orderId }
    });
  }

  /**
   * Create payment notification
   */
  createPaymentNotification(title: string, message: string, paymentId?: string): void {
    this.addNotification({
      type: 'payment',
      title,
      message,
      data: { paymentId }
    });
  }

  /**
   * Create general notification
   */
  createGeneralNotification(title: string, message: string, data?: any): void {
    this.addNotification({
      type: 'general',
      title,
      message,
      data
    });
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
export default notificationService;