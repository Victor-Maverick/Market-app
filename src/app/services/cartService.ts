//cartService.ts
import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export interface CartItem {
    itemId: number;
    productId: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    description?: string;
}

export interface CartResponse {
    cartId: string;
    items: CartItem[];
    totalAmount: number;
    totalItems: number;
}

export interface CheckoutResponse {
    orderNumber: string;
    status: string;
    totalAmount: number;
    deliveryFee: number;
    grandTotal: number;
}

export interface CheckoutData {
    buyerEmail: string;
    deliveryMethod: 'pickup' | 'delivery';
    address: string;
    reference: string;
    phoneNumber?: string;
    deliveryFee?: number;
}

// Helper function to get auth token from session
const getAuthToken = async (): Promise<string | undefined> => {
    try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        return session?.accessToken;
    } catch (err) {
        console.error('Error fetching session:', err);
        return undefined;
    }
};

export const addToCart = async (cartId: string, productId: number, quantity: number): Promise<CartResponse> => {
    try {
        const token = await getAuthToken();
        const response = await axios.post<CartResponse>(
            `${API_BASE_URL}/cart/add`,
            { productId, quantity },
            {
                headers: {
                    'X-Cart-Id': cartId,
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};

export const getCart = async (cartId: string): Promise<CartResponse> => {
    try {
        const token = await getAuthToken();
        const response = await axios.get<CartResponse>(`${API_BASE_URL}/cart`, {
            headers: {
                'X-Cart-Id': cartId,
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw error;
    }
};

export const updateCartItem = async (cartId: string, itemId: number, quantity: number): Promise<CartResponse> => {
    try {
        const token = await getAuthToken();
        const response = await axios.put<CartResponse>(
            `${API_BASE_URL}/cart/items/${itemId}`,
            { quantity },
            {
                headers: {
                    'X-Cart-Id': cartId,
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating cart item:', error);
        throw error;
    }
};

export const removeFromCart = async (cartId: string, itemId: number): Promise<CartResponse> => {
    try {
        const token = await getAuthToken();
        const response = await axios.delete<CartResponse>(`${API_BASE_URL}/cart/items/${itemId}`, {
            headers: {
                'X-Cart-Id': cartId,
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
};

export const checkoutCart = async (cartId: string, checkoutData: CheckoutData): Promise<CheckoutResponse> => {
    try {
        const token = await getAuthToken();
        const response = await axios.post<CheckoutResponse>(
            `${API_BASE_URL}/cart/checkout`,
            checkoutData,
            {
                headers: {
                    'X-Cart-Id': cartId,
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error during checkout:', error);
        throw error;
    }
};