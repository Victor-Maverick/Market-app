// Audio utilities for call functionality

export class AudioUtils {
  private static incomingCallAudio: HTMLAudioElement | null = null;
  private static ringbackAudio: HTMLAudioElement | null = null;

  /**
   * Initialize audio elements
   */
  static initialize() {
    if (typeof window === 'undefined') return;

    // Create incoming call sound
    this.incomingCallAudio = new Audio();
    this.incomingCallAudio.loop = true;
    this.incomingCallAudio.volume = 0.7;
    
    // Create ringback sound (for caller)
    this.ringbackAudio = new Audio();
    this.ringbackAudio.loop = true;
    this.ringbackAudio.volume = 0.5;

    // Generate simple tones using Web Audio API
    this.createIncomingCallTone();
    this.createRingbackTone();
  }

  /**
   * Create incoming call tone using Web Audio API
   */
  private static createIncomingCallTone() {
    if (typeof window === 'undefined') return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant incoming call tone
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      // Store for later use
      (this.incomingCallAudio as any)._audioContext = audioContext;
      (this.incomingCallAudio as any)._oscillator = oscillator;
      (this.incomingCallAudio as any)._gainNode = gainNode;
    } catch (error) {
      console.warn('Could not create incoming call tone:', error);
    }
  }

  /**
   * Create ringback tone for caller
   */
  private static createRingbackTone() {
    if (typeof window === 'undefined') return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a ringback tone
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      
      // Store for later use
      (this.ringbackAudio as any)._audioContext = audioContext;
      (this.ringbackAudio as any)._oscillator = oscillator;
      (this.ringbackAudio as any)._gainNode = gainNode;
    } catch (error) {
      console.warn('Could not create ringback tone:', error);
    }
  }

  /**
   * Play incoming call sound
   */
  static playIncomingCallSound() {
    if (!this.incomingCallAudio) this.initialize();
    
    try {
      const audioContext = (this.incomingCallAudio as any)?._audioContext;
      const oscillator = (this.incomingCallAudio as any)?._oscillator;
      
      if (audioContext && oscillator) {
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        
        // Create a new oscillator for the incoming call pattern
        const newOscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        newOscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Ring pattern: 2 seconds on, 1 second off
        newOscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        newOscillator.type = 'sine';
        
        // Create ring pattern
        let currentTime = audioContext.currentTime;
        for (let i = 0; i < 10; i++) { // Ring for up to 30 seconds
          gainNode.gain.setValueAtTime(0.3, currentTime);
          gainNode.gain.setValueAtTime(0.3, currentTime + 2);
          gainNode.gain.setValueAtTime(0, currentTime + 2.1);
          currentTime += 3;
        }
        
        newOscillator.start(audioContext.currentTime);
        newOscillator.stop(audioContext.currentTime + 30);
        
        // Store reference to stop later
        (this.incomingCallAudio as any)._currentOscillator = newOscillator;
      }
    } catch (error) {
      console.warn('Could not play incoming call sound:', error);
    }
  }

  /**
   * Stop incoming call sound
   */
  static stopIncomingCallSound() {
    try {
      const currentOscillator = (this.incomingCallAudio as any)?._currentOscillator;
      if (currentOscillator) {
        currentOscillator.stop();
        (this.incomingCallAudio as any)._currentOscillator = null;
      }
    } catch (error) {
      console.warn('Could not stop incoming call sound:', error);
    }
  }

  /**
   * Play ringback sound for caller - only when waiting for callee to pick up
   */
  static playRingbackSound() {
    if (!this.ringbackAudio) this.initialize();
    
    try {
      const audioContext = (this.ringbackAudio as any)?._audioContext;
      
      if (audioContext) {
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        
        // Create ringback pattern
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.type = 'sine';
        
        // Ringback pattern: 1 second on, 2 seconds off
        let currentTime = audioContext.currentTime;
        for (let i = 0; i < 10; i++) {
          gainNode.gain.setValueAtTime(0.2, currentTime);
          gainNode.gain.setValueAtTime(0.2, currentTime + 1);
          gainNode.gain.setValueAtTime(0, currentTime + 1.1);
          currentTime += 3;
        }
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 30);
        
        // Store reference to stop later
        (this.ringbackAudio as any)._currentOscillator = oscillator;
      }
    } catch (error) {
      console.warn('Could not play ringback sound:', error);
    }
  }

  /**
   * Stop ringback sound
   */
  static stopRingbackSound() {
    try {
      const currentOscillator = (this.ringbackAudio as any)?._currentOscillator;
      if (currentOscillator) {
        currentOscillator.stop();
        (this.ringbackAudio as any)._currentOscillator = null;
      }
    } catch (error) {
      console.warn('Could not stop ringback sound:', error);
    }
  }

  /**
   * Test audio functionality
   */
  static testAudio() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      console.log('Audio test completed');
      return true;
    } catch (error) {
      console.error('Audio test failed:', error);
      return false;
    }
  }

  /**
   * Request audio permissions
   */
  static async requestAudioPermissions(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('Audio permissions granted');
      return true;
    } catch (error) {
      console.error('Audio permissions denied:', error);
      return false;
    }
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  AudioUtils.initialize();
}