'use client'
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardHeader from "@/components/dashboardHeader";
import DashboardOptions from "@/components/dashboardOptions";
import ShopInformation from '@/components/productsView';
import NewProductView from '@/components/newProductView';
import ReviewsView from '@/components/reviewsView';
import Toast from "@/components/Toast";
import { ShopDataSkeleton } from '../LoadingSkeletons';

interface ShopData {
    id: number;
    name: string;
    address: string;
    logoUrl: string;
    phone: string;
    shopNumber: string;
    homeAddress: string;
    streetName: string;
    cacNumber: string;
    taxIdNumber: string;
    nin: number;
    bankName: string;
    accountNumber: string;
    marketId: number;
    marketSectionId: number;
    firstName: string;
    status: string;
    vendorName?: string;
    businessPhone?: string;
    market?: string;
    marketSection?: string;
}

const ShopClient = () => {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') as 'shop-information' | 'products' | 'reviews' || 'shop-information';
    const [activeTab, setActiveTab] = useState<'shop-information' | 'products' | 'reviews'>(initialTab);
    const [shopData, setShopData] = useState<ShopData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { data: session } = useSession();

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [toastSubMessage, setToastSubMessage] = useState("");

    const showErrorToast = (message: string, subMessage: string) => {
        setToastType("error");
        setToastMessage(message);
        setToastSubMessage(subMessage);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const handleCloseToast = () => setShowToast(false);

    const fetchShopData = useCallback(async () => {
        if (session?.user?.email) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/getbyEmail?email=${session.user.email}`);
                const data = await response.json();
                setShopData(data);
                console.log("SHOP:: ",data);
            } catch (error) {
                console.error('Error fetching shop data:', error);
                showErrorToast('Error', 'Failed to fetch shop data');
            } finally {
                setLoading(false);
            }
        }
    }, [session]);

    useEffect(() => {
        fetchShopData();
    }, [fetchShopData]);

    const handleTabChange = (tab: 'shop-information' | 'products' | 'reviews') => {
        setActiveTab(tab);
        router.replace(`/vendor/dashboard/shop?tab=${tab}`, { scroll: false });
    };

    if (loading) {
        return (
            <>
                <DashboardHeader />
                <div className="p-6">
                    <ShopDataSkeleton />
                </div>
            </>
        );
    }

    if (!shopData) {
        return (
            <>
                <DashboardHeader />
                <DashboardOptions />
                <div className="flex flex-col items-center justify-center h-screen">
                    <p className="mb-4">You need to set up your shop first</p>
                    <button
                        onClick={() => router.push('/vendor/setup-shop/shop-info')}
                        className="h-[48px] w-[200px] flex items-center justify-center cursor-pointer bg-[#022B23] text-white rounded-[10px]"
                    >
                        Setup Shop
                    </button>
                </div>
            </>
        );
    }

    if (shopData.status === 'NOT_VERIFIED') {
        return (
            <>
                <DashboardHeader />
                <DashboardOptions />
                <div className="flex flex-col items-center justify-center h-screen">
                    <p className="mb-4">Your shop needs to be verified before you can access this page</p>
                    <button
                        onClick={() => router.push('/vendor/dashboard')}
                        className="h-[48px] w-[200px] flex items-center justify-center cursor-pointer bg-[#022B23] text-white rounded-[10px]"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </>
        );
    }
    return (
        <>
            <DashboardHeader />
            <DashboardOptions />

            <div className="flex flex-col">
                <div className="flex border-b border-[#ededed] mb-6 px-[100px]">
                    <div className="w-[273px] h-[52px] gap-[24px] flex items-end">
                        <p
                            className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${activeTab === 'shop-information' ? 'font-medium  border-b-2 border-[#C6EB5F]' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('shop-information')}
                        >
                            Shop information
                        </p>
                        <p
                            className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${activeTab === 'products' ? 'font-medium  border-b-2 border-[#C6EB5F]' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('products')}
                        >
                            Products
                        </p>
                        <p
                            className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${activeTab === 'reviews' ? 'font-medium border-b-2 border-[#C6EB5F]' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('reviews')}
                        >
                            Reviews
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg mx-[100px] mb-8">
                    {activeTab === 'shop-information' && <ShopInformation shopData={shopData} />}
                    {activeTab === 'products' && <NewProductView shopId={shopData.id}/>}
                    {activeTab === 'reviews' && <ReviewsView shopId={shopData.id}/>}
                </div>
            </div>

            {showToast && (
                <Toast
                    type={toastType}
                    message={toastMessage}
                    subMessage={toastSubMessage}
                    onClose={handleCloseToast}
                />
            )}
        </>
    );
};

export default ShopClient;