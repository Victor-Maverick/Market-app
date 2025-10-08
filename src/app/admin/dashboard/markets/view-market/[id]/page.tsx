'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";
import arrowDown from "../../../../../../../public/assets/images/arrow-down.svg";
import { use, useCallback, useEffect, useRef, useState } from "react";
import EditMarketLineModal from "@/components/editMarketLineModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import AddNewLineModal from "@/components/addNewLineModal";
import { toast } from "react-hot-toast";
import axios from "axios";
import BackButton from "@/components/BackButton";
interface Market {
    id: number;
    name: string;
    address: string;
    city: string;
    lines: number;
    status: "INACTIVE" | "ACTIVE";
    shops: Shop[];
    marketId: string;
    createdAt: string;
}
interface PageParams {
    id: number;
}

interface Shop {
    id: number;
    name: string;
    address: string;
    phone: string;
    shopNumber: string;
    homeAddress: string;
    streetName: string;
    cacNumber: string;
    taxIdNumber: string;
    nin: string;
    bankName: string;
    accountNumber: string;
    marketId: number;
    marketSectionId: string;
    email: string;
    status: "ACTIVE" | "INACTIVE";
}

interface MarketSection {
    id: number;
    marketId: number;
    name: string;
    shops: number;
    createdAt: string;
    updatedAt: string;
    status: "ACTIVE" | "INACTIVE";
}

const MarketSectionTableRow = ({ section, isLast, onRefresh }: { section: MarketSection; isLast: boolean; onRefresh: () => void }) => {

    return (
        <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0] ' : 'border-b border-[#EAECF0]'}`}>
            <div className="flex flex-col justify-center w-[50%] pl-[24px]">
                <p className="text-[#101828] text-[14px] font-medium">{section.name}</p>
                <p className="text-[#667085] text-[14px]">ID: {section.id}</p>
            </div>

            <div className="flex items-center w-[17%] px-[10px]">
                <div className={`w-[55px] h-[22px] rounded-[8px] flex items-center justify-center ${
                    section.status === 'ACTIVE'
                        ? 'bg-[#ECFDF3] text-[#027A48]'
                        : 'bg-[#FEF3F2] text-[#FF5050]'
                }`}>
                    <p className="text-[12px] font-medium">{section.status}</p>
                </div>
            </div>

            <div className="flex flex-col justify-center w-[30%] pl-[24px]">
                <p className="text-[#101828] text-[14px]">{section.shops}</p>
            </div>

            <div className="flex items-center justify-center w-[3%]">
                <MarketActionsDropdown section={section.name} marketId={section.id} onRefresh={onRefresh} sectionStatus={section.status}>
                    <div>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    </div>
                </MarketActionsDropdown>
            </div>
        </div>
    );
};

const MarketActionsDropdown = ({ children, section, marketId, onRefresh, sectionStatus }: { section: string, marketId: number; children: React.ReactNode; onRefresh: () => void; sectionStatus?: "ACTIVE" | "INACTIVE" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
    const [currentSectionName, setCurrentSectionName] = useState(section);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleOpenMarketModal = () => {
        setIsOpen(false);
        setIsMarketModalOpen(true);
    };

    const handleCloseMarketModal = () => {
        setIsMarketModalOpen(false);
    };

    const handleMarketModalContinue = async (newName: string, id: number) => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/market-sections/update/${id}`,
                { name: newName }
            );

            if (response.status === 200) {
                setCurrentSectionName(newName);
                toast.success("Section updated successfully");
                // Refresh the sections list to show updated data
                onRefresh();
            }
        } catch (error) {
            console.error("Error updating section:", error);
            toast.error("Failed to update section. Please try again.");
        }
        setIsMarketModalOpen(false);
    };

    const handleToggleLineStatus = async () => {
        try {
            const endpoint = sectionStatus === 'ACTIVE'
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/market-sections/deActivate-line?id=${marketId}`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/market-sections/activate-line?id=${marketId}`;
            
            const response = await axios.put(endpoint);

            if (response.status === 200) {
                const action = sectionStatus === 'ACTIVE' ? 'deactivated' : 'activated';
                toast.success(`Line ${action} successfully`);
                // Refresh the sections list to show updated data
                onRefresh();
            }
        } catch (error) {
            console.error("Error toggling line status:", error);
            toast.error("Failed to update line status. Please try again.");
        }
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

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
                        <ul className="">
                            <li
                                onClick={handleOpenMarketModal}
                                className="px-[8px] py-[4px] h-[38px] text-[12px] hover:bg-[#f9f9f9] text-[#1E1E1E] cursor-pointer"
                            >
                                edit line
                            </li>
                            <li onClick={handleToggleLineStatus} className="px-[8px] py-[4px] h-[38px] text-[#8C8C8C] hover:bg-[#f9f9f9] hover:border-b-[0.5px] hover:border-t-[0.5px] hover:border-[#F2F2F2] text-[12px] cursor-pointer">
                                {sectionStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            <EditMarketLineModal
                id={marketId}
                name={currentSectionName}
                isOpen={isMarketModalOpen}
                onClose={handleCloseMarketModal}
                onContinue={handleMarketModalContinue}
            />
        </>
    );
};

const ViewMarket = ({ params }: { params: Promise<PageParams> }) => {
    const router = useRouter();
    const [isAddNewLineModalOpen, setIsAddNewLineModalOpen] = useState(false);
    const [market, setMarket] = useState<Market | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [marketSections, setMarketSections] = useState<MarketSection[]>([]);
    const [isUpdateMarketModalOpen, setIsUpdateMarketModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [transactionCount, setTransactionCount] = useState<number>(0);
    const { id } = use<PageParams>(params);
    const [currentSectionPage, setCurrentSectionPage] = useState(1);
    const SECTIONS_PER_PAGE = 5;
    const totalSectionPages = Math.ceil(marketSections.length / SECTIONS_PER_PAGE);

    const currentSections = marketSections.slice(
        (currentSectionPage - 1) * SECTIONS_PER_PAGE,
        currentSectionPage * SECTIONS_PER_PAGE
    );

    const handleSectionPrevPage = () => {
        if (currentSectionPage > 1) {
            setCurrentSectionPage(currentSectionPage - 1);
        }
    };

    const handleSectionNextPage = () => {
        if (currentSectionPage < totalSectionPages) {
            setCurrentSectionPage(currentSectionPage + 1);
        }
    };

    const handleSectionPageChange = (page: number) => {
        setCurrentSectionPage(page);
    };

    const fetchMarketSections = useCallback(async () => {
        try {
            const sectionsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/market-sections/allByMarket?marketId=${id}`);
            setMarketSections(sectionsResponse.data);
            console.log("Sections:: ", sectionsResponse.data);
        } catch (err) {
            console.error("Error fetching market sections:", err);
            toast.error("Failed to fetch market sections");
        }
    }, [id]);

    const fetchTransactionCount = useCallback(async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/getMarketTransactionCount?marketId=${id}`
            );
            setTransactionCount(response.data);
            console.log("Transaction count: ", transactionCount);
        } catch (err) {
            console.error("Error fetching market transaction count:", err);
            toast.error("Failed to fetch transaction count");
        }
    }, [id]);

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                setLoading(true);
                // Fetch market details
                const marketResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/markets/${id}`);
                setMarket(marketResponse.data);
                // Fetch market sections and transaction count
                await Promise.all([
                    fetchMarketSections(),
                    fetchTransactionCount()
                ]);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch market data");
                setLoading(false);
                console.error("Error fetching market data:", err);
            }
        };

        fetchMarketData();
    }, [id, fetchMarketSections, fetchTransactionCount]);

    const handleOpenAddNewLineModal = () => {
        setIsAddNewLineModalOpen(true);
    };

    const handleCloseAddNewLineModal = () => {
        setIsAddNewLineModalOpen(false);
    };

    const handleAddNewLineContinue = () => {
        setIsAddNewLineModalOpen(false)
    };

    const handleOpenUpdateMarketModal = () => {
        setIsUpdateMarketModalOpen(true);
    };

    const handleCloseUpdateMarketModal = () => {
        setIsUpdateMarketModalOpen(false);
    };

    const handleUpdateMarket = async (newName: string) => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/markets/update/${id}`,
                { name: newName }
            );

            if (response.status === 200) {
                toast.success("Market updated successfully");
                // Update the market state with new data
                setMarket(prev => prev ? { ...prev, name: newName } : null);
            }
        } catch (error) {
            console.error("Error updating market:", error);
            toast.error("Failed to update market. Please try again.");
        }
        setIsUpdateMarketModalOpen(false);
    };

    const handleOpenDeactivateModal = () => {
        setIsDeactivateModalOpen(true);
    };

    const handleCloseDeactivateModal = () => {
        setIsDeactivateModalOpen(false);
    };

    const handleToggleMarketStatus = async () => {
        try {
            const endpoint = market?.status === 'ACTIVE' 
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/markets/deActivateMarket?id=${id}`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/markets/activateMarket?id=${id}`;
            
            const response = await axios.put(endpoint);

            if (response.status === 200) {
                const newStatus = market?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                toast.success(`Market ${newStatus.toLowerCase()} successfully`);
                // Update the market state with new status
                setMarket(prev => prev ? { ...prev, status: newStatus as "ACTIVE" | "INACTIVE" } : null);
            }
        } catch (error) {
            console.error("Error toggling market status:", error);
            toast.error("Failed to update market status. Please try again.");
        }
        setIsDeactivateModalOpen(false);
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading market data...</div>;
    if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!market) return <div className="h-screen flex items-center justify-center">Market not found</div>;

    // Calculate stats
    const totalShops = market.shops.length;
    
    return (
        <div className="w-full min-h-screen">
            {/* Header Navigation */}
            <div className="text-[#707070] text-[14px] px-3 md:px-5 font-medium gap-2 flex items-center h-[56px] w-full border-b border-[#ededed]">
                <BackButton variant="default" text="Back to market management" onClick={() => router.push("/admin/dashboard/markets")} />
            </div>

            {/* Page Title */}
            <div className="text-[#022B23] text-[14px] px-3 md:px-5 font-medium flex items-center h-[49px] border-b border-[#ededed]">
                <p>View market</p>
            </div>

            {/* Market Header Info */}
            <div className="px-3 md:px-[20px] py-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                    <div className="flex flex-col gap-[4px] flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row gap-2 md:gap-[8px] md:items-center">
                            <h2 className="text-[16px] md:text-[18px] font-semibold text-[#022B23] truncate">{market.name}</h2>
                            <span className="text-[10px] md:text-[12px] font-medium w-fit px-2 md:w-[50px] rounded-[8px] h-[20px] md:h-[25px] bg-[#F9FAFB] flex items-center justify-center text-[#667085]">ID: #{market.id}</span>
                        </div>
                        <p className="text-[12px] md:text-[14px] text-[#707070] font-medium">{market.address}, {market.city}</p>
                    </div>
                    <span className={`${market.status === 'ACTIVE' ? 'text-[#93C51D] border-[#93C51D] bg-[#F9FDE8]' : 'text-[#FF5050] border-[#FF5050] bg-[#FFFAF9]'} border w-[53px] h-[32px] flex justify-center items-center text-[12px] rounded-[6px] flex-shrink-0`}>
                        {market.status}
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 w-full gap-3 md:gap-[20px] mb-[20px] mt-[20px] md:h-[110px]">
                    <div className="flex flex-col rounded-[8px] md:rounded-[14px] h-[90px] md:h-full border-[#EAEAEA] border-[0.5px]">
                        <div className="w-full px-2 md:px-[14px] flex items-center rounded-tl-[8px] rounded-tr-[8px] md:rounded-tl-[14px] md:rounded-tr-[14px] h-[25px] md:h-[30px] bg-[#F7F7F7]">
                            <p className="text-[#707070] text-[10px] md:text-[12px]">Lines</p>
                        </div>
                        <div className="h-[65px] md:h-[80px] flex justify-center flex-col p-2 md:p-[14px]">
                            <p className="text-[16px] md:text-[20px] text-[#022B23] font-medium">{market.lines}</p>
                        </div>
                    </div>
                    <div className="flex flex-col rounded-[8px] md:rounded-[14px] h-[90px] md:h-full border-[#EAEAEA] border-[0.5px]">
                        <div className="w-full px-2 md:px-[14px] flex items-center rounded-tl-[8px] rounded-tr-[8px] md:rounded-tl-[14px] md:rounded-tr-[14px] h-[25px] md:h-[30px] bg-[#F7F7F7]">
                            <p className="text-[#707070] text-[10px] md:text-[12px]">Total shops</p>
                        </div>
                        <div className="h-[65px] md:h-[80px] flex justify-center flex-col p-2 md:p-[14px]">
                            <p className="text-[16px] md:text-[20px] text-[#022B23] font-medium">{totalShops}</p>
                        </div>
                    </div>
                    <div className="flex flex-col rounded-[8px] md:rounded-[14px] h-[90px] md:h-full border-[#EAEAEA] border-[0.5px]">
                        <div className="w-full px-2 md:px-[14px] flex items-center rounded-tl-[8px] rounded-tr-[8px] md:rounded-tl-[14px] md:rounded-tr-[14px] h-[25px] md:h-[30px] bg-[#F7F7F7]">
                            <p className="text-[#707070] text-[10px] md:text-[12px]">Inactive shops</p>
                        </div>
                        <div className="h-[65px] md:h-[80px] flex justify-center flex-col p-2 md:p-[14px]">
                            <p className="text-[16px] md:text-[20px] text-[#022B23] font-medium">{market.shops.filter(shop => shop.status === 'INACTIVE').length}</p>
                        </div>
                    </div>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-[6px] md:h-[48px]">
                    <div
                        onClick={handleOpenAddNewLineModal}
                        className="bg-[#022B23] flex items-center h-[40px] md:h-full justify-center w-full md:w-[189px] text-[#C6EB5F] text-[12px] md:text-[14px] font-semibold rounded-[8px] md:rounded-[12px] cursor-pointer hover:bg-[#033a30] transition-colors"
                    >
                        Add new line
                    </div>
                    <div
                        onClick={() => router.push(`/admin/dashboard/markets/view-shops/${id}`)}
                        className="bg-[#C6EB5F] flex items-center h-[40px] md:h-full justify-center w-full md:w-[140px] text-[#022B23] text-[12px] md:text-[14px] font-semibold rounded-[8px] md:rounded-[12px] cursor-pointer hover:bg-[#b8d954] transition-colors"
                    >
                        View Shops
                    </div>
                    <div
                        onClick={handleOpenUpdateMarketModal}
                        className="border flex items-center h-[40px] md:h-full justify-center w-full md:w-[112px] text-[12px] md:text-[14px] font-medium border-[#022B23] text-[#022B23] px-4 py-2 rounded-[8px] md:rounded-[12px] cursor-pointer hover:bg-[#022B23] hover:text-white transition-colors"
                    >
                        Update
                    </div>
                    <div
                        onClick={handleOpenDeactivateModal}
                        className="border flex items-center h-[40px] md:h-full justify-center w-full md:w-[112px] text-[12px] md:text-[14px] font-medium border-[#FF5050] text-[#FF5050] px-4 py-2 rounded-[8px] md:rounded-[12px] cursor-pointer hover:bg-[#FF5050] hover:text-white transition-colors"
                    >
                        {market.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </div>
                </div>
                <div className="mt-[30px]">
                    <div className="w-full flex flex-col h-auto border-[#EAECF0] border rounded-[12px] md:rounded-[24px]">
                        <div className="w-full min-h-[91px] flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-[24px] pt-[20px] pb-[19px] gap-4">
                            <div className="flex flex-col gap-[4px] flex-1">
                                <div className="h-[28px] flex items-center">
                                    <p className="text-[16px] md:text-[18px] font-medium text-[#101828]">Market Lines and Sections</p>
                                </div>
                                <div className="flex h-[20px] items-center">
                                    <p className="text-[12px] md:text-[14px] text-[#667085]">View and manage sections in {market?.name}</p>
                                </div>
                            </div>

                        </div>

                        <div className="w-full h-[44px] flex bg-[#F9FAFB] border-b-[0.5px] border-[#EAECF0]">
                            <div className="h-full w-[50%] gap-[4px] flex px-[24px] items-center font-medium text-[#667085] text-[12px]">
                                <p>Section</p>
                                <Image src={arrowDown} alt={'image'} />
                            </div>
                            <div className="flex w-[17%] items-center px-[24px] font-medium text-[#667085] text-[12px]">
                                Status
                            </div>
                            <div className="flex w-[30%] items-center px-[24px] font-medium text-[#667085] text-[12px]">
                                Shops
                            </div>
                            <div className="w-[3%]"></div>
                        </div>
                        <div className="flex flex-col">
                            {loading ? (
                                <div className="flex justify-center items-center h-[200px]">
                                    <p>Loading sections...</p>
                                </div>
                            ) : marketSections.length > 0 ? (
                                currentSections.map((section, index) => (
                                    <MarketSectionTableRow
                                        key={section.id}
                                        section={section}
                                        isLast={index === currentSections.length - 1}
                                        onRefresh={fetchMarketSections}
                                    />
                                ))
                            ) : (
                                <div className="flex justify-center items-center h-[200px]">
                                    <p>No sections found</p>
                                </div>
                            )}
                        </div>

                        {marketSections.length > 0 && (
                            <div className="flex justify-between items-center mt-4 px-6 pb-6">
                                <button
                                    onClick={handleSectionPrevPage}
                                    disabled={currentSectionPage === 1}
                                    className={`px-4 py-2 rounded-md ${currentSectionPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-[#022B23] hover:bg-gray-100'
                                        }`}
                                >
                                    Previous
                                </button>

                                <div className="flex gap-2">
                                    {Array.from({ length: totalSectionPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handleSectionPageChange(page)}
                                            className={`w-8 h-8 rounded-md flex items-center justify-center ${currentSectionPage === page
                                                ? 'bg-[#022B23] text-white'
                                                : 'text-[#022B23] hover:bg-gray-100'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSectionNextPage}
                                    disabled={currentSectionPage === totalSectionPages}
                                    className={`px-4 py-2 rounded-md ${currentSectionPage === totalSectionPages
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

            {/* Add New Line Modal */}
            <AddNewLineModal
                isOpen={isAddNewLineModalOpen}
                onClose={handleCloseAddNewLineModal}
                onContinue={handleAddNewLineContinue}
                marketId={Number(id)} // Convert to number if needed
            />

            {/* Update Market Modal */}
            <EditMarketLineModal
                id={Number(id)}
                name={market?.name || ''}
                isOpen={isUpdateMarketModalOpen}
                onClose={handleCloseUpdateMarketModal}
                onContinue={handleUpdateMarket}
            />

            {/* Deactivate Market Modal */}
            <DeleteConfirmationModal
                isOpen={isDeactivateModalOpen}
                onClose={handleCloseDeactivateModal}
                onDelete={handleToggleMarketStatus}
                title={`${market?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Market`}
                message={`Are you sure you want to ${market?.status === 'ACTIVE' ? 'deactivate' : 'activate'} this market? This will affect all shops and sections in this market.`}
            />
        </div>
    )
}

export default ViewMarket;

