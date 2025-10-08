// CartContext.tsx
'use client'
import {createContext, useContext, useState, ReactNode, useCallback, useEffect} from "react";
import {
    addToCart as apiAddToCart,
    getCart as apiGetCart,
    updateCartItem as apiUpdateCartItem,
    removeFromCart as apiRemoveFromCart,
    checkoutCart as apiCheckoutCart,
    CartItem,
    CheckoutResponse
} from "@/app/services/cartService";

interface CheckoutData {
    buyerEmail: string;
    deliveryMethod: 'pickup' | 'delivery';
    address: string;
    reference: string;
    phoneNumber?: string;
    deliveryFee?: number;
}

interface CartContextType {
    cartId: string | null;
    cartItems: CartItem[];
    loading: boolean;
    error: string | null;
    addToCart: (product: Omit<CartItem, 'itemId' | 'quantity'>, quantity?: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    removeFromCart: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    fetchCart: () => Promise<void>;
    checkout: (checkoutData: CheckoutData) => Promise<CheckoutResponse>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartId, setCartId] = useState<string | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Load cartId from localStorage on initial render
    useEffect(() => {
        const storedCartId = localStorage.getItem('cartId');
        if (storedCartId) {
            setCartId(storedCartId);
        }
    }, []);

    const generateCartId = () => {
        return 'cart-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    };

    const fetchCart = useCallback(async () => {
        const currentCartId = cartId || localStorage.getItem('cartId');
        if (!currentCartId) {
            setCartItems([]);
            return;
        }

        try {
            setLoading(true);
            const response = await apiGetCart(currentCartId);
            setCartItems(response.items);

            // Only remove cartId if the cart is truly empty
            if (!response) {
                localStorage.removeItem('cartId');
                setCartId(null);
            }
        } catch (err) {
            if ((err as { response?: { status?: number } })?.response?.status === 401 ||
                (err as { response?: { status?: number } })?.response?.status === 404) {
                localStorage.removeItem('cartId');
                setCartId(null);
            }
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, [cartId]); // Only depend on cartId

    const removeFromCart = useCallback(async (itemId: number) => {
        const currentCartId = cartId || localStorage.getItem('cartId');
        if (!currentCartId) return;

        try {
            setLoading(true);
            const response = await apiRemoveFromCart(currentCartId, itemId);

            // // Update local state with the new items
            // setCartItems(response.items);
            console.log("Response:: ",response)
            // Only remove cartId if all items are gone
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            if (response === 0) {
                localStorage.removeItem('cartId');
                setCartId(null);
            }
            if(currentCartId) {
                fetchCart()
            }
        } catch (err) {
            setError('Failed to remove item from cart');
            console.error('Error removing from cart:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [cartId, fetchCart]);

    const clearCart = useCallback(async () => {
        localStorage.removeItem('cartId');
        setCartId(null);
        setCartItems([]);
    }, []);

    const checkout = useCallback(async (checkoutData: CheckoutData): Promise<CheckoutResponse> => {
        const currentCartId = cartId || localStorage.getItem('cartId');
        if (!currentCartId) throw new Error('No cart ID');

        try {
            setLoading(true);
            const response = await apiCheckoutCart(currentCartId, checkoutData);
            localStorage.removeItem('cartId');
            setCartId(null);
            setCartItems([]);
            return response;
        } catch (err) {
            setError('Failed to checkout');
            console.error('Error during checkout:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [cartId]);

    const addToCart = useCallback(async (product: Omit<CartItem, 'itemId' | 'quantity'>, quantity: number = 1) => {
        try {
            setLoading(true);
            let currentCartId = localStorage.getItem('cartId');
            if (!currentCartId) {
                currentCartId = generateCartId();
                localStorage.setItem('cartId', currentCartId);
                setCartId(currentCartId);
            }

            const response = await apiAddToCart(
                currentCartId,
                product.productId,
                quantity
            );

            setCartItems(response.items);
            if (response.cartId) {
                setCartId(response.cartId);
                localStorage.setItem('cartId', response.cartId);
            }
        } catch (err) {
            setError('Failed to add item to cart');
            console.error('Error adding to cart:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateQuantity = useCallback(async (itemId: number, quantityDelta: number) => {
        if (!cartId) return;

        try {
            setLoading(true);
            const currentItem = cartItems.find(item => item.itemId === itemId);
            if (!currentItem) throw new Error('Item not found in cart');

            const newQuantity = currentItem.quantity + quantityDelta;
            if (newQuantity < 1) throw new Error('Quantity cannot be less than 1');

            const response = await apiUpdateCartItem(
                cartId,
                itemId,
                newQuantity,
            );

            setCartItems(response.items);
        } catch (err) {
            setError('Failed to update quantity');
            console.error('Error updating quantity:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [cartId, cartItems]);

    const getTotalItems = useCallback(() => {
        if (!cartItems) {
            return 0;
        }
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);

    const getTotalPrice = useCallback(() => {
        if (!cartItems) {
            return 0;
        }
        return cartItems.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
    }, [cartItems]);

    return (
        <CartContext.Provider
            value={{
                cartId,
                cartItems,
                loading,
                error,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                getTotalItems,
                getTotalPrice,
                fetchCart,
                checkout
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};