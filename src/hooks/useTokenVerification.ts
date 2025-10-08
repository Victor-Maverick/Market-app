'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { userService } from '@/services/userService';

export const useTokenVerification = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const verifyToken = useCallback(async (token: string) => {
        setVerificationStatus('verifying');
        try {
            const result = await userService.verifyEmail(token);

            if (result.success) {
                setVerificationStatus('success');
                setMessage('Email verified successfully');

                // Clean up localStorage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('unverifiedEmail');
                }

                // Redirect to login after a short delay
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setVerificationStatus('error');
                setMessage(result.message || 'Verification failed');
            }
        } catch {
            setVerificationStatus('error');
            setMessage('Verification failed. Please try again.');
        }
    }, [router]);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token && verificationStatus === 'idle') {
            verifyToken(token);
        }
    }, [searchParams, verificationStatus, verifyToken]);

    return {
        verificationStatus,
        message,
        isVerifying: verificationStatus === 'verifying'
    };
};