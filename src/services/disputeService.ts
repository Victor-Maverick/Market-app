/**
 * Dispute Service - Handles all dispute-related API calls
 */

interface OrderItemDto {
    id: number;
    productId: number;
    productName: string;
    description: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    vendorName: string;
    buyerName: string;
}

interface DisputeResponse {
    id: number;
    requestTime: string;
    status: string;
    resolvedDate: string | null;
    orderNumber: string;
    imageUrl: string | null;
    reason: string;
    orderItem: OrderItemDto;
    orderTime: string;
    deliveryMethod: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const disputeService = {
    // Get all disputes
    async getAllDisputes(): Promise<DisputeResponse[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/dispute/all`);
            if (!response.ok) {
                throw new Error('Failed to fetch disputes');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching disputes:', error);
            throw error;
        }
    },

    // Get dispute by ID
    async getDisputeById(id: number): Promise<DisputeResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/dispute/get-by-id?id=${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch dispute details');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching dispute details:', error);
            throw error;
        }
    },

    // Get all pending disputes
    async getAllPendingDisputes(): Promise<DisputeResponse[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/dispute/allPending`);
            if (!response.ok) {
                throw new Error('Failed to fetch pending disputes');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching pending disputes:', error);
            throw error;
        }
    },

    // Get pending disputes count
    async getPendingDisputesCount(): Promise<number> {
        try {
            const response = await fetch(`${API_BASE_URL}/dispute/allPendingCount`);
            if (!response.ok) {
                throw new Error('Failed to fetch pending disputes count');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching pending disputes count:', error);
            throw error;
        }
    },

    // Process dispute
    async processDispute(disputeId: number): Promise<string> {
        try {
            const response = await fetch(`${API_BASE_URL}/dispute/process?disputeId=${disputeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to process dispute');
            }
            return await response.text();
        } catch (error) {
            console.error('Error processing dispute:', error);
            throw error;
        }
    },

    // Reject dispute
    async rejectDispute(disputeId: number): Promise<string> {
        try {
            console.log('Rejecting dispute with ID:', disputeId);
            const response = await fetch(`${API_BASE_URL}/dispute/reject?disputeId=${disputeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Reject dispute failed:', response.status, errorText);
                throw new Error(`Failed to reject dispute: ${response.status} ${errorText}`);
            }
            
            const result = await response.text();
            console.log('Dispute rejected successfully:', result);
            return result;
        } catch (error) {
            console.error('Error rejecting dispute:', error);
            throw error;
        }
    },

    // Resolve dispute
    async resolveDispute(disputeId: number): Promise<string> {
        try {
            const response = await fetch(`${API_BASE_URL}/dispute/resolve?disputeId=${disputeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to resolve dispute');
            }
            return await response.text();
        } catch (error) {
            console.error('Error resolving dispute:', error);
            throw error;
        }
    },

    // Send resolve request
    async sendResolveRequest(disputeId: number): Promise<string> {
        try {
            const response = await fetch(`${API_BASE_URL}/dispute/send-resolve?disputeId=${disputeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to send resolve request');
            }
            return await response.text();
        } catch (error) {
            console.error('Error sending resolve request:', error);
            throw error;
        }
    }
};

export type { DisputeResponse, OrderItemDto };