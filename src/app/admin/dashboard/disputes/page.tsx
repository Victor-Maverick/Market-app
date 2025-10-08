'use client'
import {useCallback, useEffect, useRef, useState} from "react";
import Image from "next/image";
import arrowDown from "../../../../../public/assets/images/arrow-down.svg";
import badProduct from "../../../../../public/assets/images/brokenPhone.svg";
import iPhone from "../../../../../public/assets/images/blue14.png";
import searchImg from "../../../../../public/assets/images/search-normal.png";
import { disputeService, DisputeResponse } from "@/services/disputeService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StatsCardSkeleton, DisputesTableSkeleton } from "@/components/LoadingSkeletons";

// Utility function to truncate text with ellipses
const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const DisputeDetailsModal = ({
    dispute,
    onClose,
    onDisputeUpdated,
}: {
    dispute: DisputeResponse;
    onClose: () => void;
    onDisputeUpdated?: () => void;
}) => {
    const [processing, setProcessing] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleProcessDispute = async () => {
        const confirmed = window.confirm('Are you sure you want to process this dispute?');
        if (!confirmed) return;

        try {
            setProcessing(true);
            await disputeService.processDispute(dispute.id);
            toast.success('Dispute processed successfully!');
            if (onDisputeUpdated) {
                onDisputeUpdated();
            }
            onClose();
        } catch (error) {
            console.error('Error processing dispute:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to process dispute';
            toast.error(errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectDispute = async () => {
        const confirmed = window.confirm('Are you sure you want to reject this dispute? This action cannot be undone.');
        if (!confirmed) return;

        try {
            setProcessing(true);
            console.log('Rejecting dispute:', dispute.id);
            await disputeService.rejectDispute(dispute.id);
            toast.success('Dispute rejected successfully!');
            if (onDisputeUpdated) {
                onDisputeUpdated();
            }
            onClose();
        } catch (error) {
            console.error('Error rejecting dispute:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to reject dispute';
            toast.error(errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    const handleResolveDispute = async () => {
        const confirmed = window.confirm('Are you sure you want to resolve this dispute?');
        if (!confirmed) return;

        try {
            setProcessing(true);
            await disputeService.resolveDispute(dispute.id);
            toast.success('Dispute resolved successfully!');
            if (onDisputeUpdated) {
                onDisputeUpdated();
            }
            onClose();
        } catch (error) {
            console.error('Error resolving dispute:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to resolve dispute';
            toast.error(errorMessage);
        } finally {
            setProcessing(false);
        }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div
                className="absolute inset-0" onClick={onClose} />

            <div
                className="relative z-10 bg-white w-[1100px]  mx-4 px-[60px] py-[40px] shadow-lg">
                <div className="flex justify-between border-b-[0.5px] border-[#ededed] pb-[14px] items-start ">
                    <div className="flex flex-col">
                        <p className="text-[16px] text-[#022B23] font-medium">Dispute request</p>
                        <p className="text-[14px] text-[#707070] font-medium">View and process dispues on products with customers</p>
                    </div>
                    <div
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${dispute.status.toLowerCase() === "resolved"
                            ? "bg-[#ECFDF3] text-[#027A48]"
                            : dispute.status.toLowerCase() === "pending" || dispute.status.toLowerCase() === "processing"
                                ? "bg-[#FFFAEB] text-[#F99007]"
                                : dispute.status.toLowerCase() === "rejected"
                                    ? "bg-[#FEF3F2] text-[#FF5050]"
                                    : "bg-[#EDEDED] text-[#707070]"
                            }`}
                    >
                        {dispute.status}
                    </div>

                </div>

                <div className="w-full flex ">
                    <div className="w-[50%] pt-[24px]  pr-[32px] border-r-[0.5px] border-[#ededed] pb-[2px] gap-[30px] flex flex-col">
                        <div className="flex flex-col gap-[14px]">
                            <p className="text-[#022B23] text-[16px] font-semibold">#{dispute.orderNumber}</p>
                            <div>
                                <p className="text-[#707070] font-medium text-[14px] leading-tight">Request date: <span className="text-[#000000]">{formatDate(dispute.requestTime)}</span></p>
                                <p className="text-[#707070] font-medium text-[14px] leading-tight">From: <span className="text-[#000000]">{dispute.orderItem.buyerName}</span></p>
                            </div>
                        </div>
                        <div className="w-[100%] flex items-center justify-between h-[72px] border-[1px] border-[#ededed] rounded-[14px]">
                            <div className="flex items-center h-full gap-[10px]">
                                <div className="h-full bg-[#f9f9f9] rounded-bl-[14px] rounded-tl-[14px] w-[70px] border-l-[0.5px] border-[#ededed]">
                                    <Image
                                        src={dispute.orderItem.productImage || iPhone}
                                        alt={dispute.orderItem.productName}
                                        width={70}
                                        height={72}
                                        className="h-full w-[70px] rounded-bl-[14px] rounded-tl-[14px] object-cover"
                                    />
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <p className="text-[#101828] text-[14px] font-medium">
                                        {dispute.orderItem.productName}
                                    </p>
                                    <p className="text-[#667085] text-[14px]">
                                        ID: #{dispute.orderItem.productId}
                                    </p>
                                </div>
                            </div>
                            <p className="text-[#667085] text-[14px] mr-[10px]">Quantity: {dispute.orderItem.quantity}</p>
                        </div>
                        <div className="h-[230px] p-[20px] rounded-[24px] bg-[#FFFBF6] w-[100%] border-[#FF9500] flex flex-col gap-[12px] border">
                            <div className="flex flex-col leading-tight">
                                <p className="text-[#101828] text-[14px] font-medium">Reason for dispute</p>
                                <p className="text-[#525252] text-[14px]">{dispute.reason}</p>
                            </div>
                            <div className="bg-[#EFEFEF] w-[100%] flex justify-center rounded-[24px] h-[150px]">
                                <Image
                                    src={dispute.imageUrl || badProduct}
                                    alt="Dispute evidence"
                                    width={400}
                                    height={150}
                                    className="rounded-[24px] w-[100%] h-[150px] object-cover"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-[50%] flex justify-between flex-col gap-[20px] pl-[15px] pt-[20px] pb-[5px]">
                        <p className="text-[#022B23] font-semibold text-[16px]">Product details</p>
                        <div className="flex flex-col gap-[8px] pb-[25px] border-b-[0.5px] border-[#ededed]">
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Order date</p>
                                <p className="text-[#000000] text-[14px] font-medium">{formatDate(dispute.orderTime)}</p>
                            </div>
                            <div className="flex justify-between ">
                                <p className="text-[#707070] text-[14px] font-medium">Order time</p>
                                <p className="text-[#000000] text-[14px] font-medium">{formatTime(dispute.orderTime)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Order amount</p>
                                <p className="text-[#000000] text-[14px] font-medium">NGN {dispute.orderItem.totalPrice.toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Delivery method</p>
                                <p className="text-[#000000] text-[14px] font-medium">{dispute.deliveryMethod}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[8px] pb-[25px] border-b-[0.5px] border-[#ededed]">
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Customer name</p>
                                <p className="text-[#000000] text-[14px] font-medium">{dispute.orderItem.buyerName}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Vendor name</p>
                                <p className="text-[#000000] text-[14px] font-medium">{dispute.orderItem.vendorName}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Unit price</p>
                                <p className="text-[#000000] text-[14px] font-medium">NGN {dispute.orderItem.unitPrice.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="w-[400px] h-[48px] flex gap-[4px]">
                                {dispute.status.toLowerCase() === 'pending' && (
                                    <>
                                        <button
                                            onClick={handleProcessDispute}
                                            disabled={processing}
                                            className={`flex text-[16px] font-semibold items-center justify-center w-[120px] h-full border-[0.5px] rounded-[12px] ${processing
                                                ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                                                : 'text-[#027A48] border-[#027A48] hover:bg-[#027A48] hover:text-white'
                                                }`}
                                        >
                                            {processing ? 'Processing...' : 'Process'}
                                        </button>
                                        <button
                                            onClick={handleRejectDispute}
                                            disabled={processing}
                                            className={`flex text-[16px] font-semibold items-center justify-center w-[120px] h-full border-[0.5px] rounded-[12px] ${processing
                                                ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                                                : 'text-[#FF5050] border-[#FF5050] hover:bg-[#FF5050] hover:text-white'
                                                }`}
                                        >
                                            {processing ? 'Processing...' : 'Reject'}
                                        </button>
                                    </>
                                )}
                                {dispute.status.toLowerCase() === 'processing' && (
                                    <button
                                        onClick={handleResolveDispute}
                                        disabled={processing}
                                        className={`flex text-[16px] font-semibold items-center justify-center w-[120px] h-full border-[0.5px] rounded-[12px] ${processing
                                            ? 'text-gray-400 border-gray-300 cursor-not-allowed'
                                            : 'text-[#027A48] border-[#027A48] hover:bg-[#027A48] hover:text-white'
                                            }`}
                                    >
                                        {processing ? 'Resolving...' : 'Resolve'}
                                    </button>
                                )}
                                {(dispute.status.toLowerCase() === 'resolved' || dispute.status.toLowerCase() === 'rejected') && (
                                    <div className="flex text-[#707070] text-[16px] font-semibold items-center justify-center w-[120px] h-full border-[0.5px] border-[#707070] rounded-[12px]">
                                        {dispute.status}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DisputeActionsDropdown = ({ onViewDispute }: { onViewDispute: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
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
        <div className="relative w-full h-full" ref={dropdownRef}>
            <div
                onClick={handleToggle}
                className="cursor-pointer w-full h-full flex items-center justify-center"
            >
                <div className="flex flex-col gap-[3px] items-center justify-center p-2 -m-2">
                    <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                </div>
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg z-50 border border-[#ededed] w-[125px]">
                    <ul className="py-1">
                        <li
                            className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDispute();
                                setIsOpen(false);
                            }}
                        >
                            View dispute
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const DisputeTableRow = ({ dispute, isLast, onViewDispute }: { dispute: DisputeResponse; isLast: boolean; onViewDispute: () => void }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}>
            <div className="flex items-center w-[10%] pl-[24px]">
                <p className="text-[#101828] text-[14px] font-medium">#{dispute.id}</p>
            </div>

            <div className="flex items-center pl-[15px] w-[12%] ">
                <p className="text-[#101828] text-[14px] font-medium" title={dispute.reason}>
                    {truncateText(dispute.reason, 20)}
                </p>
            </div>

            <div className="flex flex-col justify-center w-[17%] px-[15px]">
                <p className="text-[#101828] text-[14px] font-medium" title={dispute.orderItem.buyerName}>
                    {truncateText(dispute.orderItem.buyerName, 20)}
                </p>
                <p className="text-[#667085] text-[14px]">Buyer</p>
            </div>

            <div className="flex items-center w-[15%] pl-[24px]">
                <p className="text-[#101828] text-[14px]" title={dispute.orderItem.productName}>
                    {truncateText(dispute.orderItem.productName, 20)}
                </p>
            </div>

            <div className="flex items-center w-[15%] pl-[24px]">
                <p className="text-[#101828] text-[14px]">N {dispute.orderItem.totalPrice.toLocaleString()}</p>
            </div>

            <div className="flex flex-col justify-center w-[15%] pl-[15px]">
                <p className="text-[#101828] text-[14px] font-medium">{formatDate(dispute.requestTime)}</p>
                <p className="text-[#667085] text-[14px]">{formatTime(dispute.requestTime)}</p>
            </div>

            <div className="flex items-center w-[15%] px-[10px]">
                <div className={`w-[70px] h-[22px] rounded-[8px] flex items-center justify-center ${dispute.status.toLowerCase() === 'resolved'
                    ? 'bg-[#ECFDF3] text-[#027A48]'
                    : dispute.status.toLowerCase() === 'pending' || dispute.status.toLowerCase() === 'processing'
                        ? 'bg-[#FFFAEB] text-[#F99007]'
                        : dispute.status.toLowerCase() === 'rejected'
                            ? 'bg-[#FEF3F2] text-[#FF5050]'
                            : 'bg-[#EDEDED] text-[#707070]'
                    }`}>
                    <p className="text-[12px] font-medium">{dispute.status}</p>
                </div>
            </div>

            <div className="flex items-center justify-center w-[3%]">
                <DisputeActionsDropdown onViewDispute={onViewDispute} />
            </div>
        </div>
    );
};




const Disputes = () => {
    const [selectedDispute, setSelectedDispute] = useState<DisputeResponse | null>(null);
    const [disputes, setDisputes] = useState<DisputeResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');


    // Statistics
    const [stats, setStats] = useState({
        totalClaimAmount: 0,
        totalDisputes: 0,
        resolvedDisputes: 0,
        rejectedDisputes: 0
    });

    const fetchDisputes = useCallback(async () => {
        try {
            setLoading(true);
            const disputesData = await disputeService.getAllDisputes();

            setDisputes(disputesData);
            console.log("Disputes loaded:", disputesData.length);

            // Calculate statistics
            const totalClaimAmount = disputesData.reduce((sum, dispute) => sum + Number(dispute.orderItem.totalPrice), 0);
            const resolvedDisputes = disputesData.filter(d => d.status.toLowerCase() === 'resolved').length;
            const rejectedDisputes = disputesData.filter(d => d.status.toLowerCase() === 'rejected').length;

            setStats({
                totalClaimAmount,
                totalDisputes: disputesData.length,
                resolvedDisputes,
                rejectedDisputes
            });
        } catch (error) {
            console.error('Error fetching disputes:', error);
            toast.error('Failed to fetch disputes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDisputes();
    }, [fetchDisputes]);

    const handleViewDispute = (dispute: DisputeResponse) => {
        setSelectedDispute(dispute);
    };

    const closeModal = () => {
        setSelectedDispute(null);
    };

    const handleDisputeUpdated = () => {
        fetchDisputes();
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Filter disputes based on search term
    const filteredDisputes = disputes.filter(dispute =>
        dispute.orderItem.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispute.orderItem.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispute.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispute.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="w-full flex border-b-[0.5px] border-[#ededed] text-[#022B23] text-[14px] font-medium h-[49px] px-[20px] items-center">
                <p>Disputes support</p>
            </div>
            <div className="w-full flex border-b-[0.5px] border-[#ededed] text-[#1e1e1e] text-[14px] font-medium h-[49px] px-[20px] items-center">
                <p>View and help resolve dispute claims</p>
            </div>
            <div className="p-[20px]">
                <div className="flex w-full gap-[20px]  h-[86px] justify-between">
                    <div className="flex flex-col w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                        <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#000000]">
                            <p className="text-[#ffffff] text-[12px]">Total claim amount</p>
                        </div>
                        <div className="h-[52px] flex justify-center flex-col p-[14px]">
                            {loading ? (
                                <StatsCardSkeleton width="w-32" />
                            ) : (
                                <p className="text-[20px] text-[#022B23] font-medium">N{stats.totalClaimAmount.toLocaleString()}.00</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                        <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#000000]">
                            <p className="text-white text-[12px]">Disputes recorded</p>
                        </div>
                        <div className="h-[52px] flex justify-center flex-col p-[14px]">
                            {loading ? (
                                <StatsCardSkeleton width="w-16" />
                            ) : (
                                <p className="text-[20px] text-[#022B23] font-medium">{stats.totalDisputes}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col w-[25%] rounded-[14px] h-full border-[#022B23] border-[0.5px]">
                        <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#ECFDF6]">
                            <p className="text-[#022B23] text-[12px]">Resolved</p>
                        </div>
                        <div className="h-[52px] w-[239px] flex justify-center flex-col p-[14px]">
                            {loading ? (
                                <StatsCardSkeleton width="w-16" />
                            ) : (
                                <p className="text-[20px] text-[#022B23] font-medium">{stats.resolvedDisputes}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col w-[25%] rounded-[14px] h-full border-[#FF5050] border-[0.5px]">
                        <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#FFDEDE]">
                            <p className="text-[#FF5050] text-[12px]">Rejected</p>
                        </div>
                        <div className="h-[52px] flex justify-center flex-col p-[14px]">
                            {loading ? (
                                <StatsCardSkeleton width="w-16" />
                            ) : (
                                <p className="text-[20px] text-[#022B23] font-medium">{stats.rejectedDisputes}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col mt-[50px] gap-[50px]">
                    <div className="flex flex-col rounded-[24px] border-[1px] border-[#EAECF0]">
                        <div className="w-full h-[91px] flex items-center justify-between px-[24px] pt-[20px] pb-[19px]">
                            <div className="flex flex-col gap-[4px]">
                                <div className="h-[28px] flex items-center">
                                    <p className="text-[18px] font-medium text-[#101828]">Disputes ({filteredDisputes.length})</p>
                                </div>
                                <div className="flex h-[20px] items-center">
                                    <p className="text-[14px] text-[#667085]">View all disputes here</p>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center bg-[#FFFFFF] border-[0.5px] border-[#F2F2F2] text-black px-4 py-2 shadow-sm rounded-sm">
                                <Image src={searchImg} alt="Search Icon" width={20} height={20} className="h-[20px] w-[20px]" />
                                <input
                                    placeholder="Search disputes..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-[175px] text-[#707070] text-[14px] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="w-full h-[44px] flex bg-[#F9FAFB] border-b-[0.5px] border-[#EAECF0]">
                            <div className="h-full w-[10%] flex justify-center items-center font-medium text-[#667085] text-[12px]">
                                <p>Dispute ID</p>
                            </div>
                            <div className="h-full w-[12%] gap-[4px] flex justify-center items-center font-medium text-[#667085] text-[12px]">
                                <p>Dispute type</p>
                                <Image src={arrowDown} alt={'image'} />
                            </div>
                            <div className="h-full w-[17%] gap-[4px] flex px-[24px] items-center font-medium text-[#667085] text-[12px]">
                                <p>User</p>
                                <Image src={arrowDown} alt={'image'} />
                            </div>

                            <div className="h-full w-[15%] gap-[4px] flex justify-center items-center font-medium text-[#667085] text-[12px]">
                                <p>Product</p>
                                <Image src={arrowDown} alt={'image'} />
                            </div>

                            <div className="h-full w-[15%] gap-[4px] flex px-[20px] items-center font-medium text-[#667085] text-[12px]">
                                <p>Amount (NGN)</p>
                                <Image src={arrowDown} alt={'image'} />
                            </div>

                            <div className="h-full w-[15%] gap-[4px] flex px-[20px] items-center font-medium text-[#667085] text-[12px]">
                                <p>Date and Time</p>
                                <Image src={arrowDown} alt={'image'} />
                            </div>
                            <div className="flex w-[15%] items-center px-[24px] font-medium text-[#667085] text-[12px]">
                                Status
                            </div>
                            <div className="w-[3%]"></div>
                        </div>

                        <div className="flex flex-col">
                            {loading ? (
                                <DisputesTableSkeleton />
                            ) : filteredDisputes.length > 0 ? (
                                filteredDisputes.map((dispute, index) => (
                                    <DisputeTableRow
                                        key={dispute.id}
                                        dispute={dispute}
                                        isLast={index === filteredDisputes.length - 1}
                                        onViewDispute={() => handleViewDispute(dispute)}
                                    />
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <p>No disputes found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {selectedDispute && (
                <DisputeDetailsModal
                    dispute={selectedDispute}
                    onClose={closeModal}
                    onDisputeUpdated={handleDisputeUpdated}
                />
            )}

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </>
    );
}

export default Disputes;