/**
 * Utility functions for handling payment-related data
 */

/**
 * Cleans payment type by handling null values and removing non-alphabetical characters
 * @param paymentType - The payment type string that might be null or undefined
 * @returns A cleaned string or "None" if the input is null/undefined/empty
 */
export const cleanPaymentType = (paymentType: string | null | undefined): string => {
    if (!paymentType || paymentType === null || paymentType === undefined) {
        return 'None';
    }
    const cleaned = paymentType.replace(/[^a-zA-Z\s]/g, ' ').trim();
    return cleaned || 'None';
};

/**
 * Formats payment status for display
 * @param status - The payment status
 * @returns Formatted status string
 */
export const formatPaymentStatus = (status: string | null | undefined): string => {
    if (!status) return 'Unknown';
    
    // Handle numeric status codes
    if (status === '0') return 'Successful';
    
    // Capitalize first letter and handle underscores
    return status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Formats currency amount for display
 * @param amount - The amount to format
 * @param currency - The currency code (default: NGN)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
    return `${currency === 'NGN' ? 'N' : currency} ${amount.toLocaleString()}.00`;
};