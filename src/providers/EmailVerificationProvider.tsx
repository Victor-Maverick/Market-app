'use client';

import { createContext, useContext, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface EmailVerificationContextType {
    // Add any methods you might need
    initialized?: boolean;
}

const EmailVerificationContext = createContext<EmailVerificationContextType>({});

export const useEmailVerificationContext = () => {
    return useContext(EmailVerificationContext);
};

function EmailVerificationContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const verifyParam = searchParams.get('verify');
        
        // If there's a token parameter and verify=email, redirect to verification page
        if (token && verifyParam === 'email') {
            router.push(`/register/emailVerification/verify-email?token=${token}`);
        }
    }, [searchParams, router]);

    const contextValue: EmailVerificationContextType = {
        // Add any methods you might need
        initialized: true
    };

    return (
        <EmailVerificationContext.Provider value={contextValue}>
            {children}
        </EmailVerificationContext.Provider>
    );
}

export function EmailVerificationProvider({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div>{children}</div>}>
            <EmailVerificationContent>
                {children}
            </EmailVerificationContent>
        </Suspense>
    );
}

export default EmailVerificationProvider;