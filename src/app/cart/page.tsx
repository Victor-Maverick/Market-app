// Cart/page.tsx
'use client';
import {useState, useEffect, useCallback, Suspense} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductDetailHeader from "@/components/productDetailHeader";
import NavigationBar from "@/components/navigationBar";
import Toast from "../../components/Toast";
import cartIcon from '../../../public/assets/images/black cart.png';
import Image from "next/image";
import arrow from '../../../public/assets/images/blackArrow.png';
import card_tick from '../../../public/assets/images/card-tick.png';
import trash from '../../../public/assets/images/trash.png';
import grayAddressIcon from '../../../public/assets/images/greyAddressIcon.svg';
import whiteAddressIcon from '../../../public/assets/images/addressIcon.svg';
import addIcon from '../../../public/assets/images/add-circle.svg';
import limeArrow from '../../../public/assets/images/green arrow.png';
import { useCart } from "@/context/CartContext";
import emptyCartImg from '@/../public/assets/images/archive.svg';
import { Toaster, toast } from "react-hot-toast";
import arrowRight from '@/../public/assets/images/green arrow.png';
import checkIcon from '@/../public/assets/images/green tick.png';
import axios from 'axios';
import { useSession } from 'next-auth/react';

// Import Paystack InlineJS (Ensure the script is loaded)
import Script from 'next/script';
import Paystack from '@paystack/inline-js';


const DELIVERY_FEE = 1000;

interface PaymentData {
    authorizationUrl: string;
    reference: string;
    accessCode: string; // Added accessCode to match backend response
}

interface InitializePaymentResponse {
    status: string;
    message: string;
    data?: PaymentData;
    error?: unknown[];
    errorMessage?: string;
}

interface VerifyPaymentResponse {
    status: string;
    message: string;
    data?: {
        amount: number;
        currency: string;
        transactionDate: string;
        reference: string;
        status: string;
        paymentMethod: string;
        transAmount: number;
    };
}

interface OrderDetails {
    orderId: string;
    deliveryOption: 'pickup' | 'delivery';
    deliveryAddress: string;
    paymentAmount?: number;
    vendorPhone?: string;
    vendorAddress?: string;
}

interface Address {
    id: string;
    address: string;
    isDefault: boolean;
}

// Store the expected payment amount
const storeTotalAmount = (amount: number) => {
    const paymentData = {
        amount,
        timestamp: new Date().getTime(),
    };
    localStorage.setItem('expectedPayment', JSON.stringify(paymentData));
};

// Get the stored payment amount
const getStoredTotalAmount = (): number | null => {
    const paymentData = localStorage.getItem('expectedPayment');
    if (!paymentData) return null;

    const { amount, timestamp } = JSON.parse(paymentData);

    if (new Date().getTime() - timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('expectedPayment');
        return null;
    }

    return amount;
};

// Clear the stored amount
const clearStoredTotalAmount = () => {
    localStorage.removeItem('expectedPayment');
};

// Safe currency formatter
const formatCurrency = (amount: number | undefined): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '0';
    }
    return amount.toLocaleString();
};

type HoverOption = "pickup" | "delivery" | "add" | null;

const Cart = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [contactPhone, setContactPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
    const [hoveredOption, setHoveredOption] = useState<HoverOption>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [userAddresses, setUserAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string>('Shop Pickup');
    const [showAddAddressModal, setShowAddAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState('');
    const { data: session } = useSession();
    const isAuthenticated = session?.user;

    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        getTotalItems,
        getTotalPrice,
        clearCart,
        fetchCart,
    } = useCart();

    const { checkout: apiCheckout } = useCart();

    const [isSessionLoading, setIsSessionLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [toastSubMessage, setToastSubMessage] = useState("");

    useEffect(() => {
        if (session !== undefined) {
            setIsSessionLoading(false);
        }
    }, [session]);

    const verifyPayment = useCallback(async (reference: string) => {
        setIsVerifying(true);
        setPaymentError(null);

        try {
            const response = await axios.get<VerifyPaymentResponse>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/verify?reference=${reference}`,
                { timeout: 20000 }
            );

            if (response.data.data) {
                const paymentData = response.data.data;
                const expectedAmount = getStoredTotalAmount();

                if (expectedAmount && Math.abs(paymentData.amount - expectedAmount) > 0.01) {
                    throw new Error('Payment amount does not match order total');
                }

                if (!session?.user?.email) {
                    throw new Error('User email not found in session. Please log in again.');
                }

                const checkoutResponse = await apiCheckout({
                    buyerEmail: session.user.email,
                    deliveryMethod: selectedDeliveryOption,
                    address: selectedDeliveryOption === 'pickup' ? 'Shop Pickup' : selectedAddress,
                    reference,
                    phoneNumber: contactPhone,
                    deliveryFee: DELIVERY_FEE,
                });

                const orderDetails: OrderDetails = {
                    orderId: checkoutResponse.orderNumber || generateOrderId(),
                    deliveryOption: selectedDeliveryOption,
                    deliveryAddress: selectedDeliveryOption === 'pickup' ? 'Shop Pickup' : selectedAddress,
                    paymentAmount: paymentData?.amount || undefined,
                    vendorPhone: contactPhone || undefined,
                    vendorAddress: selectedDeliveryOption === 'pickup' ? 'Market Location' : undefined,
                };

                setOrderDetails(orderDetails);
                clearStoredTotalAmount();
                clearCart();
                setShowSuccessModal(true);
                showSuccessToast('Payment Successful', 'Your order has been placed successfully');
                router.replace('/cart', undefined);
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
            setPaymentError(errorMessage);
            showErrorToast('Payment Error', errorMessage);

            if (errorMessage.includes('log in')) {
                localStorage.setItem('preAuthUrl', window.location.pathname);
                router.push('/login');
            }
        } finally {
            setIsVerifying(false);
        }
    }, [session?.user.email, apiCheckout, selectedDeliveryOption, selectedAddress, contactPhone, clearCart, router]);

    useEffect(() => {
        if (isAuthenticated) {
            const fetchUserAddresses = async () => {
                try {
                    const mockAddresses: Address[] = [
                        { id: '1', address: 'Shop Pickup', isDefault: true },
                        { id: '2', address: 'No. 4 Vandeikya Street, Makurdi', isDefault: false },
                    ];
                    setUserAddresses(mockAddresses);
                    setSelectedAddress(mockAddresses.find(addr => addr.isDefault)?.address || mockAddresses[0].address);
                } catch (error) {
                    console.error('Error fetching addresses:', error);
                }
            };

            fetchUserAddresses();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const storedCartId = localStorage.getItem('cartId');
        if (storedCartId) {
            fetchCart();
        }
    }, [fetchCart]);

    useEffect(() => {
        const transRef = searchParams.get('reference');
        if (transRef && !showSuccessModal) {
            verifyPayment(transRef);
        }
    }, [searchParams, showSuccessModal, verifyPayment]);

    const showSuccessToast = (message: string, subMessage: string) => {
        setToastType("success");
        setToastMessage(message);
        setToastSubMessage(subMessage);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const showErrorToast = (message: string, subMessage: string) => {
        setToastType("error");
        setToastMessage(message);
        setToastSubMessage(subMessage);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const handleCloseToast = () => setShowToast(false);

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) {
            toast.error("Please enter a coupon code");
            return;
        }

        if (couponCode.toUpperCase() === "SAVE10") {
            setDiscount(getTotalPrice() * 0.1);
            toast.success("Coupon applied! 10% discount");
        } else if (couponCode.toUpperCase() === "SAVE20") {
            setDiscount(getTotalPrice() * 0.2);
            toast.success("Coupon applied! 20% discount");
        } else {
            toast.error("Invalid coupon code");
            setDiscount(0);
        }
    };

    const generateOrderId = () => {
        return `#${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
    };

    const initializePayment = async (): Promise<PaymentData> => {
        if (session === undefined) {
            await new Promise(resolve => {
                const checkSession = () => {
                    if (session !== undefined) resolve(true);
                    else setTimeout(checkSession, 100);
                };
                checkSession();
            });
        }

        if (!session?.user?.email) {
            throw new Error('User email not available');
        }

        try {
            const totalAmount = getTotalPrice() + DELIVERY_FEE - discount;

            const requestData = {
                email: session.user.email,
                amount: totalAmount, // Paystack expects amount in kobo
                currency: 'NGN',
                callbackUrl: `${window.location.origin}/cart`,
                paymentType: 'ORDER',
            };

            const response = await axios.post<InitializePaymentResponse>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/initialize`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                }
            );

            const paymentResponse = response.data;

            if (paymentResponse.status === 'true') {
                if (!paymentResponse.data?.accessCode) {
                    throw new Error('Payment initialization successful but access code not found');
                }
                return paymentResponse.data;
            } else {
                throw new Error(paymentResponse.errorMessage || paymentResponse.message || 'Payment initialization failed');
            }
        } catch (error) {
            console.error('Payment initialization error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            showErrorToast('Payment Error', errorMessage);
            throw error;
        }
    };

    const handleCheckout = async () => {
        if (isSessionLoading) {
            toast.loading('Checking your session...');
            return;
        }

        if (!session) {
            toast.error('Please login to proceed with payment');
            localStorage.setItem('preAuthUrl', window.location.pathname);
            router.push('/login');
            return;
        }

        setIsLoading(true);
        try {
            if (cartItems.length === 0) {
                throw new Error('Your cart is empty');
            }

            // Validate phone number before proceeding
            if (!validatePhoneNumber(contactPhone)) {
                throw new Error(phoneError || 'Please enter a valid phone number');
            }

            const totalAmount = getTotalPrice() + DELIVERY_FEE - discount;
            storeTotalAmount(totalAmount);

            const paymentData = await initializePayment();

            // Use Paystack InlineJS to resume the transaction
            const paystack = new window.PaystackPop();
            paystack.resumeTransaction(paymentData.accessCode, {
                onSuccess: (transaction: { reference: string }) => {
                    verifyPayment(transaction.reference);
                },
                onCancel: () => {
                    showErrorToast('Payment Cancelled', 'You cancelled the payment. Please try again.');
                    setIsLoading(false);
                },
            });
        } catch (error) {
            console.error('Checkout error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Payment failed';
            showErrorToast('Payment Error', errorMessage);
            setIsLoading(false);
        }
    };

    const handleAddNewAddress = () => {
        if (!newAddress.trim()) {
            toast.error('Please enter a valid address');
            return;
        }

        const newAddressObj: Address = {
            id: Date.now().toString(),
            address: newAddress,
            isDefault: false,
        };

        setUserAddresses([...userAddresses, newAddressObj]);
        setSelectedAddress(newAddress);
        setSelectedDeliveryOption('delivery');
        setShowAddAddressModal(false);
        setNewAddress('');
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        router.push('/buyer/orders');
    };

    const getDeliveryOptionText = () => {
        return selectedDeliveryOption === 'pickup' ? 'Pick-up at the market' : 'Delivery to your address';
    };

    const validatePhoneNumber = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 0) {
            setPhoneError('Phone number is required');
            return false;
        }
        if (cleanPhone.length !== 11) {
            setPhoneError('Phone number must be exactly 11 digits');
            return false;
        } else {
            setPhoneError('');
            return true;
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const cleanValue = value.replace(/\D/g, '').slice(0, 11);
        setContactPhone(cleanValue);
        validatePhoneNumber(cleanValue);
    };

    return (
        <>
            {/* Load Paystack InlineJS */}
            <Script
                src="https://js.paystack.co/v2/inline.js"
                strategy="afterInteractive"
            />
            <Toaster position="bottom-right" />
            {showToast && (
                <Toast
                    type={toastType}
                    message={toastMessage}
                    subMessage={toastSubMessage}
                    onClose={handleCloseToast}
                />
            )}

            {/* Rest of your JSX remains unchanged */}
            {isVerifying && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Verifying Payment</h3>
                        <p className="text-gray-600 text-sm">Please wait while we verify your payment...</p>
                    </div>
                </div>
            )}

            {showSuccessModal && orderDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20 p-4">
                    <div className="bg-white items-center p-6 sm:p-8 lg:p-25 justify-center shadow-lg max-w-[800px] w-full rounded-lg">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div className="text-center mb-6">
                            <h2 className="text-[20px] font-medium text-[#000B38] mb-2">
                                Your order has been placed successfully
                            </h2>
                            <p className="text-[#6B718C] text-sm mb-4">
                                {selectedDeliveryOption === 'pickup' ? 'You can pick up at the respective shop addresses' : 'Your order will be delivered to your address'}
                            </p>
                            <div className="flex items-center justify-center">
                                <div className="bg-[#ECFDF6] w-full max-w-[378px] border-[0.5px] border-[#C6EB5F] rounded-[18px] p-3 mb-3">
                                    <div className="flex items-start justify-center gap-2">
                                        <Image src={checkIcon} alt={'image'} />
                                        <div className="flex flex-col text-start flex-1 max-w-[174px]">
                                            <p className="text-[14px] font-medium text-[#022B23]">
                                                {getDeliveryOptionText()}
                                            </p>
                                            <p className="text-[12px] text-[#022B23] break-words">
                                                {orderDetails.deliveryAddress}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="font-semibold text-[20px] text-[#022B23]">
                                Order ID: <span className="font-semibold text-[20px] text-[#022B23]">{orderDetails.orderId}</span>
                            </p>
                            
                            {/* Order Summary - Minimal and Safe */}
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-[16px] font-medium text-[#022B23] mb-2">Order Summary</h3>
                                <div className="space-y-2 text-sm">
                                    {orderDetails.deliveryAddress && (
                                        <div className="flex justify-between">
                                            <span className="text-[#6B718C]">Delivery:</span>
                                            <span className="text-[#022B23] font-medium">{orderDetails.deliveryAddress}</span>
                                        </div>
                                    )}
                                    {orderDetails.vendorPhone && (
                                        <div className="flex justify-between">
                                            <span className="text-[#6B718C]">Contact:</span>
                                            <span className="text-[#022B23] font-medium">{orderDetails.vendorPhone}</span>
                                        </div>
                                    )}
                                    {orderDetails.paymentAmount && (
                                        <div className="flex justify-between">
                                            <span className="text-[#6B718C]">Amount:</span>
                                            <span className="text-[#022B23] font-medium">₦{formatCurrency(orderDetails.paymentAmount)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={handleSuccessModalClose}
                                className="w-full max-w-[250px] h-[52px] bg-[#022B23] text-[#C6EB5F] rounded-[12px] font-semibold transition-colors flex items-center justify-center gap-[9px]"
                            >
                                <span className="text-sm sm:text-base">Go home to order history</span>
                                <Image src={arrowRight} alt={"image"} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {paymentError && (
                <div className="px-4 sm:px-6 lg:px-[100px] py-4">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 break-words">
                                    {paymentError}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ProductDetailHeader />
            <NavigationBar page="//cart" name="Cart" />
            <div className="px-4 sm:px-6 lg:px-[100px] py-[10px] border-b border-[#ededed]">
                <div className="w-full max-w-[182px] h-[46px] flex border-[0.5px] border-[#ededed] rounded-[4px] p-[2px]">
                    <div className="flex justify-center gap-[2px] items-center bg-[#F9F9F9] w-full h-[40px]">
                        <Image src={cartIcon} alt="cart icon" width={20} height={20} />
                        <p className="text-[14px] text-[#1E1E1E]">My cart</p>
                        <p className="font-medium text-[14px] text-[#1E1E1E]">({getTotalItems()})</p>
                    </div>
                </div>
            </div>
            <div className="flex px-4 sm:px-6 lg:px-[100px] items-center mt-[20px] gap-[12px] sm:gap-[24px] overflow-x-auto">
                <div className="flex gap-[6px] items-center">
                    <Image src={cartIcon} alt="cart" width={20} height={20} />
                    <p className="text-[14px] font-medium">Cart / checkout</p>
                </div>
                <Image src={arrow} alt="arrow" className="w-[14px] h-[14px]" />
                <div className="flex gap-[6px] items-center">
                    <Image src={card_tick} alt="card" />
                    <p className="text-[14px] text-[#707070]">Payment</p>
                </div>
            </div>
            {getTotalItems() === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-[100px] py-[60px] sm:py-[80px]">
                    <Image
                        src={emptyCartImg}
                        alt="Empty cart"
                        width={150}
                        height={150}
                        className="mb-6 sm:w-[200px] sm:h-[200px]"
                    />
                    <h3 className="text-[20px] sm:text-[24px] font-medium mb-2 text-center">Your cart is empty</h3>
                    <p className="text-[#707070] mb-6 text-center max-w-md text-[14px] sm:text-[16px]">
                        Looks like you haven&#39;t added anything to your cart yet
                    </p>
                    <button
                        className="bg-[#022B23] text-white px-6 py-3 rounded-[12px] hover:bg-[#033a30] transition-colors text-[14px] sm:text-[16px]"
                        onClick={() => router.push('/marketPlace')}
                    >
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-[12px] mt-4 sm:mt-6 lg:mt-[20px] px-4 sm:px-6 lg:px-[100px] py-4">
                    <div className="border-[0.5px] border-[#ededed] w-full lg:w-[60%] h-full rounded-xl sm:rounded-[14px] mb-4 lg:mb-0">
                        {cartItems.map((product, index) => (
                            <div
                                key={`${product.productId}-${index}`}
                                className={`flex items-center ${index !== cartItems.length - 1 ? 'border-b border-[#ededed]' : ''}`}
                            >
                                <div className="flex border-r border-[#ededed] w-20 sm:w-24 lg:w-[133px] h-16 sm:h-20 lg:h-[110px] overflow-hidden flex-shrink-0">
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        width={133}
                                        height={110}
                                        className="w-full h-full object-contain bg-[#F9F9F9]"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center w-full px-3 sm:px-4 lg:px-[20px] justify-between gap-3 sm:gap-4 lg:gap-0 py-2 sm:py-3">
                                    <div className="flex flex-col w-full sm:w-[40%] lg:w-[30%] min-w-0">
                                        <div className="mb-2 sm:mb-[8px] lg:mb-[13px]">
                                            <p className="text-xs sm:text-sm lg:text-[14px] text-[#1E1E1E] font-medium mb-1 sm:mb-[4px] truncate">
                                                {product.name}
                                            </p>
                                            <p className="text-xs font-normal text-[#3D3D3D] line-clamp-2 hidden sm:block">
                                                {product.description}
                                            </p>
                                        </div>
                                        <p className="font-medium text-sm sm:text-[14px] lg:text-[16px]">
                                            ₦{product.price.toLocaleString()}.00
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="w-[32px] h-[32px] sm:w-[38px] sm:h-[38px] flex justify-center items-center rounded-[8px] bg-[#F9F9F9] border-[0.5px] border-[#ededed] hover:bg-[#e5e5e5] transition-colors"
                                                onClick={() => updateQuantity(product.itemId, -1)}
                                                disabled={product.quantity <= 1}
                                            >
                                                <p className="text-[14px] font-medium">-</p>
                                            </button>
                                            <div className="w-[32px] h-[32px] sm:w-[38px] sm:h-[38px] flex justify-center items-center">
                                                <p className="text-[14px] font-medium">{product.quantity}</p>
                                            </div>
                                            <button
                                                className="w-[32px] h-[32px] sm:w-[38px] sm:h-[38px] flex rounded-[8px] justify-center items-center bg-[#F9F9F9] border-[0.5px] border-[#ededed] hover:bg-[#e5e5e5] transition-colors"
                                                onClick={() => updateQuantity(product.itemId, 1)}
                                            >
                                                <p className="text-[14px] font-medium">+</p>
                                            </button>
                                        </div>
                                        <div className="flex gap-[4px] items-center justify-end">
                                            <Image
                                                src={trash}
                                                alt="Remove"
                                                width={19}
                                                height={19}
                                                className="w-[16px] h-[16px] sm:w-[19px] sm:h-[19px] cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => {
                                                    removeFromCart(product.itemId);
                                                    toast.success(`${product.name} removed from cart`);
                                                }}
                                            />
                                            <p
                                                className="text-[12px] sm:text-[14px] text-[#707070] font-normal cursor-pointer hover:text-[#505050] transition-colors"
                                                onClick={async () => {
                                                    try {
                                                        await removeFromCart(product.itemId);
                                                        toast.success(`${product.name} removed from cart`);
                                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    } catch (error) {
                                                        toast.error('Failed to remove item from cart');
                                                    }
                                                }}
                                            >
                                                Remove
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex-col w-full lg:w-[40%] space-y-[10px]">
                        <p className="text-[#022B23] font-medium text-[14px] mb-[10px]">Order summary</p>
                        <div className="bg-[#F9F9F9] p-[16px] sm:p-[20px] lg:p-[24px] space-y-[8px] sm:space-y-[10px] rounded-[12px] sm:rounded-[14px]">
                            <div className="flex justify-between items-center">
                                <p className="text-[#022B23] text-[14px] font-normal">Subtotal</p>
                                <p className="text-[14px] font-semibold text-[#1E1E1E]">
                                    ₦{getTotalPrice().toLocaleString()}.00
                                </p>
                            </div>
                            {/*<div className="flex justify-between items-center">*/}
                            {/*    <p className="text-[#022B23] text-[14px] font-normal">Discount</p>*/}
                            {/*    <p className="text-[14px] font-semibold text-[#1E1E1E]">*/}
                            {/*        -₦{discount.toLocaleString()}.00*/}
                            {/*    </p>*/}
                            {/*</div>*/}
                            <div className="flex justify-between items-center">
                                <p className="text-[#022B23] text-[14px] font-normal">VAT</p>
                                <p className="text-[14px] font-semibold text-[#1E1E1E]">0%</p>
                            </div>
                            {/*<div className="flex justify-between items-center">*/}
                            {/*    <p className="text-[#022B23] text-[14px] font-normal">Delivery</p>*/}
                            {/*    <p className="text-[14px] font-semibold text-[#1E1E1E]">*/}
                            {/*        ₦{DELIVERY_FEE.toLocaleString()}.00*/}
                            {/*    </p>*/}
                            {/*</div>*/}
                            <div className="border-t border-[#ededed] pt-3 mt-3">
                                <div className="flex justify-between items-center">
                                    <p className="text-[#022B23] text-[18px] font-medium">Total</p>
                                    <p className="text-[18px] font-bold text-[#1E1E1E]">
                                        ₦{(getTotalPrice() + DELIVERY_FEE - discount).toLocaleString()}.00
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/*<div className="flex flex-col sm:flex-row gap-3 sm:gap-[20px]">*/}
                        {/*    <div className="flex rounded-[12px] border-[1.5px] border-[#D1D1D1] h-[48px] flex-1">*/}
                        {/*        <div className="flex justify-center items-center w-[98px] border-r border-[#D1D1D1] rounded-tl-[12px] rounded-bl-[12px] h-full bg-[#F6F6F6]">*/}
                        {/*            <p className="text-[14px] font-medium text-[#121212]">COUPON</p>*/}
                        {/*        </div>*/}
                        {/*        <input*/}
                        {/*            className="p-[10px] w-full outline-none bg-transparent text-[14px] font-medium text-[#121212]"*/}
                        {/*            placeholder="Enter coupon code"*/}
                        {/*            value={couponCode}*/}
                        {/*            onChange={(e) => setCouponCode(e.target.value)}*/}
                        {/*        />*/}
                        {/*    </div>*/}
                        {/*    <button*/}
                        {/*        className="w-full sm:w-[116px] bg-[#022B23] h-[48px] flex justify-center items-center rounded-[12px] hover:bg-[#033a30] transition-colors"*/}
                        {/*        onClick={handleApplyCoupon}*/}
                        {/*    >*/}
                        {/*        <p className="text-[#C6EB5F] font-semibold text-[16px]">Apply</p>*/}
                        {/*    </button>*/}
                        {/*</div>*/}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-[#022B23] mb-2">
                                Contact Phone Number *
                            </label>
                            <input
                                type="tel"
                                placeholder="08012345678"
                                value={contactPhone}
                                onChange={handlePhoneChange}
                                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23] focus:border-transparent ${
                                    phoneError ? 'border-red-500' : 'border-[#ededed]'
                                }`}
                                maxLength={11}
                                required
                            />
                            {phoneError && (
                                <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                Enter 10-11 digits (numbers only)
                            </p>
                        </div>
                        <div className="flex-col mt-[20px] sm:mt-[30px] space-y-[5px]">
                            <p className="font-medium text-[14px] text-[#022B23]">Delivery option</p>
                            <div className="bg-[#f9f9f9] rounded-[14px] p-[8px] sm:p-[10px] flex-col space-y-1">
                                <div
                                    className={`flex gap-[8px] sm:gap-[10px] py-[8px] sm:py-[10px] px-[6px] sm:px-[8px] cursor-pointer rounded-[8px] sm:rounded-[10px] transition-colors ${
                                        selectedDeliveryOption === 'pickup'
                                            ? 'bg-[#022B23] text-white'
                                            : hoveredOption === 'pickup'
                                                ? 'bg-[#022B23] text-white'
                                                : ''
                                    }`}
                                    onMouseEnter={() => setHoveredOption('pickup')}
                                    onMouseLeave={() => setHoveredOption(null)}
                                    onClick={() => {
                                        setSelectedDeliveryOption('pickup');
                                        setSelectedAddress('Shop Pickup');
                                    }}
                                >
                                    <Image
                                        src={
                                            selectedDeliveryOption === 'pickup' || hoveredOption === 'pickup'
                                                ? whiteAddressIcon
                                                : grayAddressIcon
                                        }
                                        alt="Pickup"
                                        width={18}
                                        height={18}
                                        className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] flex-shrink-0"
                                    />
                                    <div className="flex-col flex-1">
                                        <p className="text-[13px] sm:text-[14px] font-medium">Pick up at market</p>
                                        <p className="text-[11px] sm:text-[12px] break-words">Shop 2C, Modern market, Makurdi</p>
                                    </div>
                                </div>
                                {userAddresses.filter(addr => addr.address !== 'Shop Pickup').map((address) => (
                                    <div
                                        key={address.id}
                                        className={`flex gap-[8px] sm:gap-[10px] py-[8px] sm:py-[10px] px-[6px] sm:px-[8px] cursor-pointer rounded-[8px] sm:rounded-[10px] transition-colors ${
                                            selectedDeliveryOption === 'delivery' && selectedAddress === address.address
                                                ? 'bg-[#022B23] text-white'
                                                : hoveredOption === address.id
                                                    ? 'bg-[#022B23] text-white'
                                                    : ''
                                        }`}
                                        onMouseEnter={() => setHoveredOption(address.id as HoverOption)}
                                        onMouseLeave={() => setHoveredOption(null)}
                                        onClick={() => {
                                            setSelectedDeliveryOption('delivery');
                                            setSelectedAddress(address.address);
                                        }}
                                    >
                                        <Image
                                            src={
                                                selectedDeliveryOption === 'delivery' && selectedAddress === address.address
                                                    ? whiteAddressIcon
                                                    : grayAddressIcon
                                            }
                                            alt="Delivery"
                                            width={18}
                                            height={18}
                                            className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] flex-shrink-0"
                                        />
                                        <div className="flex-col flex-1">
                                            <p className="text-[13px] sm:text-[14px] font-medium">Delivery to address</p>
                                            <p className="text-[11px] sm:text-[12px] break-words">{address.address}</p>
                                        </div>
                                    </div>
                                ))}
                                <div
                                    className={`flex gap-[8px] sm:gap-[10px] py-[8px] sm:py-[10px] px-[6px] sm:px-[8px] cursor-pointer rounded-[8px] sm:rounded-[10px] transition-colors ${
                                        hoveredOption === 'add' ? 'bg-[#022B23] text-white' : ''
                                    }`}
                                    onMouseEnter={() => setHoveredOption('add')}
                                    onMouseLeave={() => setHoveredOption(null)}
                                    onClick={() => setShowAddAddressModal(true)}
                                >
                                    <Image
                                        src={addIcon}
                                        alt="Add"
                                        width={18}
                                        height={18}
                                        className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] flex-shrink-0"
                                    />
                                    <div className="flex-col flex-1">
                                        <p className="text-[13px] sm:text-[14px] font-medium">Add new address</p>
                                        <p className="text-[11px] sm:text-[12px]">Add a new delivery address</p>
                                    </div>
                                </div>
                            </div>
                            {showAddAddressModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20 p-4">
                                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                                        <h3 className="text-lg font-medium mb-4">Add New Address</h3>
                                        <textarea
                                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#022B23] focus:border-transparent"
                                            rows={3}
                                            placeholder="Enter full address"
                                            value={newAddress}
                                            onChange={(e) => setNewAddress(e.target.value)}
                                        />
                                        <div className="flex flex-col sm:flex-row justify-end gap-2">
                                            <button
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowAddAddressModal(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="px-4 py-2 bg-[#022B23] text-white rounded-lg hover:bg-[#033a30] transition-colors"
                                                onClick={handleAddNewAddress}
                                            >
                                                Save Address
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={handleCheckout}
                                disabled={isLoading || cartItems.length === 0 || isSessionLoading || phoneError !== ''}
                                className={`bg-[#022B23] w-full h-[48px] sm:h-[56px] gap-[9px] mt-[10px] rounded-[12px] flex justify-center items-center hover:bg-[#033a30] transition-colors ${
                                    isLoading || cartItems.length === 0 || isSessionLoading || phoneError !== '' ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoading || isSessionLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-[#C6EB5F]"></div>
                                        <p className="text-[#C6EB5F] text-[13px] sm:text-[14px] font-semibold">
                                            {isSessionLoading ? 'Checking session...' : 'Processing...'}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-[#C6EB5F] text-[13px] sm:text-[14px] font-semibold">Continue to payment</p>
                                        <Image src={limeArrow} alt="Arrow" width={16} height={16} className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default function CartPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Cart />
        </Suspense>
    );
}