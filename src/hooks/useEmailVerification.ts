import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { userService } from '@/services/userService';

export const useEmailVerification = () => {
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

    const verifyEmailToken = async (token: string) => {
        try {
            const result = await userService.verifyEmail(token);
            return result;
        } catch {
            return {
                success: false,
                message: 'Verification failed'
            };
        }
    };

    return {
        verifyEmailToken
    };
};

export default useEmailVerification;