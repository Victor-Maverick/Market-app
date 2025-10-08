//TwilioVideoCallModal.tsx

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { CallResponse, TwilioVideoCall, webRTCCallService } from '../services/callService';
import { AudioUtils } from '../utils/audioUtils';


interface WebRTCCallModalProps {
  isOpen: boolean;
  call: CallResponse;
  isInitiator: boolean;
  onClose: () => void;
  // accessToken?: string;
}

const WebRTCCallModal: React.FC<WebRTCCallModalProps> = ({
  isOpen,
  call,
  isInitiator,
  onClose
  // accessToken
}) => {


  const [isVideoEnabled, setIsVideoEnabled] = useState(call.type === 'video');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string>(
    isInitiator ? 'Calling...' : 'Connecting...'
  );
  const [callDuration, setCallDuration] = useState(0);
  const [bothUsersConnected, setBothUsersConnected] = useState(false);
  const [participantCount, setParticipantCount] = useState(1); // Start with 1 (current user)

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const twilioCallRef = useRef<TwilioVideoCall | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const twilioScriptLoadedRef = useRef<boolean>(false);
  const initializationRef = useRef<boolean>(false);

  // const userEmail = isInitiator ? call.callerEmail : call.calleeEmail;

  // Call duration timer - only start when both users are connected
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (bothUsersConnected && callStartTimeRef.current) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current!) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bothUsersConnected]);

  // Load Twilio Video SDK
  useEffect(() => {
    const loadTwilioSDK = () => {
      if (twilioScriptLoadedRef.current || (window as any).Twilio?.Video) {
        twilioScriptLoadedRef.current = true;
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://sdk.twilio.com/js/video/releases/2.15.2/twilio-video.min.js';
        script.onload = () => {
          twilioScriptLoadedRef.current = true;
          resolve();
        };
        script.onerror = () => {
          reject(new Error('Failed to load Twilio Video SDK'));
        };
        document.head.appendChild(script);
      });
    };

    if (isOpen && call.roomName && !initializationRef.current) {
      initializationRef.current = true;
      loadTwilioSDK().then(() => {
        initializeTwilioVideo();
      }).catch(() => {
        setConnectionStatus('Connection failed');
        initializationRef.current = false;
      });
    }

    return () => {
      cleanup();
      AudioUtils.stopRingbackSound();
      AudioUtils.stopIncomingCallSound();
      initializationRef.current = false;
    };
  }, [isOpen, call.roomName, call.type, isInitiator]);

  // Listen for call status changes
  useEffect(() => {
    if (call.status === 'ended' || call.status === 'declined') {
      cleanup();
      onClose();
      return;
    }

    if (call.status === 'accepted' && twilioCallRef.current && !bothUsersConnected) {
      AudioUtils.stopRingbackSound();
      setConnectionStatus('Connecting...');

      // Join Twilio Video room immediately
      if (twilioCallRef.current) {
        twilioCallRef.current.joinRoom().catch(() => {
          setConnectionStatus('Connection failed');
        });
      }
    }
  }, [call.status, bothUsersConnected, onClose]);

  // Play ringback sound for caller when call is initiated and waiting for callee
  useEffect(() => {
    if (isInitiator && call.status === 'initiated' && call.roomName && !bothUsersConnected) {
      AudioUtils.playRingbackSound();
    }
  }, [isInitiator, call.status, call.roomName, bothUsersConnected]);

  const initializeTwilioVideo = async () => {
    try {
      // Set initial status
      if (isInitiator) {
        setConnectionStatus('Calling...');
      } else {
        setConnectionStatus('Connecting...');
      }

      // Get current user email and pre-generated token
      const currentUserEmail = isInitiator ? call.callerEmail : call.calleeEmail;
      const preGeneratedToken = isInitiator ? 
        (call as any).callerToken : 
        (call as any).calleeToken;

      // Create Twilio Video call instance
      twilioCallRef.current = new TwilioVideoCall(
        call.type,
        call.roomName,
        currentUserEmail,
        (participant) => {
          // Handle remote participant joining
          setBothUsersConnected(true);
          setParticipantCount(2);
          callStartTimeRef.current = Date.now();
          setConnectionStatus('Connected');

          // Stop notification sounds
          AudioUtils.stopRingbackSound();
          AudioUtils.stopIncomingCallSound();

          // Handle participant tracks
          participant.tracks.forEach((publication: any) => {
            if (publication.isSubscribed) {
              attachTrack(publication.track, participant);
            }
          });

          // Handle new tracks from this participant
          participant.on('trackSubscribed', (track: any) => {
            attachTrack(track, participant);
          });

          participant.on('trackUnsubscribed', (track: any) => {
            detachTrack(track);
          });
        },
        (state: string) => {
          // Handle connection state changes
          if (state === 'connecting') {
            setConnectionStatus('Connecting...');
          } else if (state === 'connected') {
            setConnectionStatus('Connected');
          } else if (state === 'disconnected' || state === 'failed') {
            setBothUsersConnected(false);
            setParticipantCount(1);
            setConnectionStatus('Call ended');
            AudioUtils.stopRingbackSound();
            AudioUtils.stopIncomingCallSound();
          }
        },
        (tracks) => {
          // Handle local tracks
          tracks.forEach(track => {
            if (track.kind === 'video' && call.type === 'video' && localVideoRef.current) {
              track.attach(localVideoRef.current);
              setIsVideoEnabled(track.isEnabled);
            }
            
            if (track.kind === 'audio') {
              setIsAudioEnabled(track.isEnabled);
            }
          });
        },
        preGeneratedToken // Pass pre-generated token for instant connection
      );

      // Initialize and join room immediately for instant connection
      await twilioCallRef.current.initialize();
      
      // For callees (non-initiators), join room immediately for instant connection
      if (!isInitiator) {
        setConnectionStatus('Connecting...');
        await twilioCallRef.current.joinRoom();
      }
      // For initiators, join room when call is accepted (handled in useEffect)
      else if (isInitiator) {
        setConnectionStatus('Calling...');
      }

    } catch (error) {
      setConnectionStatus('Connection failed');
    }
  };

  // Helper function to attach remote tracks to DOM elements
  const attachTrack = (track: any, participant: any) => {
    if (track.kind === 'video' && call.type === 'video' && remoteVideoRef.current) {
      track.attach(remoteVideoRef.current);
    } else if (track.kind === 'audio' && remoteAudioRef.current) {
      track.attach(remoteAudioRef.current);
    }
  };

  // Helper function to detach tracks
  const detachTrack = (track: any) => {
    track.detach();
  };

  const cleanup = () => {
    if (twilioCallRef.current) {
      twilioCallRef.current.disconnect();
      twilioCallRef.current = null;
    }

    // Stop all call sounds
    AudioUtils.stopRingbackSound();
    AudioUtils.stopIncomingCallSound();

    setCallDuration(0);
    callStartTimeRef.current = null;
    setBothUsersConnected(false);
    setParticipantCount(1);
  };

  const handleEndCall = async () => {
    try {
      // End call on backend
      await webRTCCallService.endCall(
        call.roomName,
        call.callerEmail,
        call.calleeEmail,
        call.timeInitiated,
        call.type
      );
    } catch (error) {
      // Continue with cleanup even if backend call fails
    } finally {
      cleanup();
      onClose();
    }
  };

  const toggleVideo = () => {
    if (twilioCallRef.current && call.type === 'video') {
      const enabled = twilioCallRef.current.toggleVideo();
      setIsVideoEnabled(enabled);
    }
  };

  const toggleAudio = () => {
    if (twilioCallRef.current) {
      const enabled = twilioCallRef.current.toggleAudio();
      setIsAudioEnabled(enabled);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg p-3 sm:p-6 w-full max-w-4xl mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold">
              {call.type === 'video' ? 'Video Call' : 'Voice Call'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 truncate">
              {isInitiator ? call.calleeEmail : call.callerEmail}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              {bothUsersConnected ? (
                <span className="text-green-600 font-medium">
                  ● {participantCount} participant{participantCount !== 1 ? 's' : ''} connected
                </span>
              ) : (
                <span className="text-orange-600">
                  Waiting for connection... ({participantCount} participant{participantCount !== 1 ? 's' : ''})
                </span>
              )}
            </p>
          </div>
          <div className="text-left sm:text-right">
            {/* Only show duration when both users are connected */}
            {bothUsersConnected && callStartTimeRef.current && (
              <p className="text-sm font-mono text-green-600">{formatDuration(callDuration)}</p>
            )}
          </div>
        </div>

        {/* Video Call Interface */}
        {call.type === 'video' && (
          <div className="relative bg-gray-900 rounded-lg mb-3 sm:mb-4 h-48 sm:h-64 md:h-80 lg:h-96">
            {/* Main Video Window - Shows OTHER participant's video (NEVER shows self) */}
            {bothUsersConnected ? (
              <div className="relative w-full h-full">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted={true} // Video element muted to prevent audio feedback - audio comes from separate audio element
                  className="w-full h-full object-cover rounded-lg"
                  onLoadedMetadata={() => {}}
                  onCanPlay={() => {}}
                  onError={() => {}}
                  style={{ display: 'block' }}
                />
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 text-xs sm:text-sm text-white bg-black bg-opacity-70 px-2 sm:px-3 py-1 rounded-full">
                  👤 {isInitiator ? call.calleeEmail.split('@')[0] : call.callerEmail.split('@')[0]}
                </div>
                {/* Connection indicator */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-pulse">
                    <Video className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <p className="text-base sm:text-lg">{connectionStatus}</p>
                  <p className="text-xs sm:text-sm mt-2 opacity-75 truncate">
                    {isInitiator ? call.calleeEmail.split('@')[0] : call.callerEmail.split('@')[0]}
                  </p>
                </div>
              </div>
            )}

            {/* Small Self-View (Picture-in-Picture) - Shows YOUR own video */}
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-20 h-16 sm:w-32 sm:h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ display: 'block' }}
              />
              <div className="absolute bottom-0.5 sm:bottom-1 left-0.5 sm:left-1 text-xs text-white bg-black bg-opacity-70 px-1 sm:px-2 py-0.5 sm:py-1 rounded">
                You
              </div>
            </div>
          </div>
        )}

        {/* Voice Call Interface - NO VIDEO ELEMENTS */}
        {call.type === 'voice' && (
          <div className="flex items-center justify-center h-32 sm:h-48 bg-gradient-to-br from-green-50 to-green-100 rounded-lg mb-3 sm:mb-4">
            <div className="text-center px-4">
              <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 ${bothUsersConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400 animate-pulse'
                }`}>
                <Phone className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
              <p className="text-lg sm:text-xl font-medium text-gray-800">
                Voice Call
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 truncate">
                📞 {isInitiator ? call.calleeEmail : call.callerEmail}
              </p>
              {!bothUsersConnected && (
                <p className="text-xs text-gray-500 mt-1">
                  {isInitiator ? call.calleeEmail.split('@')[0] : call.callerEmail.split('@')[0]}
                </p>
              )}
            </div>
          </div>
        )}

        <audio
          ref={remoteAudioRef}
          autoPlay
          playsInline
          controls={false}
          muted={false}
          style={{ display: 'none' }}
        />



        {/* Controls - Video toggle only for video calls */}
        <div className="flex justify-center space-x-3 sm:space-x-4">
          {/* Video toggle - ONLY for video calls */}
          {call.type === 'video' && (
            <button
              onClick={toggleVideo}
              className={`p-2 sm:p-3 rounded-full transition-colors ${isVideoEnabled ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600'
                }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? (
                <Video className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              ) : (
                <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )}
            </button>
          )}

          {/* Audio toggle - Available for both video and voice calls */}
          <button
            onClick={toggleAudio}
            className={`p-2 sm:p-3 rounded-full transition-colors ${isAudioEnabled ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 hover:bg-red-600'
              }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            ) : (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>

          {/* End call - Available for both call types */}
          <button
            onClick={handleEndCall}
            className="p-2 sm:p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            title="End call"
          >
            <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebRTCCallModal;