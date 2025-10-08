import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { chatService } from '@/services/chatService';

export const useUserPresence = () => {
    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.user?.email) return;

        const initializePresence = async () => {
            try {
                // Connect to WebSocket for presence tracking
                await chatService.connect(session.user.email!);
                
                // Set user online via HTTP API
                await chatService.setUserOnline(session.user.email!, session.accessToken);
                
                console.log('User presence hook initialized for:', session.user.email);
            } catch (error) {
                console.error('Failed to initialize user presence:', error);
            }
        };

        const setOffline = async () => {
            try {
                await chatService.setUserOffline(session.user.email!, session.accessToken);
            } catch (error) {
                console.error('Failed to set user offline:', error);
            }
        };

        // Initialize presence when hook mounts
        initializePresence();

        // Set user offline when page is about to unload
        const handleBeforeUnload = () => {
            setOffline();
        };

        // Handle visibility changes
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setOffline();
            } else {
                // Reconnect and set online when page becomes visible
                initializePresence();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            setOffline();
        };
    }, [session]);
};