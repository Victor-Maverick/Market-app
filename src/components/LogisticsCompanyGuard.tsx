'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShopDataSkeleton } from './LoadingSkeletons';
import { useEffect, useState, useCallback, Suspense } from "react";
import { logisticsService } from "@/services/logisticsService";
import DashboardHeader from "@/components/dashboardHeader";
import LogisticsDashboardOptions from "@/components/logisticsDashboardOptions";

interface LogisticsCompanyGuardProps {
    children: React.ReactNode;
    showHeader?: boolean;
    showDashboardOptions?: boolean;
}

const LogisticsCompanyGuardContent: React.FC<LogisticsCompanyGuardProps> = ({
    children,
    showHeader = false,
    showDashboardOptions = false
}) => {
    const [companyExists, setCompanyExists] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { data: session } = useSession();

    const checkCompanyExists = useCallback(async () => {
        if (session?.user?.email) {
            try {
                const exists = await logisticsService.existsByOwnerEmail(session.user.email);
                setCompanyExists(exists);
            } catch (error) {
                console.error('Error checking company existence:', error);
                setCompanyExists(false);
            } finally {
                setLoading(false);
            }
        }
    }, [session]);

    useEffect(() => {
        checkCompanyExists();
    }, [checkCompanyExists]);

    if (loading) {
        return (
            <>
                {showHeader && <DashboardHeader />}
                <div className="p-6">
                    <ShopDataSkeleton />
                </div>
            </>
        );
    }

    // Company not set up yet
    if (!companyExists) {
        return (
            <>
                {showHeader && <DashboardHeader />}
                {showDashboardOptions && <LogisticsDashboardOptions />}
                <div className="flex flex-col items-center justify-center h-screen">
                    <p className="mb-4 text-[#022B23] text-[18px] font-medium">You need to set up your logistics company first</p>
                    <button
                        onClick={() => router.push('/logistics/onboarding')}
                        className="h-[48px] w-[200px] flex items-center justify-center cursor-pointer bg-[#022B23] text-white rounded-[10px] hover:bg-[#033228] transition-colors"
                    >
                        Setup Company
                    </button>
                </div>
            </>
        );
    }

    // Company is set up - render children with default headers
    return (
        <>
            {showHeader && <DashboardHeader />}
            {showDashboardOptions && <LogisticsDashboardOptions />}
            {children}
        </>
    );
};

const LogisticsCompanyGuard: React.FC<LogisticsCompanyGuardProps> = (props) => {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        }>
            <LogisticsCompanyGuardContent {...props} />
        </Suspense>
    );
};

export default LogisticsCompanyGuard;