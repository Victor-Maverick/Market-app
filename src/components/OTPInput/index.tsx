'use client'
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    onOtpChange?: (otp: string) => void;
    disabled?: boolean;
    error?: boolean;
    autoFocus?: boolean;
}

export interface OTPInputRef {
    clear: () => void;
}

const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(({
    length = 4,
    onComplete,
    onOtpChange,
    disabled = false,
    error = false,
    autoFocus = true
}, ref) => {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
        clear: () => {
            const newOtp = new Array(length).fill('');
            setOtp(newOtp);
            onOtpChange?.('');
            if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
            }
        }
    }));

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [autoFocus]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (disabled) return;

        const value = element.value;
        
        // Only allow digits
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        const otpString = newOtp.join('');
        onOtpChange?.(otpString);

        // Auto focus next input
        if (value && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }

        // Call onComplete when all fields are filled
        if (otpString.length === length) {
            onComplete(otpString);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (disabled) return;

        // Handle backspace
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newOtp = [...otp];
            
            if (otp[index]) {
                // Clear current field
                newOtp[index] = '';
                setOtp(newOtp);
                onOtpChange?.(newOtp.join(''));
            } else if (index > 0) {
                // Move to previous field and clear it
                newOtp[index - 1] = '';
                setOtp(newOtp);
                onOtpChange?.(newOtp.join(''));
                inputRefs.current[index - 1]?.focus();
            }
        }
        
        // Handle arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (disabled) return;

        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        
        // Only process if it's all digits and matches our length
        if (!/^\d+$/.test(pasteData) || pasteData.length !== length) return;

        const newOtp = pasteData.split('');
        setOtp(newOtp);
        onOtpChange?.(pasteData);
        onComplete(pasteData);

        // Focus the last input
        inputRefs.current[length - 1]?.focus();
    };

    const handleFocus = (index: number) => {
        // Select all text when focusing
        inputRefs.current[index]?.select();
    };

    return (
        <div className="flex gap-3 justify-center">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(ref) => {
                        inputRefs.current[index] = ref;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    onFocus={() => handleFocus(index)}
                    disabled={disabled}
                    className={`
                        w-14 h-14 text-center text-2xl font-bold border-2 rounded-lg
                        transition-all duration-200 outline-none
                        ${error 
                            ? 'border-red-500 bg-red-50 text-red-600' 
                            : digit 
                                ? 'border-[#022B23] bg-[#F0FACD] text-[#022B23]' 
                                : 'border-[#D1D1D1] bg-white text-[#121212]'
                        }
                        ${disabled 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:border-[#022B23] focus:border-[#022B23] focus:ring-2 focus:ring-[#022B23]/20'
                        }
                    `}
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    );
});

OTPInput.displayName = 'OTPInput';

export default OTPInput;