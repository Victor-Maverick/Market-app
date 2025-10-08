'use client'
import { useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";

const EmailVerification = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Redirect to new verification flow
        const email = localStorage.getItem('userEmail') || localStorage.getItem('verifyEmail') || searchParams.get('email') || '';
        const from = searchParams.get('from') || 'register';
        
        if (email) {
            localStorage.setItem('verifyEmail', email);
            router.push(`/verify-email/confirm?email=${encodeURIComponent(email)}&from=${from}`);
        } else {
            router.push('/verify-email');
        }
    }, [router, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022B23]"></div>
                <p className="text-[#7C7C7C] text-sm">Redirecting to verification...</p>
            </div>
        </div>
    );
};

export default EmailVerification;