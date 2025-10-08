interface PaymentTransactionResponse {
    id: number;
    reference: string;
    email: string;
    amount: number;
    status: string;
    paymentType: string | null;
    createdAt: string;
}

interface PayoutResponse {
    id: number;
    paidAmount: number;
    paidAt: string | null;
    requestedAt: string;
    vendorName: string;
    paid: boolean;
    accountNumber?: string;
    bankName?: string;
    bankCode?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const paymentService = {
    // Get total transaction amount
    async getTotalTransactionAmount(): Promise<number> {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/allTransactionAmount`);
            if (!response.ok) {
                throw new Error('Failed to fetch total transaction amount');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching total transaction amount:', error);
            throw error;
        }
    },

    // Get all transactions
    async getAllTransactions(): Promise<PaymentTransactionResponse[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/payments/allTransactions`);
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },

    // Get single transaction by ID
    async getTransaction(id: number): Promise<PaymentTransactionResponse> {
        try {
            const url = `${API_BASE_URL}/payments/transaction?id=${id}`;
            console.log('Calling transaction API:', url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch transaction details: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log('API response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching transaction details:', error);
            throw error;
        }
    },

    // Get all payouts
    async getAllPayouts(): Promise<PayoutResponse[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/payout/all`);
            if (!response.ok) {
                throw new Error('Failed to fetch payouts');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching payouts:', error);
            throw error;
        }
    },

    // Get single payout by ID
    async getPayoutById(id: number): Promise<PayoutResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/payout/getById?id=${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch payout details');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching payout details:', error);
            throw error;
        }
    },

    // Calculate total payout amount
    async getTotalPayoutAmount(): Promise<number> {
        try {
            const payouts = await this.getAllPayouts();
            return payouts.reduce((total, payout) => total + payout.paidAmount, 0);
        } catch (error) {
            console.error('Error calculating total payout amount:', error);
            throw error;
        }
    },

    // Mark payout as paid
    async markPayoutAsPaid(id: number): Promise<PayoutResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/payout/markAsPaid?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to mark payout as paid');
            }
            return await response.json();
        } catch (error) {
            console.error('Error marking payout as paid:', error);
            throw error;
        }
    }
};

export type { PaymentTransactionResponse, PayoutResponse };