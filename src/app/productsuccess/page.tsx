'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import BackButton from '@/components/BackButton';

interface BuyNowSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderDetails: {
        orderId: string;
        productName: string;
        deliveryOption: string;
        deliveryAddress: string;
        amountPaid: number;
    };
}

const getTransactionData = () => {
    const data = sessionStorage.getItem('currentTransaction');
    return data ? JSON.parse(data) : null;
};

// Clear transaction data
const clearTransactionData = () => {
    sessionStorage.removeItem('currentTransaction');
};

const BuyNowSuccessModal = ({ isOpen, onClose, orderDetails }: BuyNowSuccessModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-[022B23]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-center mb-2">Purchase Successful!</h2>
                <p className="text-center mb-6">Your order has been confirmed.</p>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">{orderDetails.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Product:</span>
                        <span className="font-medium">{orderDetails.productName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Delivery:</span>
                        <span className="font-medium">{orderDetails.deliveryOption}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium">{orderDetails.deliveryAddress}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-medium">₦{orderDetails.amountPaid.toLocaleString()}</span>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-[#022B23] text-white py-2 rounded-md hover:bg-[#033a30] transition-colors"
                >
                    View Order Details
                </button>
            </div>
        </div>
    );
};

const SuccessPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const transRef = searchParams.get('transRef');

    const [isProcessing, setIsProcessing] = useState(true);
    const [orderDetails, setOrderDetails] = useState<{
        orderId: string;
        productName: string;
        deliveryOption: string;
        deliveryAddress: string;
        amountPaid: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyPaymentAndCreateOrder = async () => {
            if (!transRef) {
                setError('No transaction reference found');
                router.push('/');
                return;
            }

            try {
                const transactionData = getTransactionData();
                if (!transactionData) {
                    return
                }

                const verificationResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/verify/${transRef}`,
                    { timeout: 20000 }
                );

                // Verify amount matches
                if (Math.abs(verificationResponse.data.data.transAmount - transactionData.amount) > 0.01) {
                    throw new Error('Payment amount does not match order total');
                }

                const orderResponse = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/buy-product?productId=${transactionData.productId}`,
                    {
                        buyerEmail: session?.user.email,
                        deliveryMethod: transactionData.deliveryMethod || 'pickup',
                        deliveryFee: 0,
                        address: transactionData.address || 'Shop',
                        transRef: transRef,
                        phoneNumber: transactionData.phoneNumber || ''
                    }
                );

                setOrderDetails({
                    orderId: orderResponse.data.orderNumber || orderResponse.data,
                    productName: transactionData.productName,
                    deliveryOption: transactionData.deliveryMethod === 'pickup' ? 'Pickup at shop' : 'Home delivery',
                    deliveryAddress: transactionData.address || 'Shop address',
                    amountPaid: verificationResponse.data.data.transAmount
                });

                clearTransactionData();
            } catch (error) {
                console.error('Purchase processing error:', error);
                toast.dismiss('buy-now');

                const errorMessage = axios.isAxiosError(error)
                    ? error.response?.data?.message || error.message
                    : error instanceof Error
                        ? error.message
                        : 'Purchase processing failed';

                setError(errorMessage);
                toast.error(errorMessage);

                setTimeout(() => {
                    router.push('/');
                }, 3000);
            } finally {
                setIsProcessing(false);
            }
        };

        if (transRef) {
            verifyPaymentAndCreateOrder();
        } else {
            router.push('/');
        }
    }, [transRef, router, session]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    <BackButton variant="default" text="Go back" />
                </div>
                <div className="flex items-center justify-center min-h-screen -mt-20">
                    <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 mb-2">Purchase Failed</h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => router.back()}
                                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="px-6 py-2 bg-[#022B23] text-white rounded-md hover:bg-[#033a30] transition-colors"
                            >
                                Return Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            {isProcessing && !orderDetails ? (
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#022B23] mx-auto mb-4"></div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Processing Your Purchase</h1>
                    <p className="text-gray-600">Please wait while we confirm your order...</p>
                </div>
            ) : null}

            {orderDetails && (
                <BuyNowSuccessModal
                    isOpen={true}
                    onClose={() => router.push('/buyer/orders')}
                    orderDetails={orderDetails}
                />
            )}
        </div>
    );
};

export default SuccessPage;