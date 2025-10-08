'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import shadow from '../../../public/assets/images/shadow.png';
import headerIcon from '../../../public/assets/images/headerImg.png';
import emailIcon from '../../../public/assets/images/sms.svg';
import verifyEmailImg from '../../../public/assets/images/loginImg.svg';
import Toast from '@/components/Toast';
import { userService } from '@/services/userService';

const VerifyEmail = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [toastMessage, setToastMessage] = useState('');
    const [toastSubMessage, setToastSubMessage] = useState('');
    const [focused, setFocused] = useState(false);
    const router = useRouter();

    const showToastMessage = (type: 'success' | 'error', message: string, subMessage: string) => {
        setToastType(type);
        setToastMessage(message);
        setToastSubMessage(subMessage);
        setShowToast(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            showToastMessage('error', 'Email Required', 'Please enter your email address');
            return;
        }

        setIsLoading(true);

        try {
            const result = await userService.sendVerificationOTP(email);
            
            if (result.success) {
                showToastMessage('success', 'Verification Code Sent', `A verification code has been sent to ${email}`);
                // Store email for the next step and redirect
                localStorage.setItem('verifyEmail', email);
                setTimeout(() => {
                    router.push(`/verify-email/confirm?email=${encodeURIComponent(email)}`);
                }, 2000);
            } else {
                showToastMessage('error', 'Failed to Send Code', result.message);
            }
        } catch (error) {
            console.error('Send verification error:', error);
            showToastMessage('error', 'Request Failed', 'Unable to send verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseToast = () => setShowToast(false);

    return (
        <>
            {showToast && (
                <Toast
                    type={toastType}
                    message={toastMessage}
                    subMessage={toastSubMessage}
                    onClose={handleCloseToast}
                />
            )}
            <div
                className="h-[90px] md:pl-[185px] pl-[20px] py-[10px] w-full flex items-center gap-[14px]"
                style={{
                    backgroundImage: `url(${shadow.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="flex items-center gap-[4px] w-[95px] h-[47px]">
                    <Image src={headerIcon} alt="MarketGo icon" className="w-[50%] h-full" />
                    <div className="flex flex-col">
                        <p className="text-[12px] font-semibold text-[#022B23] leading-tight">
                            Market
                            <br />
                            <span className="text-[#C6EB5F]">Go</span>
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-90px)]">
                <div className="w-full lg:w-[49%] px-4 sm:px-6 lg:pl-[185px] lg:pr-0 flex-col flex pt-8 sm:pt-12 lg:pt-[190px] pb-8">
                    <div className="w-full lg:w-[400px] flex flex-col gap-6 sm:gap-8 lg:gap-[60px]">
                        <div className="flex flex-col leading-tight gap-3 sm:gap-[14px]">
                            <div className="flex flex-col leading-tight">
                                <p className="font-['Instrument_Serif'] text-[#707070] font-medium text-xl sm:text-[24px] italic">Email Verification</p>
                                <p className="text-xl sm:text-[24px] font-medium text-[#022B23]">Verify your account</p>
                            </div>
                            <p className="text-[#1E1E1E] text-sm sm:text-[16px]">Enter your email address and we&#39;ll send you a verification code</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="relative w-full flex flex-col mb-[14px]">
                                <label
                                    htmlFor="email"
                                    className={`absolute left-4 transition-all ${
                                        focused || email ? 'text-[#6D6D6D] text-[12px] font-medium top-[6px]' : 'hidden'
                                    }`}
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocused(true)}
                                        onBlur={() => setFocused(false)}
                                        placeholder={!focused && !email ? 'Email' : ''}
                                        className={`px-3 sm:px-4 h-12 sm:h-[58px] w-full border-[1.5px] border-[#D1D1D1] rounded-xl sm:rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] transition-all ${
                                            focused || email
                                                ? 'pt-3 sm:pt-[14px] pb-1 sm:pb-[4px] text-[#121212] text-sm sm:text-[14px] font-medium'
                                                : 'text-[#BDBDBD] text-sm sm:text-[16px] font-medium'
                                        }`}
                                        required
                                    />
                                    {(focused || email) && (
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                            <Image src={emailIcon} alt="Email icon" width={20} height={20} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                className="flex items-center justify-center cursor-pointer bg-[#033228] rounded-xl sm:rounded-[12px] w-full h-12 sm:h-[52px] text-sm sm:text-[14px] font-semibold text-[#C6EB5F] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#C6EB5F]"></div>
                                    </div>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </button>
                        </form>
                    </div>
                    
                    <p className="mt-4 sm:mt-6 text-[#7C7C7C] text-sm sm:text-[14px]">
                        Already verified?{' '}
                        <span onClick={() => router.push('/login')} className="text-[#001234] text-sm sm:text-[16px] cursor-pointer hover:underline transition-all">
                            Sign in
                        </span>
                    </p>
                </div>
                <div className="hidden lg:flex mt-[-90px] w-[51%] justify-between flex-col bg-[#f9f9f9] pt-[136px] min-h-[calc(100vh-90px)]">
                    <p className="ml-[60px] xl:ml-[100px] text-[#000000] leading-tight text-[28px] xl:text-[40px] italic font-['Instrument_Serif']">
                        Verify your email <br /> to get started
                    </p>
                    <div className="flex justify-end items-end flex-1">
                        <Image src={verifyEmailImg} alt="Email verification illustration" width={670} height={700} className="w-[450px] xl:w-[670px] h-auto" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifyEmail;