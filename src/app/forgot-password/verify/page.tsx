'use client'
import { useState, useEffect } from 'react';
import Image from "next/image";
import farmGoLogo from "../../../../public/assets/images/farmGoLogo.png";
import arrowLeft from "../../../../public/assets/images/arrow-right.svg";
import limeArrow from "../../../../public/assets/images/green arrow.png";
import goodsPack from "../../../../public/assets/images/goodsPack.png";
import lockImg from '@/../public/assets/images/envelopeImg.svg';
import eyeOpen from '../../../../public/assets/images/eye.svg'; 
import eyeClosed from '../../../../public/assets/images/eye.svg';
import { useRouter, useSearchParams } from "next/navigation";
import Toast from '@/components/Toast';
import OTPInput from '@/components/OTPInput';
import { userService } from '@/services/userService';

const ForgotPasswordVerify = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userEmail, setUserEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
    const [toast, setToast] = useState<{
        show: boolean;
        type: "success" | "error";
        message: string;
        subMessage: string;
    } | null>(null);

    useEffect(() => {
        // Get user email from localStorage or URL params
        const email = localStorage.getItem('resetEmail') || searchParams.get('email') || '';
        
        if (email) {
            setUserEmail(email);
        } else {
            // Redirect back to forgot password if no email
            router.push('/forgot-password');
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
        router.push("/forgot-password");
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
            const result = await userService.verifyPasswordResetOTP(userEmail, otpValue);
            
            if (result.success) {
                setToast({
                    show: true,
                    type: "success",
                    message: "OTP Verified",
                    subMessage: "Please enter your new password"
                });
                setShowPasswordForm(true);
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

    const handleOTPChange = (otpValue: string) => {
        setOtp(otpValue);
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
            const result = await userService.forgotPassword(userEmail);
            
            if (result.success) {
                setToast({
                    show: true,
                    type: "success",
                    message: "Code sent",
                    subMessage: "A new reset code has been sent to your email"
                });
                setResendCountdown(60); // 60 second countdown
                setOtp(''); // Clear current OTP
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
                subMessage: "Failed to resend reset code"
            });
        } finally {
            setIsResending(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setToast({
                show: true,
                type: "error",
                message: "Passwords don't match",
                subMessage: "Please make sure both passwords are the same"
            });
            return;
        }

        if (newPassword.length < 6) {
            setToast({
                show: true,
                type: "error",
                message: "Password too short",
                subMessage: "Password must be at least 6 characters long"
            });
            return;
        }

        setIsResetting(true);

        try {
            const result = await userService.resetPasswordWithOTP(userEmail, otp, newPassword);
            
            if (result.success) {
                setToast({
                    show: true,
                    type: "success",
                    message: "Password Reset Successful",
                    subMessage: "You can now login with your new password"
                });
                
                // Clean up and redirect to login
                localStorage.removeItem('resetEmail');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setToast({
                    show: true,
                    type: "error",
                    message: "Reset Failed",
                    subMessage: result.message
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setToast({
                show: true,
                type: "error",
                message: "Reset Failed",
                subMessage: "An unexpected error occurred"
            });
        } finally {
            setIsResetting(false);
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
                        <p className="text-[#022B23] text-sm font-medium">PASSWORD RESET</p>
                        <p className="text-[#022B23] text-sm font-medium">{showPasswordForm ? '2/2' : '1/2'}</p>
                    </div>

                    <div className="flex gap-2.5 mt-2">
                        <div className="w-20 h-1.5 bg-[#C6EB5F]"></div>
                        <div className={`w-20 h-1.5 ${showPasswordForm ? 'bg-[#C6EB5F]' : 'bg-[#F0FACD]'}`}></div>
                    </div>

                    {/* Back button */}
                    <div onClick={handleBack} className="flex items-center mt-4 gap-1 cursor-pointer">
                        <Image src={arrowLeft} alt="arrow" width={24} height={24} />
                        <p className="text-[#7C7C7C] text-[16px]">Go back</p>
                    </div>

                    {/* Content */}
                    <div className="mt-10 md:mt-16">
                        {!showPasswordForm ? (
                            <div className="flex flex-col items-center md:items-start gap-6 md:gap-[38px]">
                                {/* Lock image */}
                                <div className="flex justify-center w-full md:justify-start">
                                    <Image
                                        src={lockImg}
                                        alt="password reset"
                                        width={110}
                                        height={110}
                                        className="md:w-[130px] md:h-[130px]"
                                    />
                                </div>

                                {/* Verification text */}
                                <div className="flex flex-col md:text-left text-center md:text-left">
                                    <p className="text-[#022B23] font-medium text-[18px] md:text-[20px]">
                                        Enter reset code
                                    </p>
                                    <p className="text-[#1E1E1E] text-[14px] md:text-[16px] font-medium mt-1">
                                        We&#39;ve sent a 4-digit code to {userEmail}
                                    </p>
                                </div>

                                {/* OTP Input */}
                                <div className="w-full flex flex-col items-center gap-4">
                                    <OTPInput
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
                        ) : (
                            <div className="flex flex-col gap-6">
                                {/* Password reset form */}
                                <div className="flex flex-col text-center md:text-left">
                                    <p className="text-[#022B23] font-medium text-[18px] md:text-[20px]">
                                        Set new password
                                    </p>
                                    <p className="text-[#1E1E1E] text-[14px] md:text-[16px] font-medium mt-1">
                                        Enter your new password below
                                    </p>
                                </div>

                                <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
                                    {/* New Password */}
                                    <div className="relative w-full flex flex-col">
                                        <label
                                            htmlFor="newPassword"
                                            className={`absolute left-4 transition-all ${
                                                passwordFocused || newPassword ? 'text-[#6D6D6D] text-[12px] font-medium top-[6px]' : 'hidden'
                                            }`}
                                        >
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="newPassword"
                                                type={showPassword ? 'text' : 'password'}
                                                name="newPassword"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                onFocus={() => setPasswordFocused(true)}
                                                onBlur={() => setPasswordFocused(false)}
                                                placeholder={!passwordFocused && !newPassword ? 'New Password' : ''}
                                                className={`px-3 sm:px-4 h-12 sm:h-[58px] w-full border-[1.5px] border-[#D1D1D1] rounded-xl sm:rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] transition-all ${
                                                    passwordFocused || newPassword
                                                        ? 'pt-3 sm:pt-[14px] pb-1 sm:pb-[4px] text-[#121212] text-sm sm:text-[14px] font-medium'
                                                        : 'text-[#BDBDBD] text-sm sm:text-[16px] font-medium'
                                                }`}
                                                required
                                                minLength={6}
                                            />
                                            {(passwordFocused || newPassword) && (
                                                <div
                                                    className="absolute right-4 px-[6px] py-[4px] flex items-center text-[#DCDCDC] text-[12px] shadow-md gap-[8px] rounded-[8px] border-[1px] border-[#EAEAEA] w-[72px] top-1/2 transform -translate-y-1/2 cursor-pointer bg-white"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    <Image
                                                        src={showPassword ? eyeOpen : eyeClosed}
                                                        alt={showPassword ? 'Hide password' : 'Show password'}
                                                        width={16}
                                                        height={16}
                                                    />
                                                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="relative w-full flex flex-col">
                                        <label
                                            htmlFor="confirmPassword"
                                            className={`absolute left-4 transition-all ${
                                                confirmPasswordFocused || confirmPassword ? 'text-[#6D6D6D] text-[12px] font-medium top-[6px]' : 'hidden'
                                            }`}
                                        >
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                onFocus={() => setConfirmPasswordFocused(true)}
                                                onBlur={() => setConfirmPasswordFocused(false)}
                                                placeholder={!confirmPasswordFocused && !confirmPassword ? 'Confirm Password' : ''}
                                                className={`px-3 sm:px-4 h-12 sm:h-[58px] w-full border-[1.5px] border-[#D1D1D1] rounded-xl sm:rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] transition-all ${
                                                    confirmPasswordFocused || confirmPassword
                                                        ? 'pt-3 sm:pt-[14px] pb-1 sm:pb-[4px] text-[#121212] text-sm sm:text-[14px] font-medium'
                                                        : 'text-[#BDBDBD] text-sm sm:text-[16px] font-medium'
                                                }`}
                                                required
                                                minLength={6}
                                            />
                                            {(confirmPasswordFocused || confirmPassword) && (
                                                <div
                                                    className="absolute right-4 px-[6px] py-[4px] flex items-center text-[#DCDCDC] text-[12px] shadow-md gap-[8px] rounded-[8px] border-[1px] border-[#EAEAEA] w-[72px] top-1/2 transform -translate-y-1/2 cursor-pointer bg-white"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    <Image
                                                        src={showConfirmPassword ? eyeOpen : eyeClosed}
                                                        alt={showConfirmPassword ? 'Hide password' : 'Show password'}
                                                        width={16}
                                                        height={16}
                                                    />
                                                    <span>{showConfirmPassword ? 'Hide' : 'Show'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reset button */}
                                    <button
                                        type="submit"
                                        className="w-full flex gap-[9px] justify-center items-center rounded-[12px] h-[52px] bg-[#022B23] cursor-pointer hover:bg-[#033228] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                        disabled={isResetting}
                                    >
                                        {isResetting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#C6EB5F]"></div>
                                                <span className="font-semibold text-[14px] text-[#C6EB5F]">Resetting...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-[14px] text-[#C6EB5F]">
                                                    Reset Password
                                                </p>
                                                <Image
                                                    src={limeArrow}
                                                    alt="reset arrow"
                                                    width={18}
                                                    height={18}
                                                />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel - Image section - Hidden on mobile */}
            <div className="hidden md:flex md:flex-col bg-[#fffaeb] h-auto w-1/3">
                <div className="flex-col pt-[161px] px-[20px]">
                    <p className="font-medium text-[#461602] text-[20px]">Reset Password</p>
                    <p className="pt-[10px] text-[#022B23] font-medium text-[24px] leading-tight">
                        Secure your account with
                        <br />a new password
                    </p>
                </div>
                <div className="mt-auto">
                    <Image
                        src={goodsPack}
                        alt="security illustration"
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

export default ForgotPasswordVerify;