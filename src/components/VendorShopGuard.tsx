'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import axios from "axios";
import DashboardHeader from "@/components/dashboardHeader";
import DashboardOptions from "@/components/dashboardOptions";
import DashboardSubHeader from "@/components/dashboardSubHeader";
import dashSlideImg from "../../public/assets/images/dashSlideImg.png";
import Toast from "@/components/Toast";
import { useSearchParams } from "next/navigation";
import Script from 'next/script';
import { ShopDataSkeleton } from './LoadingSkeletons';

interface ShopData {
    id: number;
    name: string;
    address: string;
    logoUrl: string;
    phone: string;
    shopNumber: string;
    homeAddress: string;
    streetName: string;
    cacNumber: string;
    taxIdNumber: string;
    nin: number;
    bankName: string;
    accountNumber: string;
    market: string;
    marketSectionId: number;
    firstName: string;
    status: string;
}

interface PaymentData {
    authorizationUrl: string;
    reference: string;
    accessCode: string;
}

interface InitializePaymentResponse {
    status: string;
    message: string;
    data?: PaymentData;
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

interface VendorShopGuardProps {
    children: React.ReactNode;
    showHeader?: boolean;
    showDashboardOptions?: boolean;
    showSubHeader?: boolean;
}

// Store the expected payment amount
const storeActivationAmount = (amount: number) => {
    const paymentData = {
        amount,
        timestamp: new Date().getTime()
    };
    localStorage.setItem('expectedActivationPayment', JSON.stringify(paymentData));
};

// Get the stored payment amount
const getStoredActivationAmount = (): number | null => {
    const paymentData = localStorage.getItem('expectedActivationPayment');
    if (!paymentData) return null;

    const { amount, timestamp } = JSON.parse(paymentData);

    if (new Date().getTime() - timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('expectedActivationPayment');
        return null;
    }

    return amount;
};

// Clear the stored amount
const clearStoredActivationAmount = () => {
    localStorage.removeItem('expectedActivationPayment');
};

const VendorShopGuardContent: React.FC<VendorShopGuardProps> = ({
                                                                    children,
                                                                    showHeader = false,
                                                                    showDashboardOptions = false,
                                                                    showSubHeader = false
                                                                }) => {
    const [shopData, setShopData] = useState<ShopData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [toastSubMessage, setToastSubMessage] = useState("");

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

    const fetchShopData = useCallback(async () => {
        if (session?.user?.email) {
            try {
                // First check if shop exists
                const existsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/exists?email=${session.user.email}`);
                const shopExists = existsResponse.data;
                
                if (!shopExists) {
                    // Shop doesn't exist
                    setShopData(null);
                    setLoading(false);
                    return;
                }

                // Shop exists, proceed with fetching shop data
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/getbyEmail?email=${session.user.email}`);
                const data = response.data;
                setShopData(data);
            } catch (error) {
                console.error('Error fetching shop data:', error);
                // If it's a shop existence check error, handle gracefully
                if (axios.isAxiosError(error) && error.response?.status === 400) {
                    console.log('Shop does not exist for this user');
                }
                setShopData(null);
            } finally {
                setLoading(false);
            }
        }
    }, [session]);

    useEffect(() => {
        fetchShopData();
    }, [fetchShopData]);

    const verifyShopStatus = useCallback(async (email: string) => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/update-status`,
                null,
                {
                    params: {email},
                    headers: {'Content-Type': 'application/json'},
                    timeout: 30000,
                }
            );
            return response.status === 200;
        } catch (error) {
            console.error('Error verifying shop status:', error);
            return false;
        }
    }, []);

    const initializePayment = async (): Promise<PaymentData> => {
        if (!session?.user?.email) {
            throw new Error('User session not available. Please try again.');
        }

        try {
            const requestData = {
                email: session.user.email,
                amount: 5000,
                currency: 'NGN',
                callbackUrl: `${window.location.origin}/vendor/dashboard`,
                paymentType: "SHOP_ACTIVATION"
            };

            storeActivationAmount(5000);

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
                throw new Error(paymentResponse.message || 'Payment initialization failed');
            }
        } catch (error) {
            console.error('Payment initialization error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            showErrorToast('Payment Error', errorMessage);
            throw error;
        }
    };

    const verifyPayment = useCallback(async (transRef: string) => {
        setIsVerifying(true);
        setPaymentError(null);

        try {
            const response = await axios.get<VerifyPaymentResponse>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/verify?reference=${transRef}`,
                { timeout: 20000 }
            );

            if (response.data.data) {
                const paymentData = response.data.data;
                const expectedAmount = getStoredActivationAmount();

                if (expectedAmount && Math.abs(paymentData.amount - expectedAmount) > 0.01) {
                    throw new Error('Payment amount does not match expected amount');
                }

                if (session?.user?.email) {
                    const shopVerified = await verifyShopStatus(session.user.email);
                    if (shopVerified) {
                        clearStoredActivationAmount();
                        showSuccessToast('Payment Successful', 'Your shop has been activated successfully');
                        await fetchShopData();
                        router.replace("/vendor/dashboard", undefined);
                    } else {
                        throw new Error('Shop verification failed');
                    }
                } else {
                    throw new Error('User email not found');
                }
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
            setPaymentError(errorMessage);
            showErrorToast('Payment Error', errorMessage);
        } finally {
            setIsVerifying(false);
        }
    }, [session, fetchShopData, verifyShopStatus, router]);

    const handleActivateShop = async () => {
        if (!session) {
            showErrorToast('Authentication Error', 'Please log in to proceed with payment');
            localStorage.setItem('preAuthUrl', window.location.pathname);
            router.push('/login');
            return;
        }

        setActivating(true);

        try {
            const paymentData = await initializePayment();

            // Use Paystack InlineJS to resume the transaction
            const paystack = new window.PaystackPop();
            paystack.resumeTransaction(paymentData.accessCode, {
                onSuccess: (transaction: { reference: string }) => {
                    verifyPayment(transaction.reference);
                },
                onCancel: () => {
                    showErrorToast('Payment Cancelled', 'You cancelled the payment. Please try again.');
                    setActivating(false);
                },
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed';
            showErrorToast('Payment Error', errorMessage);
            setActivating(false);
        }
    };

    useEffect(() => {
        const transRef = searchParams.get('reference');
        if (transRef && session) {
            verifyPayment(transRef);
        }
    }, [searchParams, verifyPayment, session]);

    if (loading) {
        return (
            <>
                {showHeader && <DashboardHeader/>}
                <div className="p-6">
                    <ShopDataSkeleton />
                </div>
            </>
        );
    }

    // Shop not set up yet
    if (!shopData) {
        return (
            <>
                <DashboardHeader/>
                <DashboardOptions/>
                {showSubHeader && (
                    <DashboardSubHeader
                        welcomeText={"Hey, welcome"}
                        description={"Explore your shop, products, sales and orders"}
                        background={'#ECFDF6'}
                        image={dashSlideImg}
                        textColor={'#05966F'}
                    />
                )}
                <div className="flex flex-col items-center justify-center h-screen">
                    <p className="mb-4">You need to set up your shop first</p>
                    <button
                        onClick={() => router.push('/vendor/setup-shop')}
                        className="h-[48px] w-[200px] flex items-center justify-center cursor-pointer bg-[#022B23] text-white rounded-[10px]"
                    >
                        Setup Shop
                    </button>
                </div>
            </>
        );
    }

    // Shop not activated yet
    if (shopData.status === 'NOT_VERIFIED') {
        return (
            <>
                <Script src="https://js.paystack.co/v2/inline.js" strategy="afterInteractive" />
                {showHeader && <DashboardHeader/>}
                {showDashboardOptions && <DashboardOptions/>}
                {showSubHeader && (
                    <DashboardSubHeader
                        welcomeText={"Hey, welcome"}
                        description={"Explore your shop, products, sales and orders"}
                        background={'#ECFDF6'}
                        image={dashSlideImg}
                        textColor={'#05966F'}
                    />
                )}
                {isVerifying && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
                        <div className="bg-white p-6 shadow-lg max-w-md w-full mx-4 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Verifying Payment</h3>
                            <p className="text-gray-600">Please wait while we verify your payment...</p>
                        </div>
                    </div>
                )}
                <div className="flex flex-col items-center justify-center h-screen">
                    <p className="mb-4">Your shop is not yet activated</p>
                    <button
                        onClick={handleActivateShop}
                        disabled={activating}
                        className={`h-[48px] w-[200px] flex items-center justify-center cursor-pointer bg-[#022B23] text-white rounded-[10px] ${
                            activating ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {activating ? 'Processing...' : 'Activate Shop'}
                    </button>
                    {paymentError && (
                        <p className="mt-2 text-red-500">{paymentError}</p>
                    )}
                </div>
                {showToast && (
                    <Toast
                        type={toastType}
                        message={toastMessage}
                        subMessage={toastSubMessage}
                        onClose={handleCloseToast}
                    />
                )}
            </>
        );
    }

    // Shop is set up and activated - render children with default headers
    return (
        <>
            {showHeader && <DashboardHeader/>}
            {showDashboardOptions && <DashboardOptions/>}
            {showSubHeader && (
                <DashboardSubHeader
                    welcomeText={"Hey, welcome"}
                    description={"Explore your shop, products, sales and orders"}
                    background={'#ECFDF6'}
                    image={dashSlideImg}
                    textColor={'#05966F'}
                />
            )}
            {children}
        </>
    );
};

const VendorShopGuard: React.FC<VendorShopGuardProps> = (props) => {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        }>
            <VendorShopGuardContent {...props} />
        </Suspense>
    );
};

export default VendorShopGuard;