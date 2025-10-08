'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

import axios from 'axios';
import MarketPlaceHeader from "@/components/marketPlaceHeader";
import shadow from '@/../public/assets/images/shadow.png';
import Image from "next/image";
import searchImg from "../../../../../public/assets/images/search-normal.png";
import marketIcon from "../../../../../public/assets/images/market element.png";
import arrowBack from '@/../public/assets/images/arrow-right.svg'
import vendorImg from "../../../../../public/assets/images/vendorImg.svg";
import verify from "../../../../../public/assets/images/verify.svg";
import locationImg from "../../../../../public/assets/images/location.png";
import shopImg from "../../../../../public/assets/images/shop.png";

import { Star } from 'lucide-react';
import { toast } from 'react-toastify';
import WebRTCCallButtons from '@/components/WebRTCCallButtons';
import ChatButton from '@/components/ChatButton';
import { ProductGridSkeleton } from '@/components/LoadingSkeletons';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    mainImageUrl: string;
    sideImage1Url: string;
    sideImage2Url: string;
    sideImage3Url: string;
    sideImage4Url: string;
    shopId: number;
    shopName: string;
    categoryId: number;
    categoryName: string;
    vendorEmail: string;
    vendorName: string;
    city: string;
    market: string;
    marketSection: string;
    shopNumber: string;
    shopAddress: string;
}

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
    vendorEmail?: string;
    businessPhone?: string;
    market?: string;
    marketSection?: string;
}

const SearchBar = () => (
    <div className="flex gap-2 items-center bg-[#F9F9F9] border-[0.5px] border-[#ededed] h-[44px] sm:h-[52px] px-[8px] sm:px-[10px] rounded-[8px] w-full">
        <Image src={searchImg} alt="Search Icon" width={18} height={18} className="h-[18px] w-[18px] sm:h-[20px] sm:w-[20px] flex-shrink-0"/>
        <input placeholder="Search for items here" className="flex-1 text-[#707070] text-[12px] sm:text-[14px] focus:outline-none bg-transparent"/>
    </div>
);

const ProductCard = ({ product }: { product: Product }) => {
    const router = useRouter();
    const handleOpen = () => {
        router.push(`/marketPlace/productDetails/${product.id}`);
    }

    return (
        <div 
            onClick={handleOpen} 
            className="cursor-pointer w-full rounded-[14px] bg-[#FFFFFF] border border-[#ededed] hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
            style={{ height: '280px' }}
        >
            {/* Image Container - Fixed height to match sponsored products */}
            <div className="relative w-full overflow-hidden rounded-t-[14px]" style={{ height: '160px' }}>
                <Image 
                    src={product.mainImageUrl || "/placeholder.svg"} 
                    alt={product.name}
                    width={400}
                    height={160}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
            </div>
            
            {/* Content Container - Fixed height for consistency */}
            <div className="flex-1 p-3 flex flex-col justify-between" style={{ height: '120px' }}>
                <div className="space-y-1">
                    <p className="font-medium text-[#1E1E1E] text-sm line-clamp-2 leading-tight">{product.name}</p>
                    <p className="font-bold text-[#1E1E1E] text-base">₦{product.price.toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}

const ProductGrid = ({ products }: { products: Product[] }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full mt-2 sm:mt-[10px] gap-x-2 sm:gap-x-3 gap-y-2 sm:gap-y-[10px] px-4 sm:px-6 lg:px-25 py-2 sm:py-[10px]">
        {products.map((product) => (
            <ProductCard
                key={product.id}
                product={product}
            />
        ))}
    </div>
);

const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => {
        let fillColor = "none";
        let percentageFill = 0;

        if (i < Math.floor(rating)) {
            fillColor = "#E5A000";
            percentageFill = 100;
        } else if (i < Math.ceil(rating)) {
            percentageFill = Math.round((rating - i) * 100);
            fillColor = `url(#grad${i})`;
        }

        return (
            <svg key={i} width="22" height="22" viewBox="0 0 24 24">
                <defs>
                    <linearGradient id={`grad${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset={`${percentageFill}%`} stopColor="#E5A000" />
                        <stop offset={`${percentageFill}%`} stopColor="white" />
                    </linearGradient>
                </defs>
                <Star fill={fillColor} stroke="#E5A000" className="w-[17px] h-[16px]" />
            </svg>
        );
    });
};

const StorePage = () => {
    const params = useParams();
    const router = useRouter();

    const [selectedMarket, setSelectedMarket] = useState("Wurukum");
    const [products, setProducts] = useState<Product[]>([]);
    const [shopData, setShopData] = useState<ShopData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const shopId = params.id as string;
    const rating = 4.5; // You can make this dynamic later

    const fetchStoreData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Convert shopId to number for backend
            const shopIdNumber = parseInt(shopId);
            
            if (isNaN(shopIdNumber)) {
                throw new Error('Invalid shop ID');
            }

            // Fetch shop details and products using the shop ID
            const [shopResponse, productsResponse] = await Promise.all([
                // Fetch shop details
                axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/${shopIdNumber}`, {
                    headers: { 'Content-Type': 'application/json' }
                }),
                // Fetch products for this shop using your new endpoint
                axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/getByShop`, {
                    params: { shopId: shopIdNumber },
                    headers: { 'Content-Type': 'application/json' }
                })
            ]);

            if (shopResponse.data) {
                setShopData(shopResponse.data);
                console.log("Shop: ", shopResponse.data);
            }

            if (productsResponse.data) {
                setProducts(productsResponse.data);
                console.log("Products: ", productsResponse.data);
            }

        } catch (err) {
            console.error('Error fetching store data:', err);
            setError('Failed to load store data');
            toast.error('Failed to load store data');
        } finally {
            setLoading(false);
        }
    }, [shopId]);

    useEffect(() => {
        if (shopId) {
            fetchStoreData();
        }
    }, [shopId, fetchStoreData]);

    if (loading) {
        return (
            <>
                <MarketPlaceHeader />
                <div className="w-full border-b-[0.5px] border-[#EDEDED]">
                    <div className="h-[56px] sm:h-[66px] bg-cover w-full flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 lg:px-25 bg-no-repeat bg-center relative gap-2 sm:gap-0 py-2 sm:py-0 animate-pulse">
                        <div className="w-full sm:flex-1 h-10 bg-gray-200 rounded"></div>
                        <div className="w-full sm:w-auto h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>
                
                {/* Store info skeleton */}
                <div className="px-4 sm:px-6 lg:px-25 py-6">
                    <div className="flex items-center gap-4 mb-6 animate-pulse">
                        <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded w-48"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded w-40"></div>
                        </div>
                    </div>
                    
                    {/* Products grid skeleton */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                                <div className="w-full h-32 bg-gray-200"></div>
                                <div className="p-3 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    }

    if (error || !shopData) {
        return (
            <>
                <MarketPlaceHeader />
                <div className="flex flex-col items-center justify-center h-screen">
                    <div className="text-lg text-red-600 mb-4">{error || 'Store not found'}</div>
                    <button 
                        onClick={() => router.back()}
                        className="bg-[#022B23] text-white px-4 py-2 rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <MarketPlaceHeader />
            <div className="w-full border-b-[0.5px] border-[#EDEDED]">
                <div
                    className="h-[56px] sm:h-[66px] bg-cover w-full flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 lg:px-25 bg-no-repeat bg-center relative gap-2 sm:gap-0 py-2 sm:py-0"
                    style={{ backgroundImage: `url(${shadow.src})` }}
                >
                    <div className="w-full sm:flex-1">
                        <SearchBar/>
                    </div>
                    <div className="flex ml-0 sm:ml-[10px] gap-[2px] p-[2px] h-[44px] sm:h-[52px] items-center justify-between border border-[#ededed] rounded-[4px] w-full sm:w-auto">
                        <div className="bg-[#F9F9F9] text-black px-[6px] sm:px-[8px] rounded-[4px] flex items-center justify-center h-[40px] sm:h-[48px] flex-1 sm:flex-none">
                            <select className="bg-[#F9F9F9] text-[#1E1E1E] text-[12px] sm:text-[14px] rounded-sm text-center w-full focus:outline-none">
                                <option>Benue State</option>
                                <option>Enugu State</option>
                                <option>Lagos State</option>
                            </select>
                        </div>

                        <div className="relative flex-1 sm:flex-none">
                            <div className="flex items-center bg-[#F9F9F9] px-[6px] sm:px-[8px] h-[40px] sm:h-[48px] rounded-[4px]">
                                <Image src={marketIcon} alt="Market Icon" width={18} height={18} className="sm:w-5 sm:h-5" />
                                <select
                                    className="bg-[#F9F9F9] text-[#1E1E1E] text-[12px] sm:text-[14px] items-center pr-1 focus:outline-none w-full"
                                    onChange={(e) => setSelectedMarket(e.target.value)}
                                    value={selectedMarket}
                                >
                                    <option>Wurukum market</option>
                                    <option>Gboko Market</option>
                                    <option>Otukpo Market</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-[48px] px-4 sm:px-6 lg:px-25 gap-[8px] items-center flex">
                    <button onClick={() => router.back()}>
                        <Image src={arrowBack} alt={'back'} className="cursor-pointer w-4 h-4 sm:w-5 sm:h-5"/>
                    </button>
                    <p className="text-[12px] sm:text-[14px] text-[#3F3E3E] truncate">
                        Go back // stores // <span className="font-medium text-[#022B23]">{shopData.name}</span>
                    </p>
                </div>
            </div>
            
            <div className="py-4 sm:py-[20px] gap-y-4 sm:gap-y-[20px]">
                <div className="pb-4 sm:pb-[20px] border-b border-[#ededed]">
                    <div className="flex mx-4 sm:mx-6 lg:mx-25 justify-between flex-col lg:flex-row gap-4 sm:gap-6">
                        {/* Left side */}
                        <div className="flex flex-col gap-4 sm:gap-[20px]">
                            <div className="border border-[#ededed] rounded-2xl sm:rounded-3xl h-auto lg:h-[157px] p-3 sm:p-4 lg:p-0">
                                <div className="flex items-center border-b border-[#ededed] px-0 lg:px-[20px] pt-0 lg:pt-[10px] justify-between pb-3 sm:pb-4 lg:pb-[8px]">
                                    <div className="flex gap-[6px] sm:gap-[8px] items-center">
                                        <Image src={vendorImg} alt={'vendor'} width={32} height={32} className="sm:w-10 sm:h-10"/>
                                        <div className="flex-col">
                                            <p className="text-[10px] sm:text-[12px] text-[#707070]">Shop</p>
                                            <p className="text-[14px] sm:text-[16px] font-normal mt-[-2px] sm:mt-[-4px] truncate max-w-[150px] sm:max-w-none">{shopData.name}</p>
                                        </div>
                                    </div>
                                    {shopData.status === 'ACTIVE' && (
                                        <div className="w-[64px] sm:w-[74px] p-[4px] sm:p-[6px] gap-[3px] sm:gap-[4px] h-[26px] sm:h-[30px] bg-[#C6EB5F] rounded-[6px] sm:rounded-[8px] flex items-center">
                                            <Image src={verify} alt={'verified'} width={12} height={12} className="sm:w-4 sm:h-4"/>
                                            <p className="text-[10px] sm:text-[12px]">verified</p>
                                        </div>
                                    )}
                                </div>
                                <div className="px-0 lg:px-[20px] flex items-center gap-[3px] sm:gap-[4px] mt-3 sm:mt-4 lg:mt-[20px]">
                                    <Image src={locationImg} alt={'location'} width={16} height={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0"/>
                                    <p className="text-[12px] sm:text-[14px] font-light truncate">{shopData.market || 'Market'}, {shopData.address}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row px-0 lg:px-[20px] mt-2 sm:mt-3 lg:mt-[15px] gap-1 sm:gap-2 lg:gap-[18px]">
                                    <div className="flex items-center gap-[3px] sm:gap-[4px]">
                                        <Image src={shopImg} alt={'shop'} width={16} height={16} className="sm:w-[18px] sm:h-[18px]"/>
                                        <p className="text-[12px] sm:text-[14px] font-light truncate">{shopData.name} Shop {shopData.shopNumber}</p>
                                    </div>
                                    <div className="flex items-center gap-[3px] sm:gap-[4px]">
                                        <Image src={shopImg} alt={'section'} width={16} height={16} className="sm:w-[18px] sm:h-[18px]"/>
                                        <p className="text-[12px] sm:text-[14px] font-light truncate">{shopData.marketSection || 'Section'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-full lg:w-full gap-[10px] sm:gap-[14px] flex flex-col sm:flex-row items-center">
                                <ChatButton
                                    vendorEmail={shopData.vendorEmail || (products.length > 0 ? products[0].vendorEmail : 'vendor@example.com')}
                                    vendorName={shopData.vendorName || shopData.name}
                                    shopId={shopData.id}
                                    shopName={shopData.name}
                                    className="bg-[#ffeebe] text-[#461602] hover:bg-[#ffd700] w-full sm:w-[165px] h-[44px] sm:h-[48px] rounded-[12px] sm:rounded-[14px] text-[14px]"
                                />
                                <WebRTCCallButtons
                                    vendorEmail={shopData.vendorEmail || (products.length > 0 ? products[0].vendorEmail : 'vendor@example.com')}
                                    vendorName={shopData.vendorName || shopData.name}
                                    shopName={shopData.name}
                                    shopId={shopData.id}
                                    className="w-full sm:w-auto"
                                />
                            </div>
                        </div>
                        
                        {/* Right side */}
                        <div className="w-full lg:w-[442px] flex flex-col gap-4 sm:gap-[24px]">
                            {/* Rating Box */}
                            <div className="flex justify-start lg:justify-end">
                                <div className="bg-[#f9f9f9] border border-[#ededed] rounded-[12px] sm:rounded-[14px] p-[16px] sm:p-[20px] w-[180px] sm:w-[215px] h-[70px] sm:h-[83px]">
                                    <p className="text-[12px] sm:text-[14px] text-[#0D0C22] font-medium">Shop rating</p>
                                    <div className="flex items-center gap-[12px] sm:gap-[16px] mt-1">
                                        <span className="text-lg sm:text-xl font-bold text-gray-800">{rating}</span>
                                        <div className="flex gap-[2px] sm:gap-[4px]">{renderStars(rating)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Categories - You might want to make this dynamic based on store products */}
                            <div className="flex h-[48px] sm:h-[56px] items-center p-[3px] sm:p-[4px] gap-[3px] sm:gap-[4px] w-full rounded-[100px] border border-[#ededed] overflow-x-auto">
                                <span className="w-[48px] sm:w-[57px] h-[40px] sm:h-[48px] rounded-[100px] text-[12px] sm:text-[14px] font-medium text-[#022B23] flex items-center justify-center border border-[#ededed] flex-shrink-0">All</span>
                                <span className="px-3 sm:px-4 h-[40px] sm:h-[48px] rounded-[100px] text-[12px] sm:text-[14px] font-semibold text-[#022B23] bg-[#ECFDF6] flex items-center justify-center whitespace-nowrap flex-shrink-0">
                                    Products ({products.length})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="p-6">
                        <ProductGridSkeleton itemCount={8} />
                    </div>
                ) : products.length > 0 ? (
                    <ProductGrid products={products}/>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No products available in this store</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default StorePage;