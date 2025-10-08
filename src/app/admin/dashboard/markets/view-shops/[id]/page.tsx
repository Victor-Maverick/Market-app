'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";
import searchImg from "../../../../../../../public/assets/images/search-normal.png";
import arrowDown from "../../../../../../../public/assets/images/arrow-down.svg";
import { use, useCallback, useEffect,  useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import BackButton from "@/components/BackButton";

interface ShopResponse {
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
    nin: string;
    bankName: string;
    accountNumber: string;
    market: string;
    marketSection: string;
    firstName: string;
    lastName: string;
    status: string;
    totalPayoutAmount: number;
    promotedStatus: string;
}

interface PageParams {
    id: string;
}

const ShopTableRow = ({ shop, isLast }: { shop: ShopResponse; isLast: boolean }) => {
    const router = useRouter();

    const handleViewShop = () => {
        router.push(`/admin/dashboard/markets/view-shop/${shop.id}`);
    };

    return (
        <>
            {/* Desktop View */}
            <div className={`hidden md:flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0] ' : 'border-b border-[#EAECF0]'}`}>
                <div className="flex flex-col justify-center w-[25%] pl-[24px]">
                    <p className="text-[#101828] text-[14px] font-medium">{shop.name}</p>
                    <p className="text-[#667085] text-[14px]">ID: {shop.id}</p>
                </div>

                <div className="flex flex-col justify-center w-[20%] pl-[24px]">
                    <p className="text-[#101828] text-[14px]">{shop.firstName} {shop.lastName}</p>
                    <p className="text-[#667085] text-[14px]">{shop.phone}</p>
                </div>

                <div className="flex flex-col justify-center w-[15%] pl-[24px]">
                    <p className="text-[#101828] text-[14px]">{shop.marketSection}</p>
                </div>

                <div className="flex items-center w-[15%] px-[10px]">
                    <div className={`w-[70px] h-[22px] rounded-[8px] flex items-center justify-center ${
                        shop.status === 'VERIFIED' 
                            ? 'bg-[#ECFDF3] text-[#027A48]' 
                            : 'bg-[#FEF3F2] text-[#B42318]'
                    }`}>
                        <p className="text-[12px] font-medium">{shop.status}</p>
                    </div>
                </div>

                <div className="flex flex-col justify-center w-[15%] pl-[24px]">
                    <p className="text-[#101828] text-[14px]">₦{shop.totalPayoutAmount.toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-center w-[10%]">
                    <button
                        onClick={handleViewShop}
                        className="px-3 py-1 text-[12px] bg-[#022B23] text-white rounded-md hover:bg-[#033a30] transition-colors"
                    >
                        View and Edit
                    </button>
                </div>
            </div>

            {/* Mobile View */}
            <div className={`md:hidden p-4 ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <p className="text-[#101828] text-[14px] font-medium mb-1">{shop.name}</p>
                        <p className="text-[#667085] text-[12px]">ID: {shop.id}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-[6px] flex items-center justify-center ${
                        shop.status === 'VERIFIED' 
                            ? 'bg-[#ECFDF3] text-[#027A48]' 
                            : 'bg-[#FEF3F2] text-[#B42318]'
                    }`}>
                        <p className="text-[10px] font-medium">{shop.status}</p>
                    </div>
                </div>
                
                <div className="space-y-2 mb-3">
                    <div className="flex justify-between">
                        <span className="text-[#667085] text-[12px]">Owner:</span>
                        <span className="text-[#101828] text-[12px]">{shop.firstName} {shop.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[#667085] text-[12px]">Phone:</span>
                        <span className="text-[#101828] text-[12px]">{shop.phone}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[#667085] text-[12px]">Section:</span>
                        <span className="text-[#101828] text-[12px]">{shop.marketSection}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[#667085] text-[12px]">Total Payout:</span>
                        <span className="text-[#101828] text-[12px] font-medium">₦{shop.totalPayoutAmount.toLocaleString()}</span>
                    </div>
                </div>
                
                <button
                    onClick={handleViewShop}
                    className="w-full px-3 py-2 text-[12px] bg-[#022B23] text-white rounded-md hover:bg-[#033a30] transition-colors"
                >
                    View and Edit
                </button>
            </div>
        </>
    );
};

const ViewMarketShops = ({ params }: { params: Promise<PageParams> }) => {
    const router = useRouter();
    const [shops, setShops] = useState<ShopResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [marketName, setMarketName] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const { id } = use<PageParams>(params);
    const [currentPage, setCurrentPage] = useState(1);
    const SHOPS_PER_PAGE = 10;

    // Filter shops based on search term
    const filteredShops = shops.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.marketSection.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredShops.length / SHOPS_PER_PAGE);
    const currentShops = filteredShops.slice(
        (currentPage - 1) * SHOPS_PER_PAGE,
        currentPage * SHOPS_PER_PAGE
    );

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const fetchMarketShops = useCallback(async () => {
        try {
            setLoading(true);
            
            // Fetch market details first to get the market name
            const marketResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/markets/${id}`);
            setMarketName(marketResponse.data.name);

            // Fetch shops by market ID
            const shopsResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/by-market?marketId=${id}`
            );
            setShops(shopsResponse.data);
            console.log("Market shops: ", shopsResponse.data);
        } catch (err) {
            console.error("Error fetching market shops:", err);
            setError("Failed to fetch market shops");
            toast.error("Failed to fetch market shops");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchMarketShops();
    }, [fetchMarketShops]);

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (loading) return <div className="h-screen flex items-center justify-center">Loading market shops...</div>;
    if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="w-full min-h-screen">
            {/* Header Navigation */}
            <div className="text-[#707070] text-[14px] px-3 md:px-5 font-medium gap-2 flex items-center h-[56px] w-full border-b border-[#ededed]">
                <BackButton 
                    variant="default" 
                    text="Back to market details" 
                    onClick={() => router.push(`/admin/dashboard/markets/view-market/${id}`)} 
                />
            </div>

            {/* Page Title */}
            <div className="text-[#022B23] text-[14px] px-3 md:px-5 font-medium flex items-center h-[49px] border-b border-[#ededed]">
                <p className="truncate">Market Shops - {marketName}</p>
            </div>

            {/* Content */}
            <div className="px-3 md:px-[20px] py-4">
                <div className="w-full flex flex-col h-auto border-[#EAECF0] border rounded-[12px] md:rounded-[24px]">
                    <div className="w-full min-h-[91px] flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-[24px] pt-[20px] pb-[19px] gap-4">
                        <div className="flex flex-col gap-[4px] flex-1">
                            <div className="h-[28px] flex items-center">
                                <p className="text-[16px] md:text-[18px] font-medium text-[#101828]">Market Shops</p>
                            </div>
                            <div className="flex h-[20px] items-center">
                                <p className="text-[12px] md:text-[14px] text-[#667085]">
                                    View and manage shops in {marketName} ({filteredShops.length} shops)
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center bg-[#FFFFFF] border-[0.5px] border-[#F2F2F2] text-black px-3 md:px-4 py-2 shadow-sm rounded-sm w-full md:w-auto">
                            <Image src={searchImg} alt="Search Icon" width={20} height={20} className="h-[20px] w-[20px]" />
                            <input 
                                placeholder="Search shops..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-[175px] text-[#707070] text-[14px] focus:outline-none" 
                            />
                        </div>
                    </div>

                    {/* Desktop Table Header */}
                    <div className="hidden md:flex w-full h-[44px] bg-[#F9FAFB] border-b-[0.5px] border-[#EAECF0]">
                        <div className="h-full w-[25%] gap-[4px] flex px-[24px] items-center font-medium text-[#667085] text-[12px]">
                            <p>Shop Name</p>
                            <Image src={arrowDown} alt={'image'} />
                        </div>
                        <div className="flex w-[20%] items-center px-[24px] font-medium text-[#667085] text-[12px]">
                            Owner
                        </div>
                        <div className="flex w-[15%] items-center px-[24px] font-medium text-[#667085] text-[12px]">
                            Section
                        </div>
                        <div className="flex w-[15%] items-center px-[24px] font-medium text-[#667085] text-[12px]">
                            Status
                        </div>
                        <div className="flex w-[15%] items-center px-[24px] font-medium text-[#667085] text-[12px]">
                            Total Payout
                        </div>
                        <div className="flex w-[10%] items-center px-[24px] font-medium text-[#667085] text-[12px]">
                            Actions
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="flex flex-col">
                        {currentShops.length > 0 ? (
                            currentShops.map((shop, index) => (
                                <ShopTableRow
                                    key={shop.id}
                                    shop={shop}
                                    isLast={index === currentShops.length - 1}
                                />
                            ))
                        ) : (
                            <div className="flex justify-center items-center h-[200px]">
                                <p className="text-[#667085] text-center px-4">
                                    {searchTerm ? 'No shops found matching your search' : 'No shops found in this market'}
                                </p>
                            </div>
                        )}
                    </div>

                    {filteredShops.length > 0 && (
                        <div className="flex flex-col md:flex-row justify-between items-center mt-4 px-4 md:px-6 pb-6 gap-4">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-md text-[12px] md:text-[14px] ${currentPage === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-[#022B23] hover:bg-gray-100'
                                    }`}
                            >
                                Previous
                            </button>

                            <div className="flex gap-1 md:gap-2 flex-wrap justify-center">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-8 h-8 rounded-md flex items-center justify-center text-[12px] ${currentPage === page
                                            ? 'bg-[#022B23] text-white'
                                            : 'text-[#022B23] hover:bg-gray-100'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-md text-[12px] md:text-[14px] ${currentPage === totalPages
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-[#022B23] hover:bg-gray-100'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewMarketShops;