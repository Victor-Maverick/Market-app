import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface FloatedProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    mainImageUrl: string;
    shopName: string;
    vendorName: string;
    city: string;
    market: string;
    shopId: number;
}

export const useFloatingProducts = () => {
    const [floatedProducts, setFloatedProducts] = useState<FloatedProduct[]>([]);
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    const [showFloatingProduct, setShowFloatingProduct] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch floated products from backend
    const fetchFloatedProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/get-floated`,
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setFloatedProducts(response.data);
                setCurrentProductIndex(0);
                return true; // Indicates products were found
            } else {
                setFloatedProducts([]);
                return false; // No products found
            }
        } catch (err) {
            console.error('Error fetching floated products:', err);
            setError('Failed to fetch floated products');
            setFloatedProducts([]);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const showNextProduct = useCallback(() => {
        if (floatedProducts.length > 0 && !showFloatingProduct) {
            setShowFloatingProduct(true);
        }
    }, [floatedProducts.length, showFloatingProduct]);

    // Hide current floating product and prepare for next
    const hideCurrentProduct = useCallback(() => {
        setShowFloatingProduct(false);
        
        // Move to next product after hiding current one
        setTimeout(() => {
            setCurrentProductIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % floatedProducts.length;
                return nextIndex;
            });
        }, 500); // Small delay to ensure smooth transition
    }, [floatedProducts.length]);

    // Initialize floating products system
    useEffect(() => {
        fetchFloatedProducts();
    }, [fetchFloatedProducts]);

    // Set up the floating product display cycle
    useEffect(() => {
        if (floatedProducts.length === 0) return;

        // Show first product after 10 seconds
        const initialTimer = setTimeout(() => {
            showNextProduct();
        }, 10000); // 10 seconds

        return () => clearTimeout(initialTimer);
    }, [floatedProducts.length, showNextProduct]);

    // Set up recurring timer for subsequent products
    useEffect(() => {
        if (floatedProducts.length === 0 || currentProductIndex === 0) return;

        // Show next product after 1 minute
        const recurringTimer = setTimeout(() => {
            showNextProduct();
        }, 60000); // 1 minute

        return () => clearTimeout(recurringTimer);
    }, [currentProductIndex, floatedProducts.length, showNextProduct]);

    // Get current product to display
    const getCurrentProduct = useCallback(() => {
        if (floatedProducts.length > 0 && currentProductIndex < floatedProducts.length) {
            return floatedProducts[currentProductIndex];
        }
        return null;
    }, [floatedProducts, currentProductIndex]);

    // Manual controls for testing/debugging
    const showProductNow = useCallback(() => {
        if (floatedProducts.length > 0) {
            setShowFloatingProduct(true);
        }
    }, [floatedProducts.length]);

    const skipToNextProduct = useCallback(() => {
        hideCurrentProduct();
    }, [hideCurrentProduct]);

    const refreshFloatedProducts = useCallback(() => {
        fetchFloatedProducts();
    }, [fetchFloatedProducts]);

    return {
        // State
        floatedProducts,
        currentProduct: getCurrentProduct(),
        showFloatingProduct,
        loading,
        error,
        currentProductIndex,
        
        // Actions
        hideCurrentProduct,
        showProductNow, // For testing
        skipToNextProduct, // For testing
        refreshFloatedProducts,
        
        // Info
        hasProducts: floatedProducts.length > 0,
        totalProducts: floatedProducts.length,
    };
};