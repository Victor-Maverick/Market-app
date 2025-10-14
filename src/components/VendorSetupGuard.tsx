'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from './LoadingSpinner';

interface VendorSetupGuardProps {
    children: React.ReactNode;
}

const VendorSetupGuard: React.FC<VendorSetupGuardProps> = ({ children }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let intervalId: NodeJS.Timeout;

        if (status === 'loading') {
            // Still loading session, wait
            return;
        }

        if (status === 'authenticated' && session?.user?.email) {
            // User is authenticated, allow access
            setIsChecking(false);
            return;
        }

        // User is not authenticated, start 10-second countdown
        if (status === 'unauthenticated') {
            intervalId = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        // Countdown finished, redirect to login
                        router.push('/login');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            timeoutId = setTimeout(() => {
                router.push('/login');
            }, 10000);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (intervalId) clearInterval(intervalId);
        };
    }, [status, session, router]);

    // Show loading while checking session
    if (status === 'loading' || isChecking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Checking your session...</p>
            </div>
        );
    }

    // Show countdown if not authenticated
    if (status === 'unauthenticated') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-4">Session Expired</h2>
                    <p className="text-gray-600 mb-4">
                        Your session has expired. You will be redirected to login in:
                    </p>
                    <div className="text-3xl font-bold text-[#022B23] mb-4">
                        {countdown}
                    </div>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-[#022B23] text-white px-6 py-2 rounded-lg hover:bg-[#033a30] transition-colors"
                    >
                        Login Now
                    </button>
                </div>
            </div>
        );
    }

    // User is authenticated, render children
    return <>{children}</>;
};

export default VendorSetupGuard;