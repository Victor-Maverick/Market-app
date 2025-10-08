// callService.ts - Twilio Video call service
import axios from 'axios';

// API Configuration with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// Configure axios for SSL issues (development only)
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
    try {
        // Dynamic import for Node.js environment only
        import('https').then((https) => {
            axios.defaults.httpsAgent = new https.Agent({
                rejectUnauthorized: false
            });
        }).catch(() => {
            console.log('HTTPS agent configuration skipped (browser environment)');
        });
    } catch (e) {
        console.log('HTTPS agent configuration skipped (browser environment)');
    }
}

// Minimal logging for production
if (process.env.NODE_ENV === 'development') {
    axios.interceptors.request.use(
        (config) => {
            console.log(`${config.method?.toUpperCase()} ${config.url}`);
            return config;
        },
        (error) => {
            console.error('Request Error:', error instanceof Error ? error.message : 'Unknown error');
            return Promise.reject(error);
        }
    );

    axios.interceptors.response.use(
        (response) => {
            console.log(`${response.status} ${response.config.url}`);
            return response;
        },
        (error) => {
            console.error(`${error.response?.status || 'Network'} Error:`, error instanceof Error ? error.message : 'Unknown error');
            return Promise.reject(error);
        }
    );
}

export interface CallRequest {
    callerEmail: string;
    calleeEmail: string;
    type: 'video' | 'voice';
}

export interface CallResponse {
    id?: string;
    callerEmail: string;
    calleeEmail: string;
    callerName?: string;
    calleeName?: string;
    timeInitiated: number;
    duration: number;
    roomName: string;
    status: 'initiated' | 'accepted' | 'declined' | 'ended';
    type: 'video' | 'voice';
    createdAt?: string;
    startedAt?: string;
    endedAt?: string;
    message?: string;
    // Pre-generated tokens for instant connection
    callerToken?: string;
    calleeToken?: string;
}

export const webRTCCallService = {
    async initiateCall(request: CallRequest): Promise<CallResponse> {
        try {
            const timeInitiated = Date.now();
            const roomName = `call-${timeInitiated}-${Math.random().toString(36).substr(2, 9)}`;

            // Pre-generate tokens and send notification in parallel for instant connection
            const [callerToken, calleeToken, notificationResponse] = await Promise.all([
                twilioVideoService.getAccessToken(request.callerEmail, roomName),
                twilioVideoService.getAccessToken(request.calleeEmail, roomName),
                axios.post(`${API_BASE_URL}/call-notifications/incoming`, {
                    callerEmail: request.callerEmail,
                    calleeEmail: request.calleeEmail,
                    timeInitiated: timeInitiated,
                    duration: 0,
                    roomName: roomName,
                    status: 'initiated',
                    type: request.type
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 5000 // Reduced timeout for faster response
                })
            ]);

            return {
                ...notificationResponse.data,
                callerToken,
                calleeToken,
                roomName,
                timeInitiated
            };
        } catch (error) {
            console.error('Failed to initiate call:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    },

    async acceptCall(roomName: string, callerEmail: string, calleeEmail: string, type: 'video' | 'voice' = 'video'): Promise<CallResponse> {
        try {
            const notification = {
                callerEmail: callerEmail,
                calleeEmail: calleeEmail,
                timeInitiated: Date.now(),
                duration: 0,
                roomName: roomName,
                status: 'accepted',
                type: type
            };

            await axios.post(`${API_BASE_URL}/call-notifications/accepted`, notification);

            return {
                callerEmail: callerEmail,
                calleeEmail: calleeEmail,
                timeInitiated: Date.now(),
                duration: 0,
                roomName: roomName,
                status: 'accepted',
                type: type
            };
        } catch (error) {
            throw error;
        }
    },

    async declineCall(roomName: string, callerEmail: string, calleeEmail: string, type: 'video' | 'voice' = 'voice'): Promise<void> {
        try {
            const notification = {
                callerEmail: callerEmail,
                calleeEmail: calleeEmail,
                timeInitiated: Date.now(),
                duration: 0,
                roomName: roomName,
                status: 'declined',
                type: type
            };

            await axios.post(`${API_BASE_URL}/call-notifications/declined`, notification);
        } catch (error) {
            throw error;
        }
    },

    async endCall(roomName: string, callerEmail: string, calleeEmail: string, timeInitiated: number, type: 'video' | 'voice' = 'voice'): Promise<void> {
        try {
            const notification = {
                callerEmail: callerEmail,
                calleeEmail: calleeEmail,
                timeInitiated: timeInitiated,
                duration: 0,
                roomName: roomName,
                status: 'ended',
                type: type
            };

            await axios.post(`${API_BASE_URL}/call-notifications/ended`, notification);
        } catch (error) {
            throw error;
        }
    },

    async getCallHistory(userEmail: string): Promise<CallResponse[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/call-notifications/history/${encodeURIComponent(userEmail)}`);
            return response.data;
        } catch (error) {
            return [];
        }
    },

    async getPendingCalls(userEmail: string): Promise<CallResponse[]> {
        try {
            const response = await axios.get(`${API_BASE_URL}/call-notifications/pending/${encodeURIComponent(userEmail)}`);
            return response.data;
        } catch (error) {
            return [];
        }
    }
};

// Twilio Video service functions
export const twilioVideoService = {
    /**
     * Get access token for Twilio Video room with caching to prevent multiple requests
     */
    async getAccessToken(identity: string, roomName: string): Promise<string> {
        try {
            // Create cache key
            const cacheKey = `${identity}-${roomName}`;
            
            // Check if we already have a token for this room (simple in-memory cache)
            if (typeof window !== 'undefined') {
                const cachedToken = (window as any).__twilioTokenCache?.[cacheKey];
                if (cachedToken && cachedToken.expires > Date.now()) {
                    console.log('🎯 Using cached token for', identity);
                    return cachedToken.token;
                }
            }

            console.log('🔑 Generating new token for', identity, 'in room', roomName);
            const response = await axios.post(`${API_BASE_URL}/twilio-video/token`, {
                identity,
                roomName
            });

            const token = response.data.token;

            // Cache the token for 1 hour (tokens typically expire in 24 hours)
            if (typeof window !== 'undefined') {
                if (!(window as any).__twilioTokenCache) {
                    (window as any).__twilioTokenCache = {};
                }
                (window as any).__twilioTokenCache[cacheKey] = {
                    token,
                    expires: Date.now() + (60 * 60 * 1000) // 1 hour
                };
            }

            return token;
        } catch (error) {
            console.error('Failed to get access token:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    },

    /**
     * Create Twilio Video room
     */
    async createRoom(roomName: string, roomType: string = 'peer-to-peer'): Promise<any> {
        try {
            const response = await axios.post(`${API_BASE_URL}/twilio-video/room`, {
                roomName,
                roomType
            });

            return response.data;
        } catch (error) {
            console.error('Failed to create room:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    },

    /**
     * End Twilio Video room
     */
    async endRoom(roomName: string): Promise<void> {
        try {
            await axios.post(`${API_BASE_URL}/twilio-video/room/${roomName}/end`);
        } catch (error) {
            console.error('Failed to end room:', error instanceof Error ? error.message : 'Unknown error');
            // Don't throw error - room ending is not critical
        }
    }
};

// Twilio Video Call class
export class TwilioVideoCall {
    private room: any = null;
    private localTracks: any[] = [];
    private callType: 'video' | 'voice';
    private roomName: string;
    private userEmail: string;
    private onRemoteParticipant?: (participant: any) => void;
    private onConnectionStateChange?: (state: string) => void;
    private onLocalTracks?: (tracks: any[]) => void;
    private preGeneratedToken?: string;
    private isConnecting: boolean = false;
    private connectionAttempts: number = 0;
    private maxConnectionAttempts: number = 3;

    constructor(
        callType: 'video' | 'voice',
        roomName: string,
        userEmail: string,
        onRemoteParticipant?: (participant: any) => void,
        onConnectionStateChange?: (state: string) => void,
        onLocalTracks?: (tracks: any[]) => void,
        preGeneratedToken?: string
    ) {
        this.callType = callType;
        this.roomName = roomName;
        this.userEmail = userEmail;
        this.onRemoteParticipant = onRemoteParticipant;
        this.onConnectionStateChange = onConnectionStateChange;
        this.onLocalTracks = onLocalTracks;
        this.preGeneratedToken = preGeneratedToken;
    }

    async initialize(): Promise<void> {
        try {
            // Check if Twilio Video SDK is loaded
            if (typeof window === 'undefined' || !(window as any).Twilio?.Video) {
                throw new Error('Twilio Video SDK not loaded');
            }

            const Video = (window as any).Twilio.Video;

            // Create local tracks based on call type
            const trackOptions = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: this.callType === 'video' ? {
                    width: 640,
                    height: 480,
                    frameRate: 30
                } : false
            };

            // Create local tracks
            this.localTracks = await Video.createLocalTracks(trackOptions);

            // Notify about local tracks
            if (this.onLocalTracks) {
                this.onLocalTracks(this.localTracks);
            }

            if (this.onConnectionStateChange) {
                this.onConnectionStateChange('initialized');
            }

        } catch (error) {
            console.error('Failed to initialize Twilio Video:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }

    async joinRoom(): Promise<void> {
        try {
            // Prevent multiple connection attempts
            if (this.isConnecting) {
                console.log('⏳ Connection already in progress');
                return;
            }

            if (this.room && (this.room.state === 'connected' || this.room.state === 'connecting')) {
                console.log('✅ Already connected or connecting to room');
                return;
            }

            // Check connection attempt limit
            if (this.connectionAttempts >= this.maxConnectionAttempts) {
                throw new Error('Maximum connection attempts reached');
            }

            this.isConnecting = true;
            this.connectionAttempts++;

            if (this.onConnectionStateChange) {
                this.onConnectionStateChange('connecting');
            }

            // Get access token (use pre-generated if available)
            let token = this.preGeneratedToken;
            if (!token) {
                console.warn('No pre-generated token available, fetching from API');
                token = await twilioVideoService.getAccessToken(this.userEmail, this.roomName);
            }

            const Video = (window as any).Twilio.Video;

            // Enhanced connection options for stability
            const connectOptions = {
                name: this.roomName,
                tracks: this.localTracks,
                // Optimize for stability
                dominantSpeaker: true,
                maxAudioBitrate: 16000,
                maxVideoBitrate: 1200000, // Reduced for stability
                preferredVideoCodecs: ['VP8'], // Single codec for consistency
                networkQuality: { local: 1, remote: 1 },
                logLevel: 'warn', // Reduce logging noise
                insights: false // Disable insights to reduce overhead
            };

            // Connect to room with enhanced error handling
            this.room = await Video.connect(token, connectOptions);

            console.log(`✅ Successfully connected to room: ${this.roomName}`);

            // Handle existing participants
            this.room.participants.forEach((participant: any) => {
                console.log('📋 Existing participant:', participant.identity);
                this.handleParticipant(participant);
            });

            // Handle new participants joining
            this.room.on('participantConnected', (participant: any) => {
                console.log('👤 Participant joined:', participant.identity);
                this.handleParticipant(participant);
            });

            // Handle participants leaving
            this.room.on('participantDisconnected', (participant: any) => {
                console.log('👋 Participant left:', participant.identity);
                this.handleParticipantDisconnected(participant);
            });

            // Enhanced disconnection handling
            this.room.on('disconnected', (room: any, error: any) => {
                console.log('🔌 Room disconnected:', error ? error.message : 'Clean disconnect');
                if (this.onConnectionStateChange) {
                    this.onConnectionStateChange('disconnected');
                }
                this.room = null; // Clean up reference
            });

            // Handle reconnection events for network stability
            this.room.on('reconnecting', (error: any) => {
                console.log('🔄 Room reconnecting due to:', error ? error.message : 'Network issue');
                if (this.onConnectionStateChange) {
                    this.onConnectionStateChange('reconnecting');
                }
            });

            this.room.on('reconnected', () => {
                console.log('✅ Room reconnected successfully');
                if (this.onConnectionStateChange) {
                    this.onConnectionStateChange('connected');
                }
            });

            if (this.onConnectionStateChange) {
                this.onConnectionStateChange('connected');
            }

            // Reset connection state on success
            this.isConnecting = false;
            this.connectionAttempts = 0;

        } catch (error) {
            console.error('❌ Failed to join Twilio Video room:', error instanceof Error ? error.message : 'Unknown error');
            
            // Clean up on error
            if (this.room) {
                try {
                    this.room.disconnect();
                } catch (disconnectError) {
                    console.error('Error disconnecting room on failure:', disconnectError);
                }
                this.room = null;
            }
            
            if (this.onConnectionStateChange) {
                this.onConnectionStateChange('failed');
            }
            
            // Reset connection state on error
            this.isConnecting = false;
            
            throw error;
        }
    }

    private handleParticipant(participant: any): void {
        // Handle existing tracks
        participant.tracks.forEach((publication: any) => {
            if (publication.isSubscribed) {
                this.handleTrackSubscribed(publication.track, participant);
            }
        });

        // Handle new tracks
        participant.on('trackSubscribed', (track: any) => {
            this.handleTrackSubscribed(track, participant);
        });

        // Handle track unsubscribed
        participant.on('trackUnsubscribed', (track: any) => {
            this.handleTrackUnsubscribed(track, participant);
        });

        // Notify about remote participant
        if (this.onRemoteParticipant) {
            this.onRemoteParticipant(participant);
        }
    }

    private handleParticipantDisconnected(participant: any): void {
        // Cleanup will be handled by track unsubscribed events
    }

    private handleTrackSubscribed(track: any, participant: any): void {
        // The track will be attached to DOM elements in the component
        // This method just logs for now - actual attachment happens in component
    }

    private handleTrackUnsubscribed(track: any, participant: any): void {
        // Track cleanup will be handled in the component
    }

    getLocalTracks(): any[] {
        return this.localTracks;
    }

    getRoom(): any {
        return this.room;
    }

    toggleVideo(): boolean {
        const videoTrack = this.localTracks.find(track => track.kind === 'video');
        if (videoTrack) {
            if (videoTrack.isEnabled) {
                videoTrack.disable();
            } else {
                videoTrack.enable();
            }
            return videoTrack.isEnabled;
        }
        return false;
    }

    toggleAudio(): boolean {
        const audioTrack = this.localTracks.find(track => track.kind === 'audio');
        if (audioTrack) {
            if (audioTrack.isEnabled) {
                audioTrack.disable();
            } else {
                audioTrack.enable();
            }
            return audioTrack.isEnabled;
        }
        return false;
    }

    async disconnect(): Promise<void> {
        // Stop local tracks
        this.localTracks.forEach(track => {
            track.stop();
        });

        // Disconnect from room
        if (this.room) {
            this.room.disconnect();
            this.room = null;
        }

        // End room on server
        try {
            await twilioVideoService.endRoom(this.roomName);
        } catch (error) {
            // Silent fail for room cleanup
        }
    }
}