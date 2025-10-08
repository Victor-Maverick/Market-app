'use client'
import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import farmGoLogo from "../../../../public/assets/images/farmGoLogo.png";
import arrowLeft from "../../../../public/assets/images/arrow-right.svg";
import goodsPack from "../../../../public/assets/images/goodsPack.png";
import envelopeImg from '@/../public/assets/images/envelopeImg.svg';
import { useRouter, useSearchParams } from "next/navigation";
import Toast from '@/components/Toast';
import OTPInput, { OTPInputRef } from '@/components/OTPInput';
import { userService } from '@/services/userService';

const VerifyEmailConfirm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userEmail, setUserEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [otpError, setOtpError] = useState(false);
    const otpInputRef = useRef<OTPInputRef>(null);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [toast, setToast] = useState<{
        show: boolean;
        type: "success" | "error";
        message: string;
        subMessage: string;
    } | null>(null);

    useEffect(() => {
        // Get user email from localStorage or URL params
        const email = localStorage.getItem('verifyEmail') || searchParams.get('email') || '';
        
        if (email) {
            setUserEmail(email);
        } else {
            // Redirect back to verify email if no email
            router.push('/verify-email');
        }
    }, [searchParams, router]);

    // Countdown timer for resend button
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCountdown > 0) {
            timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCountdown]);

    const handleBack = () => {
        router.push("/verify-email");
    };

    const handleOTPComplete = async (otpValue: string) => {
        if (!userEmail) {
            setToast({
                show: true,
                type: "error",
                message: "Email not found",
                subMessage: "Please go back and try again"
            });
            return;
        }

        setIsVerifying(true);
        setOtpError(false);

        try {
            const result = await userService.verifyOTP(userEmail, otpValue);
             if (result.success) {
                setToast({
                    show: true,
                    type: "success",
                    message: "Email Verified Successfully",
                    subMessage: "Your account has been verified. Redirecting..."
                });
                localStorage.removeItem('verifyEmail');
                localStorage.removeItem('unverifiedEmail');
                const source = searchParams.get('source');
                setTimeout(() => {
                    if (source === 'register') {
                        router.push(`/register/userType?email=${encodeURIComponent(userEmail)}`);
                    } else {
                        router.push('/login');
                    }
                }, 2000);
            } else {
                setOtpError(true);
                setToast({
                    show: true,
                    type: "error",
                    message: "Verification Failed",
                    subMessage: result.message
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setOtpError(true);
            setToast({
                show: true,
                type: "error",
                message: "Verification Failed",
                subMessage: "An unexpected error occurred"
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleOTPChange = () => {
        if (otpError) {
            setOtpError(false);
        }
    };

    const handleResendOTP = async () => {
        if (!userEmail) {
            setToast({
                show: true,
                type: "error",
                message: "Email not found",
                subMessage: "Please go back and try again"
            });
            return;
        }

        if (resendCountdown > 0) return;

        setIsResending(true);
        try {
            const result = await userService.sendVerificationOTP(userEmail);
            
            if (result.success) {
                setToast({
                    show: true,
                    type: "success",
                    message: "Code sent",
                    subMessage: "A new verification code has been sent to your email"
                });
                setResendCountdown(60); // 60 second countdown
                otpInputRef.current?.clear(); // Clear current OTP
                setOtpError(false);
            } else {
                setToast({
                    show: true,
                    type: "error",
                    message: "Resend failed",
                    subMessage: result.message
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setToast({
                show: true,
                type: "error",
                message: "Resend failed",
                subMessage: "Failed to resend verification code"
            });
        } finally {
            setIsResending(false);
        }
    };

    const closeToast = () => {
        setToast(null);
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    subMessage={toast.subMessage}
                    onClose={closeToast}
                />
            )}
            {/* Left Panel - Main content */}
            <div className="w-full md:w-2/3 pb-10 z-10 flex flex-col">
                {/* Logo */}
                <div className="mt-8 md:mt-16 ml-[20px] mx-auto md:mx-0 md:ml-24">
                    <Image src={farmGoLogo} alt="logo" width={90} height={45} />
                </div>

                {/* Main content container */}
                <div className="px-6 mx-auto md:mx-0 md:ml-52 mt-6 md:mt-10 w-full max-w-[400px]">
                    {/* Progress indicator */}
                    <div className="flex justify-between items-center">
                        <p className="text-[#022B23] text-sm font-medium">EMAIL VERIFICATION</p>
                        <p className="text-[#022B23] text-sm font-medium">1/1</p>
                    </div>

                    <div className="flex gap-2.5 mt-2">
                        <div className="w-20 h-1.5 bg-[#C6EB5F]"></div>
                    </div>

                    {/* Back button */}
                    <div onClick={handleBack} className="flex items-center mt-4 gap-1 cursor-pointer">
                        <Image src={arrowLeft} alt="arrow" width={24} height={24} />
                        <p className="text-[#7C7C7C] text-[16px]">Go back</p>
                    </div>

                    {/* Content */}
                    <div className="mt-10 md:mt-16">
                        <div className="flex flex-col items-center md:items-start gap-6 md:gap-[38px]">
                            {/* Envelope image */}
                            <div className="flex justify-center w-full md:justify-start">
                                <Image
                                    src={envelopeImg}
                                    alt="email verification"
                                    width={110}
                                    height={110}
                                    className="md:w-[130px] md:h-[130px]"
                                />
                            </div>

                            {/* Verification text */}
                            <div className="flex flex-col md:text-left text-center md:text-left">
                                <p className="text-[#022B23] font-medium text-[18px] md:text-[20px]">
                                    Enter verification code
                                </p>
                                <p className="text-[#1E1E1E] text-[14px] md:text-[16px] font-medium mt-1">
                                    We&#39;ve sent a 4-digit code to {userEmail}
                                </p>
                            </div>

                            {/* OTP Input */}
                            <div className="w-full flex flex-col items-center gap-4">
                                <OTPInput
                                    ref={otpInputRef}
                                    length={4}
                                    onComplete={handleOTPComplete}
                                    onOtpChange={handleOTPChange}
                                    disabled={isVerifying}
                                    error={otpError}
                                    autoFocus={true}
                                />
                                
                                {isVerifying && (
                                    <div className="flex items-center gap-2 text-[#7C7C7C] text-sm">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#022B23]"></div>
                                        <span>Verifying...</span>
                                    </div>
                                )}
                            </div>

                            {/* Resend option */}
                            <p className="mt-[10px] text-center md:text-left text-[14px] md:text-[16px] text-[#7C7C7C]">
                                Didn&#39;t receive the code? {' '}
                                <span 
                                    onClick={handleResendOTP}
                                    className={`font-medium underline text-[#022B23] cursor-pointer ${
                                        isResending || resendCountdown > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#033228]'
                                    }`}
                                >
                                    {isResending 
                                        ? 'Sending...' 
                                        : resendCountdown > 0 
                                            ? `Resend in ${resendCountdown}s`
                                            : 'Resend code'
                                    }
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Image section - Hidden on mobile */}
            <div className="hidden md:flex md:flex-col bg-[#fffaeb] h-auto w-1/3">
                <div className="flex-col pt-[161px] px-[20px]">
                    <p className="font-medium text-[#461602] text-[20px]">Email Verification</p>
                    <p className="pt-[10px] text-[#022B23] font-medium text-[24px] leading-tight">
                        Verify your email to
                        <br />activate your account
                    </p>
                </div>
                <div className="mt-auto">
                    <Image
                        src={goodsPack}
                        alt="verification illustration"
                        width={600}
                        height={400}
                        className="mt-[80px] w-full"
                        priority
                    />
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailConfirm;