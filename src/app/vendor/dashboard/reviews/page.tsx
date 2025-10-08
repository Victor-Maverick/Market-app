'use client'
import {Suspense, useCallback, useEffect, useState} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import DashboardHeader from "@/components/dashboardHeader";
import DashboardOptions from "@/components/dashboardOptions";
import arrowDown from "../../../../../public/assets/images/arrow-down.svg";
import arrowBack from "../../../../../public/assets/images/arrowBack.svg";
import arrowFoward from "../../../../../public/assets/images/arrowFoward.svg";
import promoteIcon from '@/../public/assets/images/promoteIcon.svg'
import iPhone from "../../../../../public/assets/images/blue14.png";
import flag from '@/../public/assets/images/flag-2.svg'
import {useSession} from "next-auth/react";
import axios from "axios";
import Toast from "@/components/Toast";
import { SkeletonLoader } from "@/components/LoadingSkeletons";

interface Product {
    id: number;
    name: string;
    price: string;
    mainImageUrl: string;
    status?: string;
    rating?: number;
    comment?: string;
    quantity: number;
    quantitySold: number;
}

interface ShopData {
    id: number;
    promotedStatus: string;
    promotedTierId?: number;
    featuredNumber: number;
    promotedNumber: number;
    floatedNumber: number;
}

interface TierResponse {
    id: number;
    tier: string;
    price: number;
    shopsPromoted: number;
    featuredNumber: number;
    promotedNumber: number;
    floatedNumber: number;
}

const ProductTableRow = ({
                             product,
                             isLast,
                             shopData,
                             tierData,
                             onPromoteAction
                         }: {
    product: Product;
    isLast: boolean;
    shopData: ShopData | null;
    tierData: TierResponse | null;
    onPromoteAction: (action: string, productId: number) => void;
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleAction = (action: string) => {
        onPromoteAction(action, product.id);
        setShowDropdown(false);
    };

    // Calculate remaining promotions available
    const canFeature = tierData && shopData && (tierData.featuredNumber - shopData.featuredNumber) > 0;
    const canPromote = tierData && shopData && (tierData.promotedNumber - shopData.promotedNumber) > 0;
    const canFloat = tierData && shopData && (tierData.floatedNumber - shopData.floatedNumber) > 0;

    return (
        <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}>
            <div className="flex items-center w-[35%] pr-[24px] gap-3">
                <div className="bg-[#f9f9f9] h-full w-[70px] overflow-hidden mt-[2px]">
                    <Image
                        src={product.mainImageUrl || iPhone}
                        alt={product.name}
                        width={70}
                        height={70}
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-[14px] font-medium text-[#101828]">{product.name}</p>
                    <p className="text-[12px] text-[#667085]">Price: {product.price}</p>
                </div>
            </div>

            <div className="flex items-center w-[15%] px-[20px]">
                <p className="text-[12px] font-medium">{product.quantity}</p>
            </div>

            <div className="flex items-center w-[30%] px-[10px]">
                <p className="text-[12px] text-[#667085]">{product.quantitySold}</p>
            </div>

            <div className="flex items-center w-[15%] px-[14px]">
                <p className="text-[12px] text-[#667085]">{product.rating || 'No rating'}</p>
            </div>

            <div className="flex items-center w-[5%] relative">
                {shopData?.promotedStatus === 'PROMOTED' && (
                    <>
                        <div onClick={toggleDropdown} className="flex cursor-pointer flex-col gap-[2px]">
                            <span className={`rounded-full w-[3px] h-[3px] bg-black`}></span>
                            <span className={`rounded-full w-[3px] h-[3px] bg-black`}></span>
                            <span className={`rounded-full w-[3px] h-[3px] bg-black`}></span>
                        </div>
                        {showDropdown && (
                            <div className="absolute right-0 top-6 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                {canFeature && (
                                    <button
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        onClick={() => handleAction('feature')}
                                    >
                                        Feature Product
                                    </button>
                                )}
                                {canPromote && (
                                    <button
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        onClick={() => handleAction('sponsor')}
                                    >
                                        Sponsor Product
                                    </button>
                                )}
                                {canFloat && (
                                    <button
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                        onClick={() => handleAction('float')}
                                    >
                                        Float Product
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

const ReviewTab = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const router = useRouter();
    const { data: session } = useSession();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shopData, setShopData] = useState<ShopData | null>(null);
    const [tierData, setTierData] = useState<TierResponse | null>(null);
    const [toast, setToast] = useState<{
        show: boolean;
        type: "success" | "error";
        message: string;
        subMessage: string;
    } | null>(null);

    const fetchShopData = useCallback(async () => {
        if (session?.user?.email) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/getbyEmail?email=${session.user.email}`);
                const data = await response.json();
                setShopData(data);
                console.log("Shop status: ",data);

                if (data.promotedStatus === 'PROMOTED') {
                    const tierResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/tier/id?tierId=${data.promotedTierId}`);
                    const tier = await tierResponse.json();
                    setTierData(tier);
                }
            } catch (error) {
                console.error('Error fetching shop data:', error);
            }
        }
    }, [session]);

    const fetchProducts = useCallback(async () => {
        if (session?.user?.email) {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/getByUser?email=${session.user.email}`
                );
                setProducts(response.data);
                console.log("Products fetch", response.data);
            } catch (err) {
                setError("Failed to fetch products");
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        }
    }, [session]);

    useEffect(() => {
        fetchShopData();
        fetchProducts();
    }, [fetchShopData, fetchProducts]);

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    const handlePromoteShop = () => {
        router.push("/vendor/dashboard/reviews/promote-shop");
    };

    const handlePromoteAction = async (action: string, productId: number) => {
        try {
            let endpoint = '';
            let actionName = '';

            switch (action) {
                case 'feature':
                    endpoint = 'feature';
                    actionName = 'Featured';
                    break;
                case 'sponsor':
                    endpoint = 'promote';
                    actionName = 'Promoted';
                    break;
                case 'float':
                    endpoint = 'float';
                    actionName = 'Floated';
                    break;
                default:
                    return;
            }

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${endpoint}?productId=${productId}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            // Use actual backend response for success message
            setToast({
                show: true,
                type: "success",
                message: response.data.message || `${actionName} successfully`,
                subMessage: response.data.subMessage || response.data || `Product has been ${actionName.toLowerCase()}`
            });

            await fetchShopData();
            await fetchProducts();
        } catch (err) {
            // Use actual backend error response
            const errorMessage = "Action failed";
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const errorSubMessage = err.response?.data;

            setToast({
                show: true,
                type: "error",
                message: errorMessage,
                subMessage: errorSubMessage
            });
            console.error(`Error ${action} product:`, err);
        }
    };

    const closeToast = () => {
        setToast(null);
    };


    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = products.slice(startIndex, startIndex + itemsPerPage);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(price);
    };

    if (loading) {
        return (
            <>
                <DashboardHeader />
                <DashboardOptions />
                <div className="p-3 sm:p-6">
                    <SkeletonLoader type="product" count={6} />
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <DashboardHeader />
                <DashboardOptions />
                <div className="flex justify-center items-center h-[200px] text-red-500">
                    <p>{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex w-full h-[131px] mb-[30px] justify-between items-center">
                <div className="h-full gap-[12px] w-full flex flex-col">
                    <p className="text-[#022B23] text-[16px] font-medium">Campaign performance</p>
                    <div className="gap-[15px] w-[85%] flex">
                        {shopData?.promotedStatus === 'PROMOTED' && tierData ? (
                            <div className="flex items-center gap-[15px] w-full">
                                <div className="flex flex-col pt-[18px] px-[10px] pb-[10px] gap-[14px] w-[25%] h-[100px] rounded-[14px] border-[0.5px] border-[#E4E4E7]">
                                    <div className="flex items-center gap-[8px]">
                                        <Image src={flag} alt={'image'}/>
                                        <p className="text-[12px] text-[#71717A] font-medium">Campaign tier</p>
                                    </div>
                                    <div className="flex justify-between items-center ">
                <span className="rounded-[100px] cursor-pointer text-[#022B23] text-[14px] font-medium flex items-center justify-center bg-[#C6EB5F] w-[68px] h-[32px]">
                    {tierData.tier}
                </span>
                                        <p className="text-[12px] text-[#022B23] font-medium">
                                            {formatPrice(tierData.price)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col pt-[18px] px-[10px] pb-[10px] gap-[14px] w-[25%] h-[100px] rounded-[14px] border-[0.5px] border-[#E4E4E7]">
                                    <div className="flex justify-between mt-[20px] text-[10px] text-[#71717A]">
                                        <p>Featured: {shopData.featuredNumber}/{tierData.featuredNumber}</p>
                                        <p>Promoted: {shopData.promotedNumber}/{tierData.promotedNumber}</p>
                                        <p>Floated: {shopData.floatedNumber}/{tierData.floatedNumber}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full h-[100px]">
                                <p className="text-[#667085]">No active promotion</p>
                            </div>
                        )}
                    </div>
                </div>
                {shopData?.promotedStatus !== 'PROMOTED' && (
                    <div
                        onClick={handlePromoteShop}
                        className="w-[15%] cursor-pointer flex items-center gap-[9px] text-[14px] text-[#C6EB5F] font-medium justify-center rounded-[12px] h-[52px] border bg-[#033228]"
                    >
                        <p>Promote shop</p>
                        <Image src={promoteIcon} alt={'image'}/>
                    </div>
                )}
            </div>

            <div className="flex flex-col w-full mt-[10px] rounded-[24px] border-[1px] border-[#EAECF0]">
                <div className="flex flex-col py-[20px] px-[24px]">
                    <p className="text-[#101828] text-[18px] font-medium">Products ({products.length})</p>
                    <p className="text-[#667085] text-[14px]">Manage your products and promotions</p>
                </div>
                <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                    <div className="flex items-center px-[12px] w-[35%] py-[12px] gap-[4px]">
                        <p className="text-[#667085] font-medium text-[12px]">Products</p>
                        <Image src={arrowDown} alt="Sort" width={12} height={12} />
                    </div>
                    <div className="flex items-center px-[12px] w-[15%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Quantity</p>
                    </div>
                    <div className="flex items-center px-[12px] w-[30%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Quantity Sold</p>
                    </div>
                    <div className="flex items-center px-[12px] w-[15%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Rating</p>
                    </div>
                    <div className="flex items-center pr-[12px] w-[5%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Actions</p>
                    </div>
                </div>
                <div className="flex flex-col">
                    {currentItems.map((product, index) => (
                        <ProductTableRow
                            key={product.id}
                            product={product}
                            isLast={index === currentItems.length - 1}
                            shopData={shopData}
                            tierData={tierData}
                            onPromoteAction={handlePromoteAction}
                        />
                    ))}
                </div>
                <div className="h-[68px] border-t-[1px] justify-between flex items-center border-[#EAECF0] px-[24px] py-[12px]">
                    <div
                        onClick={handlePrevious}
                        className={`flex text-[#344054] text-[14px] font-medium gap-[8px] justify-center items-center border-[#D0D5DD] border-[1px] cursor-pointer hover:shadow-md shadow-sm w-[114px] rounded-[8px] px-[14px] py-[8px] h-[36px] ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Image src={arrowBack} alt={'image'} />
                        <p>Previous</p>
                    </div>
                    <div className="flex gap-[2px]">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <div
                                key={index + 1}
                                onClick={() => handlePageClick(index + 1)}
                                className={`flex justify-center items-center w-[36px] h-[36px] rounded-[8px] text-[14px] font-medium cursor-pointer ${
                                    currentPage === index + 1
                                        ? 'bg-[#ecfdf6] text-[#022B23]'
                                        : 'bg-white text-[#022B23] hover:shadow-md'
                                }`}
                            >
                                {index + 1}
                            </div>
                        ))}
                    </div>
                    <div
                        onClick={handleNext}
                        className={`flex text-[#344054] text-[14px] gap-[8px] font-medium justify-center items-center border-[#D0D5DD] border-[1px] cursor-pointer hover:shadow-md shadow-sm w-[88px] rounded-[8px] px-[14px] py-[8px] h-[36px] ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <p>Next</p>
                        <Image src={arrowFoward} alt={'image'} />
                    </div>
                </div>
            </div>
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    subMessage={toast.subMessage}
                    onClose={closeToast}
                />
            )}
        </>
    );
}


const Coupons = () => {
    return <></>;
}

const ReviewsContent = () => {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') as 'reviews' | 'coupons' || 'reviews';
    const [activeTab, setActiveTab] = useState<'reviews' | 'coupons'>(initialTab);
    const router = useRouter();

    const handleTabChange = (tab: 'reviews' | 'coupons') => {
        setActiveTab(tab);
        router.replace(`/vendor/dashboard/reviews?tab=${tab}`, { scroll: false });
    };

    return (
        <>
            <DashboardHeader />
            <DashboardOptions />
            <div className="flex flex-col py-[30px] px-25">
                <div className="w-[359px] h-[52px] gap-[24px] flex items-end">
                    <button
                        onClick={() => handleTabChange('reviews')}
                        className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${
                            activeTab === 'reviews'
                                ? 'font-medium border-b-2 border-[#C6EB5F]'
                                : 'text-gray-500'
                        }`}
                    >
                        Reviews & campaigns
                    </button>
                    <button
                        onClick={() => handleTabChange('coupons')}
                        className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${
                            activeTab === 'coupons'
                                ? 'font-medium border-b-2 border-[#C6EB5F]'
                                : 'text-gray-500'
                        }`}
                    >
                        Coupons
                    </button>
                </div>
                <div className="bg-white rounded-lg mt-[20px] mb-8">
                    {activeTab === 'reviews' && <ReviewTab />}
                    {activeTab === 'coupons' && <Coupons />}
                </div>
            </div>
        </>
    );
}

const Reviews = () => {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6EB5F]"></div>
            </div>
        }>
            <ReviewsContent />
        </Suspense>
    );
}

export default Reviews;