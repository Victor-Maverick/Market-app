'use client'
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import arrowDown from "../../../../../public/assets/images/arrow-down.svg";
import axios from "axios";
import { toast } from "react-toastify";
import { VendorsTableSkeleton, StatsCardsLoadingSkeleton } from "@/components/LoadingSkeletons";

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
    promotedTierId: number;
    featuredNumber: number;
    promotedNumber: number;
    floatedNumber: number;
}

const VendorActionsDropdown = ({
                                   children,
                                   shopId,
                                   status,
                                   onToggleStatus,
                               }: {
    shopId: number;
    children: React.ReactNode;
    status: string;
    onToggleStatus: (shopId: number) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleViewVendor = () => {
        router.push(`/admin/dashboard/vendors/view-vendor/${shopId}`);
        setIsOpen(false);
    };

    const handleDeactivate = () => {
        onToggleStatus(shopId);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const renderOptions = () => (
        <>
            <li
                onClick={handleViewVendor}
                className="px-[8px] py-[4px] h-[38px] text-[12px] hover:bg-[#f9f9f9] text-[#1E1E1E] cursor-pointer"
            >
                View
            </li>
            {status === 'VERIFIED' ? (
                <li
                    onClick={handleDeactivate}
                    className="px-[8px] py-[4px] h-[38px] text-[#8C8C8C] hover:bg-[#f9f9f9] hover:border-b-[0.5px] hover:border-t-[0.5px] hover:border-[#F2F2F2] text-[12px] cursor-pointer"
                >
                    Deactivate
                </li>
            ) : (
                <li
                    onClick={handleDeactivate}
                    className="px-[8px] py-[4px] h-[38px] text-[#52A43E] hover:bg-[#f9f9f9] hover:border-b-[0.5px] hover:border-t-[0.5px] hover:border-[#F2F2F2] text-[12px] cursor-pointer"
                >
                    Activate
                </li>
            )}

        </>
    );

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <div
                    ref={triggerRef}
                    onClick={handleToggle}
                    className="cursor-pointer flex flex-col gap-[3px] items-center justify-center"
                >
                    {children}
                </div>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-1 h-[76px] bg-white rounded-[8px] shadow-lg z-50 border border-[#ededed] w-[134px]">
                        <ul className="">{renderOptions()}</ul>
                    </div>
                )}
            </div>


        </>
    );
};

const VendorTableRow = ({ shop, isLast, onToggleStatus }: {
    shop: ShopResponse;
    isLast: boolean;
    onToggleStatus: (shopId: number) => void;
}) => {
    const getStatusText = (status: string) => {
        switch (status) {
            case 'VERIFIED':
                return 'Active';
            case 'NOT_VERIFIED':
                return 'Inactive';
            default:
                return 'Deactivated';
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'VERIFIED':
                return 'bg-[#ECFDF3] text-[#027A48]';
            case 'NOT_VERIFIED':
                return 'bg-[#FEF3F2] text-[#FF5050]';
            default:
                return 'bg-[#F2F2F2] text-[#667085]';
        }
    };

    return (
        <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}>
            <div className="flex items-center w-[40%] pl-[24px]">
                <p className="text-[#101828] text-[14px] font-medium">{`${shop.firstName} ${shop.lastName}`}</p>
            </div>

            <div className="flex flex-col justify-center w-[27%] pl-[24px]">
                <p className="text-[#101828] text-[14px] font-medium">{shop.name}</p>
                <p className="text-[#667085] text-[14px]">{shop.address}</p>
            </div>

            <div className="flex items-center w-[15%] pl-[24px]">
                <p className="text-[#101828] text-[14px]">{shop.id}</p>
            </div>

            <div className="flex items-center w-[15%] px-[10px]">
                <div className={`w-[55px] h-[22px] rounded-[8px] flex items-center justify-center ${getStatusStyles(shop.status)}`}>
                    <p className="text-[12px] font-medium">{getStatusText(shop.status)}</p>
                </div>
            </div>

            <div className="flex items-center justify-center w-[3%]">
                <VendorActionsDropdown shopId={shop.id} status={shop.status} onToggleStatus={onToggleStatus}>
                    <div className="flex flex-col gap-1">
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    </div>
                </VendorActionsDropdown>
            </div>
        </div>
    );
};

const StatsCard = ({ title, value,  isPending = false, isWarning = false }: { title: string; value: string; isPending: boolean; isWarning?: boolean }) => {
    return (
        <div className={`flex flex-col w-[25%] rounded-[14px] h-full ${isWarning ? 'border-[#FF2121]' : 'border-[#EAEAEA]'} border-[0.5px]`}>
            <div className={`w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] ${isWarning ? 'bg-[#FFE8E8]' : isPending ? 'bg-[#FFB320]' : 'bg-[#F7F7F7]'}`}>
                <p className="text-[#707070] text-[12px]">{title}</p>
            </div>
            <div className="h-[80px] flex justify-center flex-col p-[14px]">
                <p className="text-[20px] text-[#022B23] font-medium">{value}</p>
            </div>
        </div>
    );
};

const Vendors = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [vendorStats, setVendorStats] = useState({
        totalVendors: 0,
        activeVendors: 0,
        inactiveVendors: 0,
        dailySignups: 0
    });
    const [shops, setShops] = useState<ShopResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const vendorsPerPage = 5;

    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                setLoading(true);

                // Fetch shops and stats in parallel
                const [shopsRes, totalVendorsRes, activeShopsRes] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/all`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getAllVendorsCount`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/allActiveShopsCount`)
                ]);

                setShops(shopsRes.data);

                const totalVendors = totalVendorsRes.data;
                const activeVendors = activeShopsRes.data;
                const totalShops = shopsRes.data.length;

                setVendorStats({
                    totalVendors: totalVendors,
                    activeVendors: activeVendors,
                    inactiveVendors: totalShops - activeVendors,
                    dailySignups: Math.floor(totalVendors * 0.05)
                });
            } catch (error) {
                console.error('Error fetching vendor data:', error);
                setVendorStats({
                    totalVendors: 0,
                    activeVendors: 0,
                    inactiveVendors: 0,
                    dailySignups: 0
                });
                setShops([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVendorData();
    }, []);

    const filteredShops = shops.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${shop.firstName} ${shop.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredShops.length / vendorsPerPage);
    const startIndex = (currentPage - 1) * vendorsPerPage;
    const endIndex = startIndex + vendorsPerPage;
    const currentVendors = filteredShops.slice(startIndex, endIndex);

    const handleToggleStatus = async (shopId: number) => {
        try {
            // Find the current shop to determine its status
            const currentShop = shops.find(shop => shop.id === shopId);
            if (!currentShop) return;

            const endpoint = currentShop.status === 'VERIFIED'
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/deactivateShop?shopId=${shopId}`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/activateShop?shopId=${shopId}`;

            await axios.put(endpoint);
            // Refresh the shops data after successful toggle
            const shopsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/all`);
            setShops(shopsRes.data);
            
            const action = currentShop.status === 'VERIFIED' ? 'deactivated' : 'activated';
            toast.success(`Vendor ${action} successfully`);
        } catch (error) {
            console.error('Error toggling shop status:', error);
            toast.error('Failed to update vendor status');
        }
    };

    return (
        <>
            <div className="text-[#022B23] text-[14px] px-[20px] font-medium gap-[8px] flex items-center h-[49px] w-full border-b-[0.5px] border-[#ededed]">
                <p>Vendor management</p>
            </div>

            <div className="px-[20px] mt-[20px]">
                {loading ? (
                    <StatsCardsLoadingSkeleton />
                ) : (
                    <div className="flex w-full gap-[20px] h-[110px] justify-between">
                        <StatsCard title="Total vendors" value={vendorStats.totalVendors.toString()} isPending={false} />
                        <StatsCard title="Active Vendor shops" value={vendorStats.activeVendors.toString()} isPending={false} />
                        <StatsCard title="Inactive vendor shops" value={vendorStats.inactiveVendors.toString()} isWarning isPending={false} />
                    </div>
                )}

                <div className="mt-[50px]">
                    <div className="w-full flex flex-col h-auto border-[#EAECF0] border rounded-[24px]">
                        <div className="w-full h-[91px] flex items-center justify-between px-[24px] pt-[20px] pb-[19px]">
                            <div className="flex flex-col gap-[4px]">
                                <div className="h-[28px] flex items-center">
                                    <p className="text-[18px] font-medium text-[#101828]">Vendor shops ({filteredShops.length})</p>
                                </div>
                                <div className="flex h-[20px] items-center">
                                    <p className="text-[14px] text-[#667085]">View and manage vendors here</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-[44px] flex bg-[#F9FAFB] border-b-[0.5px] border-[#EAECF0]">
                            <div className="h-full w-[40%] gap-[4px] flex px-[24px] items-center font-medium text-[#667085] text-[12px]">
                                <p>Vendor</p>
                                <Image src={arrowDown} alt={'image'} />
                            </div>
                            <div className="h-full w-[27%] gap-[4px] flex px-[24px] items-center font-medium text-[#667085] text-[12px]">
                                <p>Shop Details</p>
                                <Image src={arrowDown} alt={'image'} />
                            </div>
                            <div className="flex w-[15%] items-center px-[24px] font-medium text-[#667085] text-[12px]">
                                Vendor ID
                            </div>
                            <div className="flex w-[15%] items-center px-[24px] font-medium text-[#667085] text-[12px]">
                                Status
                            </div>
                            <div className="w-[3%]"></div>
                        </div>

                        <div className="flex flex-col">
                            {loading ? (
                                <VendorsTableSkeleton />
                            ) : currentVendors.length === 0 ? (
                                <div className="flex items-center justify-center h-[200px]">
                                    <p className="text-[#667085]">No vendors found</p>
                                </div>
                            ) : (
                                currentVendors.map((shop, index) => (
                                    <VendorTableRow
                                        key={shop.id}
                                        shop={shop}
                                        isLast={index === currentVendors.length - 1}
                                        onToggleStatus={handleToggleStatus}
                                    />
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 py-4 border-t border-[#EAECF0]">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-[#EAECF0] rounded disabled:opacity-50 text-[#667085] text-[14px]"
                                >
                                    Previous
                                </button>
                                <span className="text-[14px] text-[#667085]">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-[#EAECF0] rounded disabled:opacity-50 text-[#667085] text-[14px]"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Vendors;