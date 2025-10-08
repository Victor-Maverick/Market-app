'use client'
import Image from "next/image";
import arrowUp from "../../../../../public/assets/images/green arrow up.png";
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import searchImg from "../../../../../public/assets/images/search-normal.png";
import arrowDown from "../../../../../public/assets/images/arrow-down.svg";
import { logisticsService, LogisticsStats } from "@/services/logisticsService";
import LogisticsPartnerModal from "@/components/LogisticsPartnerModal";
import Toast from "@/components/Toast";

interface Partner {
    id: number;
    name: string;
    routeState: string;
    routeLga: string;
    partnerId: string;
    status: "Active" | "Inactive" | "Pending";
}

const PartnerActionsDropdown = ({ children, marketId, status }: { marketId: string; children: React.ReactNode; status: Partner['status'] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleOpenDeleteModal = () => {
        setIsOpen(false);
        setIsDeleteModalOpen(true);
    };

    const handleOpenRejectModal = () => {
        setIsOpen(false);
        setIsRejectModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };

    const handleCloseRejectModal = () => {
        setIsRejectModalOpen(false);
    };

    const handleDelete = async () => {
        try {
            await logisticsService.deletePartner(parseInt(marketId));
            console.log(`Deleted partner with ID: ${marketId}`);
            // Refresh the page or update the partners list
            window.location.reload();
        } catch (error) {
            console.error('Error deleting partner:', error);
        }
        setIsDeleteModalOpen(false);
    };

    const handleReject = async () => {
        try {
            await logisticsService.rejectPartner(parseInt(marketId));
            console.log(`Rejected partner with ID: ${marketId}`);
            // Refresh the page or update the partners list
            window.location.reload();
        } catch (error) {
            console.error('Error rejecting partner:', error);
        }
        setIsRejectModalOpen(false);
    };

    const handleApprove = async () => {
        try {
            await logisticsService.approvePartner(parseInt(marketId));
            console.log(`Approved partner with ID: ${marketId}`);
            // Refresh the page or update the partners list
            window.location.reload();
        } catch (error) {
            console.error('Error approving partner:', error);
        }
        setIsOpen(false);
    };

    const handleViewVendor = () => {
        router.push(`/admin/dashboard/logistics/view-partner?id=${marketId}`);
        setIsOpen(false);
    };

    const handleDeactivate = () => {
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

    const renderActiveOptions = () => (
        <>
            <li onClick={handleViewVendor} className="px-[8px] py-[4px] h-[38px] text-[12px] hover:bg-[#f9f9f9] text-[#1E1E1E] cursor-pointer">View partner</li>
            <li onClick={handleDeactivate} className="px-[8px] py-[4px] h-[38px] text-[#8C8C8C] hover:border-b-[0.5px] hover:border-t-[0.5px] hover:border-[#F2F2F2] text-[12px] cursor-pointer">Deactivate partner</li>
            <li onClick={handleOpenDeleteModal} className="px-[8px] rounded-bl-[8px] rounded-br-[8px] py-[4px] h-[38px] text-[12px] hover:bg-[#FFFAF9] hover:border-t-[0.5px] hover:border-[#F2F2F2] cursor-pointer text-[#FF5050]">
                Delete
            </li>
        </>
    );


    const renderPendingOptions = () => (
        <>
            <li onClick={()=>{router.push(`/admin/dashboard/logistics/view-pending?id=${marketId}`)}} className="px-[8px] py-[4px] h-[38px] text-[12px] hover:bg-[#f9f9f9] text-[#1E1E1E] cursor-pointer">View partner</li>
            <li onClick={handleApprove} className="px-[8px] py-[4px] h-[38px] text-[12px] hover:bg-[#f9f9f9] text-[#1E1E1E] cursor-pointer">Approve partner</li>
            <li onClick={handleOpenRejectModal} className="px-[8px] rounded-bl-[8px] rounded-br-[8px] py-[4px] h-[38px] text-[12px] hover:bg-[#FFFAF9] hover:border-t-[0.5px] hover:border-[#F2F2F2] cursor-pointer text-[#FF5050]">
                Reject
            </li>
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
                    <div className="absolute right-0 top-full mt-1 h-[114px] bg-white rounded-[8px] shadow-lg z-50 border border-[#ededed] w-[134px]">
                        <ul className="">
                            {status === "Active" && renderActiveOptions()}
                            {status === "Pending" && renderPendingOptions()}
                        </ul>
                    </div>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onDelete={handleDelete}
                title="Delete Vendor"
                message="Are you sure you want to delete this vendor? This action cannot be undone."
            />

            <DeleteConfirmationModal
                isOpen={isRejectModalOpen}
                onClose={handleCloseRejectModal}
                onDelete={handleReject}
                title="Reject Vendor"
                message="Are you sure you want to reject this vendor? This action cannot be undone."
                confirmText="Reject"
            />
        </>
    );
};

const PartnerTableRow = ({ partner, isLast }: { partner: Partner; isLast: boolean }) => {
    return (
        <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}>
            <div className="flex items-center w-[40%] pl-[24px]">
                <p className="text-[#101828] text-[14px] font-medium">{partner.name}</p>
            </div>

            <div className="flex flex-col justify-center w-[27%] pl-[24px]">
                <p className="text-[#101828] text-[14px] font-medium">{partner.routeState}</p>
                <p className="text-[#667085] text-[14px]">{partner.routeLga}</p>
            </div>

            <div className="flex items-center w-[15%] pl-[24px]">
                <p className="text-[#101828] text-[14px]">{partner.partnerId}</p>
            </div>

            <div className="flex items-center w-[15%] px-[10px]">
                <div className={`w-[55px] h-[22px] rounded-[8px] flex items-center justify-center ${
                    partner.status === 'Active'
                        ? 'bg-[#ECFDF3] text-[#027A48]'
                        : partner.status=== 'Pending'? 'text-[#FF5050] bg-[#FFFAEB]'
                            : 'bg-[#FEF3F2] text-[#FF5050]'
                }`}>
                    <p className="text-[12px] font-medium">{partner.status}</p>
                </div>
            </div>

            <div className="flex items-center justify-center w-[3%]">
                <PartnerActionsDropdown marketId={partner.partnerId} status={partner.status}>
                    <div className="flex flex-col gap-1">
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    </div>
                </PartnerActionsDropdown>
            </div>
        </div>
    );
};


const Logistics = ()=>{
    const [stats, setStats] = useState<LogisticsStats>({
        totalPartners: 0,
        activePartners: 0,
        inactivePartners: 0,
        pendingPartners: 0,
        totalVehicles: 0,
        totalRiders: 0
    });
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [toastMessage, setToastMessage] = useState('');
    const [toastSubMessage, setToastSubMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const showToastMessage = (type: 'success' | 'error', message: string, subMessage: string = '') => {
        setToastType(type);
        setToastMessage(message);
        setToastSubMessage(subMessage);
        setShowToast(true);
    };

    const handleModalSuccess = (message: string) => {
        showToastMessage('success', 'Success', message);
        // Refresh the data
        fetchData();
    };

    const handleModalError = (message: string) => {
        showToastMessage('error', 'Error', message);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsData, companiesData] = await Promise.all([
                logisticsService.getLogisticsStats(),
                logisticsService.getAllCompanies().catch(() => []) // Fallback to empty array if endpoint fails
            ]);
            
            setStats(statsData);
            
            // Convert companies data to partners format
            if (companiesData.length > 0) {
                const partnersData: Partner[] = companiesData.map(company => ({
                    id: company.id,
                    name: company.companyName,
                    routeState: company.companyAddress.split(',')[0] || "N/A",
                    routeLga: company.companyAddress.split(',')[1] || "N/A",
                    partnerId: company.id.toString(),
                    status: company.status || "Pending"
                }));
                setPartners(partnersData);
            } else {
                // Fallback to mock data if no companies found
                const mockPartners: Partner[] = [
                    {id:1, name: "Fele express", routeState: "Benue State", routeLga: "Makurdi", partnerId: "12345", status: "Pending"},
                    {id:2, name: "Speedax Logistics", routeState: "Benue State", routeLga: "Makurdi", partnerId: "12346", status: "Active"},
                    {id:3, name: "Arabian Logistics", routeState: "Benue State", routeLga: "Makurdi", partnerId: "12347", status: "Inactive"},
                    {id:4, name: "Swift Delivery", routeState: "Lagos State", routeLga: "Ikeja", partnerId: "12348", status: "Pending"},
                    {id:5, name: "Express Logistics", routeState: "Abuja", routeLga: "Garki", partnerId: "12349", status: "Active"},
                ];
                setPartners(mockPartners);
            }
        } catch (err) {
            setError('Failed to fetch logistics data');
            console.error('Error fetching logistics data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-[#022B23]">Loading logistics data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return(
        <>
            <div className="text-[#022B23] text-[14px] px-[20px] font-medium gap-[8px] flex items-center h-[49px] w-full border-b-[0.5px] border-[#ededed]">
                <p>Logistics management</p>
            </div>
            <div className="p-[20px]">
                <div className="flex w-full  gap-[20px] h-[110px] justify-between">
                    <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                        <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#F7F7F7]">
                            <p className="text-[#707070] text-[12px]">Total partners admins</p>
                        </div>
                        <div className="h-[80px] flex justify-center flex-col p-[14px]">
                            <p className="text-[20px] text-[#022B23] font-medium">{stats.totalPartners}</p>
                            <div className="flex items-center">
                                <Image src={arrowUp} width={12} height={12} alt={'image'} className="h-[12px] w-[12px]" />
                                <p className="text-[10px] text-[#707070]"><span className="text-[#52A43E]">+1.41</span> from yesterday</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                        <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#F7F7F7]">
                            <p className="text-[#707070] text-[12px]">Active partners</p>
                        </div>
                        <div className="h-[80px] flex justify-center flex-col p-[14px]">
                            <p className="text-[20px] text-[#022B23] font-medium">{stats.activePartners}</p>
                            <div className="flex items-center">
                                <Image src={arrowUp} width={12} height={12} alt={'image'} className="h-[12px] w-[12px]" />
                                <p className="text-[10px] text-[#707070]"><span className="text-[#52A43E]">+1.41</span> from yesterday</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#FF2121] border-[0.5px] ">
                        <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#FFE8E8]">
                            <p className="text-[#707070] text-[12px]">Inactive partners</p>
                        </div>
                        <div className="h-[80px] flex justify-center flex-col p-[14px]">
                            <p className="text-[20px] text-[#022B23] font-medium">{stats.inactivePartners}</p>
                            <div className="flex items-center">
                                <Image src={arrowUp} width={12} height={12} alt={'image'} className="h-[12px] w-[12px]" />
                                <p className="text-[10px] text-[#707070]"><span className="text-[#52A43E]">+1.41</span> from yesterday</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                        <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#FFB320]">
                            <p className="text-[#000000] font-medium text-[12px]">Partners pending approval</p>
                        </div>
                        <div className="h-[80px] flex justify-center flex-col p-[14px]">
                            <p className="text-[20px] text-[#022B23] font-medium">{stats.pendingPartners}</p>
                            <div className="flex items-center">
                                <Image src={arrowUp} width={12} height={12} alt={'image'} className="h-[12px] w-[12px]" />
                                <p className="text-[10px] text-[#707070]"><span className="text-[#52A43E]">+1.41</span> from yesterday</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-[30px] flex cursor-pointer">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-[24px] py-[12px] cursor-pointer bg-[#022B23] text-white rounded-[8px] font-medium hover:bg-[#033228] transition-colors flex items-center gap-[8px]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Logistics Partner Admin
                    </button>
                </div>

                <div className="mt-[50px]">
                    <div className="w-full flex flex-col h-auto border-[#EAECF0] border rounded-[24px]">
                        <div className="w-full h-[91px] flex items-center justify-between px-[24px] pt-[20px] pb-[19px]">
                            <div className="flex flex-col gap-[4px]">
                                <div className="h-[28px] flex items-center">
                                    <p className="text-[18px] font-medium text-[#101828]">Logistics company</p>
                                </div>
                                <div className="flex h-[20px] items-center">
                                    <p className="text-[14px] text-[#667085]">View and manage Logistics company</p>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center bg-[#FFFFFF] border-[0.5px] border-[#F2F2F2] text-black px-4 py-2 shadow-sm rounded-sm">
                                <Image src={searchImg} alt="Search Icon" width={20} height={20} className="h-[20px] w-[20px]" />
                                <input placeholder="Search" className="w-[175px] text-[#707070] text-[14px] focus:outline-none" />
                            </div>
                        </div>

                        <div className="w-full h-[44px] flex bg-[#F9FAFB] border-b-[0.5px] border-[#EAECF0]">
                            <div className="h-full w-[40%] gap-[4px] flex px-[24px] items-center font-medium text-[#667085] text-[12px]">
                                <p>Logistic company</p>
                                <Image src={arrowDown} alt={'image'} />
                            </div>
                            <div className="h-full w-[27%] gap-[4px] flex px-[24px] items-center font-medium text-[#667085] text-[12px]">
                                <p>Number of trucks</p>
                            </div>
                            <div className="flex w-[15%] items-center px-[24px] font-medium text-[#667085] text-[12px]">
                                Number of bikes
                            </div>
                            <div className="flex w-[15%] items-center px-[24px] font-medium text-[#667085] text-[12px]">
                                Status
                            </div>
                            <div className="w-[3%]"></div>
                        </div>

                        <div className="flex flex-col">
                            {partners.map((partner, index) => (
                                <PartnerTableRow
                                    key={partner.id}
                                    partner={partner}
                                    isLast={index === partners.length - 1}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <LogisticsPartnerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                onError={handleModalError}
            />

            {showToast && (
                <Toast
                    type={toastType}
                    message={toastMessage}
                    subMessage={toastSubMessage}
                    onClose={() => setShowToast(false)}
                />
            )}
        </>
    )
}

export default Logistics