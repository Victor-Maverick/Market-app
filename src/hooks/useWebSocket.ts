import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
    type: 'message' | 'user_online' | 'user_offline' | 'typing';
    data: unknown;
}

interface UseWebSocketProps {
    url: string;
    onMessage?: (message: WebSocketMessage) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    enabled?: boolean;
}

export const useWebSocket = ({
                                 url,
                                 onMessage,
                                 onConnect,
                                 onDisconnect,
                                 enabled = true
                             }: UseWebSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const connect = useCallback(() => {
        if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                setIsConnected(true);
                setError(null);
                reconnectAttempts.current = 0;
                onConnect?.();
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    onMessage?.(message);
                } catch (err) {
                    console.error('Failed to parse WebSocket message:', err);
                }
            };

            wsRef.current.onclose = () => {
                setIsConnected(false);
                onDisconnect?.();

                // Attempt to reconnect
                if (enabled && reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current++;
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, delay);
                }
            };

            wsRef.current.onerror = (error) => {
                setError('WebSocket connection error');
                console.error('WebSocket error:', error);
            };

        } catch (err) {
            setError('Failed to create WebSocket connection');
            console.error('WebSocket creation error:', err);
        }
    }, [enabled, url, onConnect, onMessage, onDisconnect]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
    }, []);

    const sendMessage = useCallback((message: WebSocketMessage) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            return true;
        }
        return false;
    }, []);

    useEffect(() => {
        if (enabled) {
            connect();
        } else {
            disconnect();
        }
        return () => {
            disconnect();
        };
    }, [enabled, url, connect, disconnect]);

    return {
        isConnected,
        error,
        sendMessage,
        connect,
        disconnect
    };
};