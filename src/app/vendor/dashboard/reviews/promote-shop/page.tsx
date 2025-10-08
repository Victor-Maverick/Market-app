'use client';
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import VendorShopGuard from "@/components/VendorShopGuard";
import arrowBack from '@/../public/assets/images/arrow-right.svg';
import crownImg from '@/../public/assets/images/crown.svg';
import gradient1 from '@/../public/assets/images/promote gradient 1.svg';
import gradient2 from '@/../public/assets/images/promote gradient 2.svg';
import gradient3 from '@/../public/assets/images/promote gradient 3.png';
import greenTick from '@/../public/assets/images/promote checkmark.svg';
import limeArrow from '@/../public/assets/images/green arrow.png';
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Toast from "@/components/Toast";
import { SkeletonLoader } from "@/components/LoadingSkeletons";
import Script from 'next/script';
import DashboardHeader from "@/components/dashboardHeader";
import DashboardOptions from "@/components/dashboardOptions";

interface ApiTier {
    id: number;
    tier: string;
    price: number;
    shopsPromoted: number;
    featuredNumber: number;
    promotedNumber: number;
    floatedNumber: number;
    updateTime: string;
}

interface ShopData {
    id: number;
    promotedStatus: string;
    promotedTierId?: number;
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

interface PromoteShopRequest {
    shopId: number;
    tierId: number;
}

const PromoteShop = () => {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedTierInModal, setSelectedTierInModal] = useState<ApiTier>();
    const [tiers, setTiers] = useState<ApiTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { data: session } = useSession();
    const [shopData, setShopData] = useState<ShopData | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isVerifying, setIsVerifying] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [toastSubMessage, setToastSubMessage] = useState("");
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const storeTotalAmount = (amount: number) => {
        const paymentData = {
            amount,
            timestamp: new Date().getTime(),
        };
        localStorage.setItem('expectedPromotionPayment', JSON.stringify(paymentData));
    };

    const getStoredTotalAmount = (): number | null => {
        const paymentData = localStorage.getItem('expectedPromotionPayment');
        if (!paymentData) return null;

        const { amount, timestamp } = JSON.parse(paymentData);
        if (new Date().getTime() - timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem('expectedPromotionPayment');
            return null;
        }
        return amount;
    };

    const clearStoredTotalAmount = () => {
        localStorage.removeItem('expectedPromotionPayment');
    };

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

    const handleCloseToast = () => {
        setShowToast(false);
    };

    const fetchShopData = useCallback(async () => {
        if (session?.user?.email) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/getbyEmail?email=${session.user.email}`);
                const data = await response.json();
                setShopData(data);
            } catch (error) {
                console.error('Error fetching shop data:', error);
            }
        }
    }, [session]);

    const fetchTiers = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/all-tiers`);
            if (!response.ok) throw new Error('Failed to fetch tiers');
            const data: ApiTier[] = await response.json();
            setTiers(data);
            setSelectedTierInModal(data[0]);
            console.log("Tiers: ", data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tiers');
        } finally {
            setLoading(false);
        }
    }, []);

    const promoteShop = useCallback(async () => {
        if (!shopData?.id || !selectedTierInModal?.id) {
            throw new Error('Shop ID or tier information missing');
        }
        try {
            const request: PromoteShopRequest = {
                shopId: shopData.id,
                tierId: selectedTierInModal.id,
            };
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/promote`,
                request,
                { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
            );
            if (response.status !== 200) throw new Error('Failed to promote shop');
            return true;
        } catch (error) {
            console.error('Error promoting shop:', error);
            throw error;
        }
    }, [shopData?.id, selectedTierInModal?.id]);

    const initializePayment = async (): Promise<PaymentData> => {
        if (!session?.user?.email || !selectedTierInModal) {
            throw new Error('User not authenticated or tier not selected');
        }
        try {
            const requestData = {
                email: session.user.email,
                amount: selectedTierInModal.price,
                currency: 'NGN',
                callbackUrl: `${window.location.origin}/vendor/dashboard/reviews/promote-shop`,
                paymentType: "SHOP_PROMOTION",
            };
            storeTotalAmount(selectedTierInModal.price);
            const response = await axios.post<InitializePaymentResponse>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/initialize`,
                requestData,
                { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
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
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            showErrorToast('Payment Error', errorMessage);
            throw error;
        }
    };

    const verifyPayment = useCallback(async (reference: string) => {
        setIsVerifying(true);
        setPaymentError(null);
        try {
            if (!session?.user?.email) {
                throw new Error('User authentication timed out');
            }
            const response = await axios.get<VerifyPaymentResponse>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/verify?reference=${reference}`,
                { timeout: 20000 }
            );
            if (response.data.data) {
                const paymentData = response.data.data;
                const expectedAmount = getStoredTotalAmount();
                if (expectedAmount && Math.abs(paymentData.amount - expectedAmount) > 0.01) {
                    throw new Error('Payment amount does not match expected amount');
                }
                await promoteShop();
                clearStoredTotalAmount();
                showSuccessToast('Payment Successful', 'Your shop has been promoted successfully');
                await fetchShopData();
                router.replace('/vendor/dashboard/reviews');
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
            setPaymentError(errorMessage);
            showErrorToast('Payment Error', errorMessage);
        } finally {
            setIsVerifying(false);
        }
    }, [session, fetchShopData, promoteShop, router]);

    const handleMakePayment = async () => {
        if (!session) {
            showErrorToast('Authentication Error', 'Please log in to proceed with payment');
            localStorage.setItem('preAuthUrl', window.location.pathname);
            router.push('/login');
            return;
        }
        setIsProcessingPayment(true);
        try {
            const paymentData = await initializePayment();
            const paystack = new window.PaystackPop();
            paystack.resumeTransaction(paymentData.accessCode, {
                onSuccess: (transaction: { reference: string }) => {
                    verifyPayment(transaction.reference);
                },
                onCancel: () => {
                    showErrorToast('Payment Cancelled', 'You cancelled the payment. Please try again.');
                    setIsProcessingPayment(false);
                },
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setIsProcessingPayment(false);
        }
    };

    useEffect(() => {
        fetchTiers();
        fetchShopData();
    }, [fetchTiers, fetchShopData]);

    useEffect(() => {
        const transRef = searchParams.get('reference');
        if (transRef && session) {
            verifyPayment(transRef);
        }
    }, [searchParams, verifyPayment, session]);

    const handleUpgradeClick = () => {
        setShowUpgradeModal(true);
        setSelectedTierInModal(tiers[0]);
    };

    const closeModal = () => {
        setShowUpgradeModal(false);
    };

    const handleTierSelectInModal = (tier: ApiTier) => {
        setSelectedTierInModal(tier);
    };

    if (loading) {
        return (
            <>
                <DashboardHeader />
                <DashboardOptions />
                <div className="p-3 sm:p-6">
                    <SkeletonLoader type="card" count={3} />
                </div>
            </>
        );
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500"><p>{error}</p></div>;
    }

    const CURRENTLY_RUNNING_TIER = shopData?.promotedStatus === 'PROMOTED'
        ? tiers.find(tier => tier.id === shopData.promotedTierId)
        : null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(price);
    };

    const getGradientImage = (index: number) => {
        switch (index) {
            case 0: return gradient1;
            case 1: return gradient2;
            case 2: return gradient3;
            default: return gradient1;
        }
    };

    return (
        <>
            <Script src="https://js.paystack.co/v2/inline.js" strategy="afterInteractive" />
            {showToast && (
                <Toast type={toastType} message={toastMessage} subMessage={toastSubMessage} onClose={handleCloseToast} />
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
            {paymentError && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{paymentError}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <VendorShopGuard showSubHeader={false}>
                <DashboardHeader />
                <DashboardOptions />
                <div className="flex flex-col py-[10px] px-4 sm:px-6 lg:px-25 relative">
                    <div className="w-full max-w-[359px] h-auto sm:h-[52px] gap-[16px] sm:gap-[24px] flex flex-col sm:flex-row items-start sm:items-end">
                        <p className="py-2 text-[#11151F] cursor-pointer text-[13px] sm:text-[14px] font-medium border-b-2 border-[#C6EB5F]">
                            Reviews & campaigns
                        </p>
                        <p className="py-2 cursor-pointer text-[13px] sm:text-[14px] text-gray-500">
                            Coupons
                        </p>
                    </div>
                    <div className="flex gap-[6px] sm:gap-[8px] mt-[12px] sm:mt-[15px] text-[#1E1E1E] text-[13px] sm:text-[14px] font-medium items-center">
                        <Image src={arrowBack} alt="Back arrow" width={16} height={16} className="sm:w-[18px] sm:h-[18px] cursor-pointer"/>
                        <p className="cursor-pointer">Back to reviews and campaigns</p>
                    </div>
                    <div className="flex flex-col h-auto sm:h-[92px] w-full mt-[15px] sm:mt-[20px] pb-[15px] sm:pb-[20px]">
                        <p className="text-[#101828] text-[16px] sm:text-[18px] font-medium">Promote shop</p>
                        <p className="text-[#667085] text-[13px] sm:text-[14px] mt-1">
                            Boost your shop to the top and get more customers to visit and purchase from your shop
                        </p>
                    </div>
                    {CURRENTLY_RUNNING_TIER ? (
                        <div className="flex flex-col h-auto sm:h-[290px] w-full rounded-[16px] sm:rounded-[24px] border border-[#EDEDED] p-[15px] sm:p-[20px]">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center h-auto sm:h-[92px] border-b-[0.5px] border-[#EDEDED] pb-[15px] sm:pb-0">
                                <div className="flex flex-col text-[13px] sm:text-[14px] gap-[4px] mb-3 sm:mb-0">
                                    <p className="text-[#101828] font-medium">{CURRENTLY_RUNNING_TIER.tier}</p>
                                    <p className="text-[#667085] leading-tight">
                                        Your shop is currently promoted with this tier
                                    </p>
                                </div>
                                <span className="w-full sm:w-[145px] text-[#07A341] text-[13px] sm:text-[14px] font-medium flex items-center justify-center h-[40px] sm:h-[44px] rounded-[50px] sm:rounded-[100px] bg-[#ECFDF6] border border-[#22C55E]">
                                    Currently running
                                </span>
                            </div>
                            <button
                                onClick={handleUpgradeClick}
                                className="flex items-center justify-center gap-[6px] sm:gap-[9px] text-[13px] sm:text-[14px] text-[#C6EB5F] font-semibold w-full sm:w-[174px] rounded-[10px] sm:rounded-[12px] mt-[20px] sm:mt-[28px] bg-[#022B23] h-[45px] sm:h-[52px]"
                            >
                                <p>Upgrade</p>
                                <Image src={crownImg} alt="Crown icon" width={16} height={16} className="sm:w-[20px] sm:h-[20px]"/>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col h-auto sm:h-[290px] w-full rounded-[16px] sm:rounded-[24px] border border-[#EDEDED] p-[15px] sm:p-[20px]">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center h-auto sm:h-[92px] border-b-[0.5px] border-[#EDEDED] pb-[15px] sm:pb-0">
                                <div className="flex flex-col text-[13px] sm:text-[14px] gap-[4px]">
                                    <p className="text-[#101828] font-medium">No active promotion</p>
                                    <p className="text-[#667085] leading-tight">
                                        Your shop is not currently promoted. Choose a tier to boost your visibility.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleUpgradeClick}
                                className="flex items-center justify-center gap-[6px] sm:gap-[9px] text-[13px] sm:text-[14px] text-[#C6EB5F] font-semibold w-full sm:w-[174px] rounded-[10px] sm:rounded-[12px] mt-[20px] sm:mt-[28px] bg-[#022B23] h-[45px] sm:h-[52px]"
                            >
                                <p>Promote Now</p>
                                <Image src={crownImg} alt="Crown icon" width={16} height={16} className="sm:w-[20px] sm:h-[20px]"/>
                            </button>
                        </div>
                    )}
                    <div className="flex flex-col h-auto mt-[20px] sm:mt-[30px] gap-[16px] sm:gap-[24px]">
                        <p className="text-[#022B23] text-[15px] sm:text-[16px] font-medium">Campaign Tiers ({tiers.length})</p>
                        <div className="flex flex-col sm:flex-row h-auto sm:h-[345px] w-full gap-[16px] sm:gap-[20px] sm:justify-between">
                            {tiers.map((tier, index) => (
                                <div key={tier.id} className="h-auto sm:h-full w-full sm:w-[380px] flex flex-col items-center border-[0.5px] rounded-[16px] sm:rounded-[24px] border-[#EDEDED]">
                                    <Image
                                        src={getGradientImage(index)}
                                        alt={`${tier.tier} gradient`}
                                        className="h-[80px] sm:h-[112px] rounded-tr-[16px] rounded-tl-[16px] sm:rounded-tr-[24px] sm:rounded-tl-[24px] w-full"
                                    />
                                    <div className="w-full px-[15px] sm:w-[334px] h-auto sm:h-[198px] mt-[8px] sm:mt-[10px] flex flex-col gap-[15px] sm:gap-[20px] pb-[15px] sm:pb-0">
                                        <div className="flex flex-col gap-[6px] sm:gap-[8px]">
                                            <div className="flex text-[14px] sm:text-[16px] font-semibold text-[#101828] justify-between">
                                                <p>{tier.tier}</p>
                                                <p>{formatPrice(tier.price)}</p>
                                            </div>
                                            <p className="text-[11px] sm:text-[12px] font-medium text-[#667085]">
                                                Boost your shop to the top and get more customers to visit and purchase from your shop
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-[10px] sm:gap-[14px]">
                                            <div className="flex items-center gap-[4px] text-[11px] sm:text-[12px] text-[#1E1E1E] font-medium">
                                                <Image src={greenTick} alt="Green tick icon" width={12} height={12} className="sm:w-[14px] sm:h-[14px]"/>
                                                <p>Featured: {tier.featuredNumber} products</p>
                                            </div>
                                            <div className="flex items-center gap-[4px] text-[11px] sm:text-[12px] text-[#1E1E1E] font-medium">
                                                <Image src={greenTick} alt="Green tick icon" width={12} height={12} className="sm:w-[14px] sm:h-[14px]"/>
                                                <p>Promoted: {tier.promotedNumber} products</p>
                                            </div>
                                            {tier.tier !== 'BASIC' && (
                                                <div className="flex items-center gap-[4px] text-[11px] sm:text-[12px] text-[#1E1E1E] font-medium">
                                                    <Image src={greenTick} alt="Green tick icon" width={12} height={12} className="sm:w-[14px] sm:h-[14px]"/>
                                                    <p>Floated: {tier.floatedNumber} products</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {showUpgradeModal && selectedTierInModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20 p-4">
                            <div className="relative z-10 bg-white w-full max-w-[1100px] max-h-[90vh] overflow-y-auto mx-4 px-[20px] sm:px-[40px] lg:px-[60px] py-[20px] sm:py-[30px] shadow-lg rounded-lg">
                                <div className="flex flex-col pb-2 border-b-[0.5px] border-[#EDEDED]">
                                    <p className="text-[#022B23] text-[14px] sm:text-[16px] font-medium">Promote shop payment</p>
                                    <p className="text-[#707070] text-[12px] sm:text-[14px] font-medium">Pay for your preferred tier to help your business rank better</p>
                                </div>
                                <div className="flex flex-col lg:flex-row gap-[20px] lg:gap-0">
                                    <div className="w-full lg:w-[40%]">
                                        <h3 className="text-[#101828] text-[14px] sm:text-[16px] mt-[4px] font-medium mb-2">Campaign Tiers ({tiers.length})</h3>
                                        <div className="w-full lg:w-[325px] max-h-[40vh] lg:max-h-[80vh] flex flex-col gap-[10px] overflow-y-auto">
                                            {tiers.map((tier) => (
                                                <div
                                                    key={tier.id}
                                                    className={`p-2 sm:p-3 rounded-[16px] sm:rounded-[24px] w-full h-auto min-h-[120px] sm:min-h-[140px] cursor-pointer border ${
                                                        selectedTierInModal.id === tier.id
                                                            ? 'border-[#C6EB5F] shadow-md relative pb-[30px] sm:pb-[35px]'
                                                            : 'border-[#EDEDED]'
                                                    }`}
                                                    onClick={() => handleTierSelectInModal(tier)}
                                                >
                                                    <div className="flex justify-between text-[11px] sm:text-[12px] items-center mb-2">
                                                        <h4 className="text-[#101828] font-medium">{tier.tier}</h4>
                                                        <p className="text-[#101828] font-semibold">{formatPrice(tier.price)}</p>
                                                    </div>
                                                    <p className="text-[#667085] text-[10px] sm:text-[12px] leading-tight mb-2">
                                                        Boost your shop to the top and get more customers to visit and purchase from your shop
                                                    </p>
                                                    <div className="flex flex-col gap-[6px] sm:gap-[8px]">
                                                        <div className="flex items-center gap-[4px] text-[10px] sm:text-[12px] text-[#1E1E1E] font-medium">
                                                            <Image src={greenTick} alt="Green tick icon" width={10} height={10} className="sm:w-[12px] sm:h-[12px]"/>
                                                            <p>Featured: {tier.featuredNumber} products</p>
                                                        </div>
                                                        <div className="flex items-center gap-[4px] text-[10px] sm:text-[12px] text-[#1E1E1E] font-medium">
                                                            <Image src={greenTick} alt="Green tick icon" width={10} height={10} className="sm:w-[12px] sm:h-[12px]"/>
                                                            <p>Promoted: {tier.promotedNumber} products</p>
                                                        </div>
                                                        <div className="flex items-center gap-[4px] text-[10px] sm:text-[12px] text-[#1E1E1E] font-medium">
                                                            <Image src={greenTick} alt="Green tick icon" width={10} height={10} className="sm:w-[12px] sm:h-[12px]"/>
                                                            <p>Floated: {tier.floatedNumber} products</p>
                                                        </div>
                                                    </div>
                                                    {selectedTierInModal.id === tier.id && (
                                                        <div className="absolute bottom-0 left-0 right-0 text-center text-[#1E1E1E] font-medium text-[10px] sm:text-[12px] bg-[#C6EB5F] rounded-b-[12px] h-[20px] sm:h-[24px] flex items-center justify-center">
                                                            Selected tier
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-full lg:w-[60%] flex flex-col gap-[15px] sm:gap-[20px] lg:pl-[30px] xl:pl-[50px] pt-[20px] lg:pt-[24px] pb-[2px] lg:border-l border-[#EDEDED]">
                                        <p className="text-[#022B23] text-[14px] sm:text-[16px] font-medium">Tier details</p>
                                        <div className="flex flex-col gap-[6px] sm:gap-[8px] pb-[20px] sm:pb-[24px] border-b-[0.5px] border-[#ededed]">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[12px] sm:text-[14px] text-[#707070] font-medium">Order amount</p>
                                                <p className="text-[12px] sm:text-[14px] text-[#000000] font-medium">{formatPrice(selectedTierInModal.price)}</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[12px] sm:text-[14px] text-[#707070] font-medium">Tier</p>
                                                <p className="text-[12px] sm:text-[14px] text-[#000000] font-medium">{selectedTierInModal.tier}</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[12px] sm:text-[14px] text-[#707070] font-medium">Featured Products</p>
                                                <p className="text-[12px] sm:text-[14px] text-[#000000] font-medium">{selectedTierInModal.featuredNumber}</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[12px] sm:text-[14px] text-[#707070] font-medium">Promoted Products</p>
                                                <p className="text-[12px] sm:text-[14px] text-[#000000] font-medium">{selectedTierInModal.promotedNumber}</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[12px] sm:text-[14px] text-[#707070] font-medium">Floated Products</p>
                                                <p className="text-[12px] sm:text-[14px] text-[#000000] font-medium">{selectedTierInModal.floatedNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-[10px] sm:gap-[15px] mt-[15px] sm:mt-[20px]">
                                            <button
                                                onClick={closeModal}
                                                className="flex-1 h-[45px] sm:h-[52px] border border-[#D1D1D1] rounded-[10px] sm:rounded-[12px] text-[#666] text-[13px] sm:text-[14px] font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleMakePayment}
                                                disabled={isProcessingPayment}
                                                className={`flex-1 flex gap-[6px] sm:gap-[9px] justify-center items-center bg-[#022B23] rounded-[10px] sm:rounded-[12px] h-[45px] sm:h-[52px] hover:bg-[#033a30] transition-colors ${isProcessingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isProcessingPayment ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                        <span className="text-[#C6EB5F] font-semibold text-[13px] sm:text-[14px]">Processing...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-[#C6EB5F] font-semibold text-[13px] sm:text-[14px]">Make Payment</span>
                                                        <Image src={limeArrow} alt="Continue arrow" width={16} height={16} className="sm:w-[18px] sm:h-[18px]" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </VendorShopGuard>
        </>
    );
};

export default PromoteShop;