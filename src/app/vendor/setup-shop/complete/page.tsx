'use client';
import DashboardSubHeader from "@/components/dashboardSubHeader";
import DashboardHeader from "@/components/dashboardHeader";
import DashboardOptions from "@/components/dashboardOptions";
import Image from "next/image";
import arrow from "../../../../../public/assets/images/arrow-right.svg";
import limeArrow from "../../../../../public/assets/images/green arrow.png";
import doneImg from "../../../../../public/assets/images/doneImg.png";
import dashSlideImg from "../../../../../public/assets/images/dashSlideImg.png";
import { addShop } from "@/utils/api";
import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Toast from "@/components/Toast";
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Script from 'next/script';

interface ShopInfo {
    shopName: string;
    shopAddress: string;
    shopNumber: string;
    marketId: number;
    marketSectionId: number;
    cacNumber: string;
    taxIdNumber: string;
    logoImage?: string | null;
}

interface PersonalInfo {
    homeAddress: string;
    street: string;
    NIN: string;
    phone: string;
    lgaId: number;
}

interface BankInfo {
    bankName: string;
    bankCode: string;
    accountNumber: string;
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
    execTime?: number;
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

const storeTotalAmount = (amount: number) => {
    const paymentData = { amount, timestamp: new Date().getTime() };
    localStorage.setItem('expectedPayment', JSON.stringify(paymentData));
};

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

const clearStoredTotalAmount = () => {
    localStorage.removeItem('expectedPayment');
};

const SetupCompleteContent = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [summaryData, setSummaryData] = useState({
        shopInfo: null as ShopInfo | null,
        personalInfo: null as PersonalInfo | null,
        bankInfo: null as BankInfo | null,
    });
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [toastSubMessage, setToastSubMessage] = useState("");
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        try {
            const shopInfoStr = localStorage.getItem('shopInfo');
            const personalInfoStr = localStorage.getItem('personalInfo');
            const bankInfoStr = localStorage.getItem('bankInfo');
            const paymentEmail = session?.user?.email;
            setSummaryData({
                shopInfo: shopInfoStr ? JSON.parse(shopInfoStr) : null,
                personalInfo: personalInfoStr ? JSON.parse(personalInfoStr) : null,
                bankInfo: bankInfoStr ? JSON.parse(bankInfoStr) : null,
            });
            setIsDataLoaded(true);
        } catch (err) {
            console.error('Error loading data from localStorage', err);
            showErrorToast('Setup Error', 'Error loading your information. Please go back and try again.');
        }
    }, [session?.user?.email]);

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

    const verifyShopStatus = async (email: string) => {
        if (!email) throw new Error('Email not available for verification');
        try {
            const response = await axios.put(
                'https://digitalmarket.benuestate.gov.ng/api/shops/update-status',
                null,
                { params: { email }, headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
            );
            return response.status === 200;
        } catch (error) {
            console.error('Error verifying shop status:', error);
            return false;
        }
    };

    const initializePayment = async (): Promise<PaymentData> => {
        if (!session?.user?.email) throw new Error('User session not available. Please try again.');
        try {
            const requestData = {
                email: session.user.email,
                amount: 5000,
                currency: 'NGN',
                callbackUrl: `${window.location.origin}/vendor/setup-shop/complete`,
                paymentType: "SHOP_ACTIVATION",
            };
            storeTotalAmount(5000);
            const response = await axios.post<InitializePaymentResponse>(
                'https://digitalmarket.benuestate.gov.ng/api/payments/initialize',
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

    const verifyPayment = useCallback(async (transRef: string) => {
        setIsVerifying(true);
        setPaymentError(null);
        try {
            if (!session?.user?.email) throw new Error('User authentication timed out');
            const response = await axios.get<VerifyPaymentResponse>(
                `https://digitalmarket.benuestate.gov.ng/api/payments/verify?reference=${transRef}`,
                { timeout: 20000 }
            );
            if (response.data.data) {
                const paymentData = response.data.data;
                const expectedAmount = getStoredTotalAmount();
                if (expectedAmount && Math.abs(paymentData.amount - expectedAmount) > 0.01) {
                    throw new Error('Payment amount does not match expected amount');
                }
                const shopVerified = await verifyShopStatus(session.user.email);
                if (!shopVerified) throw new Error('Shop verification failed');
                clearStoredTotalAmount();
                showSuccessToast('Payment Successful', 'Your shop has been activated successfully');
                localStorage.removeItem('shopInfo');
                localStorage.removeItem('personalInfo');
                localStorage.removeItem('bankInfo');
                router.replace('/vendor/dashboard');
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
    }, [session, router]);

    const handleContinue = async () => {
        if (!session) {
            showErrorToast('Authentication Error', 'Please log in to proceed with payment');
            localStorage.setItem('preAuthUrl', window.location.pathname);
            router.push('/login');
            return;
        }
        setIsLoading(true);
        try {
            if (!summaryData.shopInfo || !summaryData.personalInfo || !summaryData.bankInfo) {
                throw new Error('Missing required information. Please complete all setup-shop steps.');
            }
            await addShop({
                shopInfo: summaryData.shopInfo,
                personalInfo: summaryData.personalInfo,
                bankInfo: summaryData.bankInfo,
                email: session.user.email,
            });
            const paymentData = await initializePayment();
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
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            showErrorToast('Setup Error', errorMessage);
            setIsLoading(false);
        }
    };

    const handleSkip = async () => {
        if (!session) {
            showErrorToast('Authentication Error', 'Please log in to proceed');
            localStorage.setItem('preAuthUrl', window.location.pathname);
            router.push('/login');
            return;
        }
        setIsLoading(true);
        try {
            if (!summaryData.shopInfo || !summaryData.personalInfo || !summaryData.bankInfo) {
                throw new Error('Missing required information. Please complete all setup-shop steps.');
            }
            await addShop({
                shopInfo: summaryData.shopInfo,
                personalInfo: summaryData.personalInfo,
                bankInfo: summaryData.bankInfo,
                email: session.user.email,
            });
            localStorage.removeItem('shopInfo');
            localStorage.removeItem('personalInfo');
            localStorage.removeItem('bankInfo');
            showSuccessToast('Setup Complete', 'You have successfully skipped payment. Redirecting to dashboard...');
            router.push("/vendor/dashboard");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            showErrorToast('Setup Error', errorMessage);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isDataLoaded) return;
        const transRef = searchParams.get('reference');
        if (transRef && session) {
            verifyPayment(transRef);
        }
    }, [searchParams, verifyPayment, isDataLoaded, session]);

    const handleBack = () => router.push("/vendor/dashboard/bank-info");
    const returnToShopInfo = () => router.push("/vendor/dashboard/shop-info");
    const returnToPersonalInfo = () => router.push("/vendor/dashboard/personal-info");

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
            <DashboardHeader />
            <DashboardOptions />
            <DashboardSubHeader
                welcomeText="Hey, welcome"
                description="Get started by setting up your shop"
                background="#ECFDF6"
                image={dashSlideImg}
                textColor="#05966F"
            />
            <div className="h-[44px] gap-[8px] border-b-[0.5px] px-25 border-[#ededed] flex items-center">
                <Image src={arrow} alt="arrow image" className="cursor-pointer" onClick={handleBack} />
                <p className="text-[14px] font-normal">
                    <span className="cursor-pointer" onClick={returnToShopInfo}>Shop information //</span>
                    <span className="cursor-pointer" onClick={returnToPersonalInfo}> Vendor information //</span>
                    <span className="cursor-pointer" onClick={handleBack}> Bank Details //</span>
                    <span className="cursor-pointer font-medium"> Complete</span>
                </p>
            </div>
            <div className="flex ml-[366px] w-auto mt-16 gap-25">
                <div className="flex flex-col gap-15 h-auto">
                    <div className="flex flex-col w-[268px] h-[67px] gap-[10px]">
                        <p className="text-[#022B23] text-[16px] font-medium">Setup complete</p>
                        <p className="text-[#707070] font-medium text-[14px]">
                            Your setup is complete and pending approval, you&#39;ll be notified when approved.
                        </p>
                    </div>
                    <div className="flex flex-col w-[244px] py-[10px] px-[12px] border border-[#ededed] h-[87px] bg-[#FCFCFC] rounded-[12px] gap-[7px]">
                        <p className="text-[#707070] text-[14px] font-medium leading-tight">
                            Pay a store activation fee<br />
                            to continue
                        </p>
                        <p className="text-[#000000] font-semibold text-[20px]">
                            NGN 5,000.00
                        </p>
                    </div>
                </div>
                <div className="flex flex-col w-[400px] h-auto gap-[38px]">
                    <div className="flex flex-col items-center h-[218px] w-full justify-center">
                        <Image src={doneImg} alt="setup complete image" />
                    </div>
                    <div>
                        <button
                            className={`flex mb-[20px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors w-full ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={handleContinue}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <p className="text-[#C6EB5F] font-semibold text-[14px]">Processing...</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-[#C6EB5F] font-semibold text-[14px]">Continue to payment</p>
                                    <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />
                                </>
                            )}
                        </button>
                        <p onClick={handleSkip} className="text-[14px] mb-[30px] cursor-pointer text-center font-medium text-[#707070]">Skip for now</p>
                    </div>
                </div>
            </div>
        </>
    );
};

const SetupComplete = () => {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        }>
            <SetupCompleteContent />
        </Suspense>
    );
};

export default SetupComplete;