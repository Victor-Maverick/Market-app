import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface VoiceCallRequest {
  buyerEmail: string;
  vendorEmail: string;
  productId?: number;
  shopId?: number;
  productName?: string;
  shopName?: string;
}

export interface VoiceCallResponse {
  id: number;
  roomName: string;
  callerEmail: string;
  calleeEmail: string;
  status: string;
  createdAt: string;
  endedAt?: string;
  duration?: number;
}

class CallService {
  async initiateVoiceCall(request: VoiceCallRequest): Promise<VoiceCallResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/voice-calls/initiate`, request);
      return response.data;
    } catch (error) {
      console.error('Error initiating voice call:', error);
      throw error;
    }
  }

  async joinVoiceCall(roomName: string, userEmail: string): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/voice-calls/join/${roomName}`, null, {
        params: { userEmail }
      });
      return response.data;
    } catch (error) {
      console.error('Error joining voice call:', error);
      throw error;
    }
  }

  async endVoiceCall(roomName: string, userEmail: string): Promise<VoiceCallResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/voice-calls/end/${roomName}`, null, {
        params: { userEmail }
      });
      return response.data;
    } catch (error) {
      console.error('Error ending voice call:', error);
      throw error;
    }
  }

  async declineVoiceCall(roomName: string, userEmail: string): Promise<VoiceCallResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/voice-calls/decline/${roomName}`, null, {
        params: { userEmail }
      });
      return response.data;
    } catch (error) {
      console.error('Error declining voice call:', error);
      throw error;
    }
  }

  async getPendingVoiceCalls(vendorEmail: string): Promise<VoiceCallResponse[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/voice-calls/pending`, {
        params: { vendorEmail }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting pending voice calls:', error);
      return [];
    }
  }

  // WebSocket methods
  async connectCallWebSocket(userEmail: string, stompClient: any): Promise<void> {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/call.addUser',
        body: JSON.stringify({ userEmail })
      });
    }
  }

  async initiateCallViaWebSocket(request: VoiceCallRequest, stompClient: any): Promise<void> {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/call.initiateVoice',
        body: JSON.stringify(request)
      });
    } else {
      throw new Error('WebSocket not connected');
    }
  }
}

export const callService = new CallService();
export default callService;