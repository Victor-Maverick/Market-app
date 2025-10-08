'use client';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from 'axios';
import topGraphics from '../../../../public/assets/images/topGraphics.png';
import farmGoLogo from '../../../../public/assets/images/farmGoLogo.png';
import limeArrow from '../../../../public/assets/images/green arrow.png';
import onboardImage from '../../../../public/assets/images/getStartedImg.svg';
import emailIcon from '../../../../public/assets/images/sms.svg';
import eyeOpen from '../../../../public/assets/images/eye.svg';
import eyeClosed from '../../../../public/assets/images/eye.svg';
import Toast from "@/components/Toast";
import ReCAPTCHA from "react-google-recaptcha";

type FormField = {
    id: keyof FormData;
    label: string;
    type: 'text' | 'email' | 'password';
    withIcon?: boolean;
};

type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type PasswordValidation = {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    specialChar: boolean;
    number: boolean;
};

const formFields: FormField[] = [
    { id: 'firstName', label: 'First name', type: 'text' },
    { id: 'lastName', label: 'Last name', type: 'text' },
    { id: 'email', label: 'Email', type: 'email', withIcon: true },
    { id: 'password', label: 'Create password', type: 'password' },
    { id: 'confirmPassword', label: 'Confirm password', type: 'password' },
];

const passwordCriteria = [
    { key: 'length', label: '8 characters' },
    { key: 'lowercase', label: 'one lowercase character' },
    { key: 'uppercase', label: 'one uppercase character' },
    { key: 'specialChar', label: 'special character' },
    { key: 'number', label: 'number' },
];

const GetStarted = () => {
    const router = useRouter();
    const [form, setForm] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [focusedFields, setFocusedFields] = useState<Record<keyof FormData, boolean>>(
        Object.fromEntries(Object.keys(form).map(key => [key, false])) as Record<keyof FormData, boolean>
    );
    const [passwordValid, setPasswordValid] = useState<PasswordValidation>({
        length: false,
        lowercase: false,
        uppercase: false,
        specialChar: false,
        number: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{
        show: boolean;
        type: "success" | "error";
        message: string;
        subMessage: string;
    } | null>(null);
    const [captchaToken, setCaptchaToken] = useState('');

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === 'password') {
            setPasswordValid({
                length: value.length >= 8,
                lowercase: /[a-z]/.test(value),
                uppercase: /[A-Z]/.test(value),
                specialChar: /[^A-Za-z0-9]/.test(value),
                number: /[0-9]/.test(value)
            });
        }
    };

    const handleFocus = (field: keyof FormData) => {
        setFocusedFields(prev => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field: keyof FormData) => {
        setFocusedFields(prev => ({ ...prev, [field]: false }));
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const getInputType = (field: FormField): string => {
        if (field.id === 'password') return showPassword ? 'text' : 'password';
        if (field.id === 'confirmPassword') return showConfirmPassword ? 'text' : 'password';
        return field.type;
    };

    const shouldShowIcon = (field: FormField) => {
        return (focusedFields[field.id] || form[field.id]) && field.withIcon;
    };

    const shouldShowPasswordToggle = (field: FormField) => {
        return (focusedFields[field.id] || form[field.id]) && field.type === 'password';
    };

    const validateForm = (): boolean => {
        if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
            setToast({
                show: true,
                type: "error",
                message: "Missing information",
                subMessage: "Please fill all required fields"
            });
            return false;
        }

        if (form.password !== form.confirmPassword) {
            setToast({
                show: true,
                type: "error",
                message: "Password mismatch",
                subMessage: "Passwords don't match"
            });
            return false;
        }

        const allCriteriaMet = Object.values(passwordValid).every(valid => valid);
        if (!allCriteriaMet) {
            setToast({
                show: true,
                type: "error",
                message: "Invalid password",
                subMessage: "Password does not meet all requirements"
            });
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            setToast({
                show: true,
                type: "error",
                message: "Invalid email",
                subMessage: "Please provide a valid email address"
            });
            return false;
        }

        if (!captchaToken) {
            setToast({
                show: true,
                type: "error",
                message: "Captcha Required",
                subMessage: "Please complete the captcha challenge"
            });
            return false;
        }

        return true;
    };

    const registerUser = async () => {
        const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;
        try {
            const formData = new FormData();
            formData.append('email', form.email);
            formData.append('lastName', form.lastName);
            formData.append('firstName', form.firstName);
            formData.append('password', form.password);

            const response = await axios.post(`${API_URL}/users/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            localStorage.setItem('userEmail', form.email);
            localStorage.setItem('password', form.password);
            return { success: true, data: response.data };
        } catch (error) {
            console.log("Error: ", error);

            let errorMessage = "Registration failed. Please try again.";
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const subMessage = error.response?.data;
            const mainError = "Registration failed. Please try again.";

            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            setToast({
                show: true,
                type: "error",
                message: mainError,
                subMessage: subMessage.toString()
            });

            return { success: false, error: errorMessage };
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        const result = await registerUser();

        if (result.success) {
            setToast({
                show: true,
                type: "success",
                message: "Registration successful",
                subMessage: "Redirecting to verification page"
            });
            localStorage.setItem('verifyEmail', form.email);

            setTimeout(() => {
                router.push(`/verify-email/confirm?email=${encodeURIComponent(form.email)}&source=register`);
            }, 1500);
        }

        setIsLoading(false);
    };

    const closeToast = () => {
        setToast(null);
    };

    const handleCaptchaChange = (token: string | null) => {
        setCaptchaToken(token || '');
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="absolute z-20 left-[660px] top-[1px] hidden lg:block">
                <Image src={topGraphics} alt="Decorative graphics" width={570} height={300} priority />
            </div>

            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    subMessage={toast.subMessage}
                    onClose={closeToast}
                />
            )}

            <div className="flex min-h-screen relative z-10 flex-col lg:flex-row">
                <div className="w-full lg:w-[65%] pb-[40px] flex flex-col bg-white">
                    <div className="mt-[30px] sm:mt-[40px] lg:mt-[60px] px-4 sm:px-6 lg:px-0 lg:ml-[102px]">
                        <Image src={farmGoLogo} alt="FarmGo logo" width={90} height={45} className="mx-auto lg:mx-0" />
                    </div>

                    <div className="px-4 sm:px-6 lg:px-0 lg:ml-[204px] mt-[30px] max-w-full">
                        <div className="w-full lg:w-[400px] flex justify-between items-center">
                            <p className="text-[#022B23] text-[12px] sm:text-[14px] font-medium">ACCOUNT SETUP</p>
                            <p className="text-[#022B23] text-[12px] sm:text-[14px] font-medium">1/3</p>
                        </div>

                        <div className="flex gap-[8px] sm:gap-[10px] mt-2">
                            <div className="flex-1 max-w-[80px] h-[6px] bg-[#C6EB5F]"></div>
                            <div className="flex-1 max-w-[80px] h-[6px] bg-[#F0FACD]"></div>
                            <div className="flex-1 max-w-[80px] h-[6px] bg-[#F0FACD]"></div>
                        </div>

                        <h1 className="mt-[30px] sm:mt-[40px] text-[#022B23] text-[18px] sm:text-[20px] font-medium leading-tight">
                            Get started by providing your details below.
                        </h1>

                        <div className="mt-[20px] w-full lg:w-[400px]">
                            {formFields.map((field) => (
                                <div key={field.id} className="relative w-full flex flex-col mb-[12px] sm:mb-[14px]">
                                    <label
                                        htmlFor={field.id}
                                        className={`absolute left-3 sm:left-4 transition-all ${
                                            focusedFields[field.id] || form[field.id]
                                                ? "text-[#6D6D6D] text-[11px] sm:text-[12px] font-medium top-[6px]"
                                                : "hidden"
                                        }`}
                                    >
                                        {field.label}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id={field.id}
                                            type={getInputType(field)}
                                            name={field.id}
                                            value={form[field.id]}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus(field.id)}
                                            onBlur={() => handleBlur(field.id)}
                                            placeholder={!focusedFields[field.id] && !form[field.id] ? field.label : ""}
                                            className={`px-3 sm:px-4 h-[52px] sm:h-[58px] w-full border-[1.5px] border-[#D1D1D1] rounded-[12px] sm:rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] ${
                                                focusedFields[field.id] || form[field.id]
                                                    ? "pt-[14px] pb-[4px] text-[#121212] text-[13px] sm:text-[14px] font-medium"
                                                    : "text-[#BDBDBD] text-[14px] sm:text-[16px] font-medium"
                                            }`}
                                        />

                                        {shouldShowIcon(field) && (
                                            <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                                                <Image src={emailIcon} alt="Email icon" width={18} height={18} className="sm:w-5 sm:h-5" />
                                            </div>
                                        )}

                                        {shouldShowPasswordToggle(field) && (
                                            <div
                                                className="absolute right-3 sm:right-4 px-[4px] sm:px-[6px] py-[3px] sm:py-[4px] flex items-center text-[#DCDCDC] text-[11px] sm:text-[12px] shadow-md gap-[6px] sm:gap-[8px] rounded-[6px] sm:rounded-[8px] border-[1px] border-[#EAEAEA] w-[64px] sm:w-[72px] top-1/2 transform -translate-y-1/2 cursor-pointer bg-white"
                                                onClick={field.id === 'password' ? togglePasswordVisibility : toggleConfirmPasswordVisibility}
                                            >
                                                <Image
                                                    src={(field.id === 'password' ? showPassword : showConfirmPassword) ? eyeOpen : eyeClosed}
                                                    alt={field.id === 'password' ? (showPassword ? "Hide password" : "Show password") : (showConfirmPassword ? "Hide password" : "Show password")}
                                                    width={14}
                                                    height={14}
                                                    className="sm:w-4 sm:h-4"
                                                />
                                                <span>{(field.id === 'password' ? showPassword : showConfirmPassword) ? "Hide" : "Show"}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                                {passwordCriteria.map((criteria) => (
                                    <span
                                        key={criteria.key}
                                        className={`px-2 flex items-center justify-center h-[30px] sm:h-[33px] text-[12px] sm:text-[14px] text-[#022B23] rounded-[8px] sm:rounded-[10px] ${
                                            passwordValid[criteria.key as keyof PasswordValidation] ? 'bg-[#D1FAE7]' : 'bg-gray-300'
                                        }`}
                                    >
                                        {criteria.label}
                                    </span>
                                ))}
                            </div>

                            {/* Add ReCAPTCHA component */}
                            {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
                                <ReCAPTCHA
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                    onChange={handleCaptchaChange}
                                    className="mt-4"
                                />
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className={`w-full cursor-pointer bg-[#022B23] h-[52px] flex justify-center items-center gap-[9px] mt-[40px] text-[#C6EB5F] rounded-[12px] hover:bg-[#011C17] ${isLoading ? 'opacity-70' : ''}`}
                            >
                                <p>{isLoading ? 'Processing...' : 'Continue'}</p>
                                {!isLoading && <Image src={limeArrow} alt="Continue arrow" width={16} height={16} />}
                            </button>

                            <p className="text-[12px] sm:text-[14px] mt-[10px] text-[#7C7C7C] text-center lg:text-left">
                                Already have an account? <span onClick={()=>{router.push("/login")}} className="text-[14px] sm:text-[16px] text-[#001234] cursor-pointer hover:underline">Login</span>
                            </p>

                            <p className="text-[14px] sm:text-[16px] mt-[10px] text-[#7C7C7C] text-center lg:text-left leading-relaxed">
                                By clicking continue you agree with our<br className="hidden sm:block" />
                                <span className="font-medium underline cursor-pointer">Terms of Service</span> and{' '}
                                <span className="font-medium underline cursor-pointer">Privacy Policy</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex bg-[#022B23] w-[35%] flex-col justify-between relative">
                    <div className="pl-[20px] pt-[120px] xl:pt-[171px]">
                        <p className="mb-[15px] text-[#FFEEBE] text-[18px] xl:text-[20px] font-medium">Get started</p>
                        <p className="text-[#C6EB5F] text-[20px] xl:text-[25px] leading-tight">
                            Register on the largest<br />
                            vendor and buyer marketplace<br />
                            to buy and sale products.
                        </p>
                    </div>
                    <div className="w-full mt-auto">
                        <Image
                            src={onboardImage}
                            alt="Onboarding illustration"
                            width={500}
                            height={400}
                            className="w-full object-contain ml-[-10px]"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GetStarted;