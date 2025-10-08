'use client'
import MarketPlaceHeader from "@/components/marketPlaceHeader";
import Image from "next/image";
import arrowRight from "../../../../public/assets/images/greyforwardarrow.svg";
import React, {useCallback, useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Toaster, toast } from 'react-hot-toast';
import { SkeletonLoader } from '@/components/LoadingSkeletons';

interface OrderItemDto {
    id: number;
    productId: number;
    productName: string;
    description: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    vendorName: string;
    buyerName: string;
}

interface DisputeResponse {
    id: number;
    requestTime: string;
    status: string;
    resolvedDate: string;
    orderNumber: string;
    imageUrl: string;
    reason: string;
    orderTime: string;
    deliveryMethod: string;
    orderItem: OrderItemDto;
}

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'bg-[#FEF3C7] text-[#D97706] border border-[#D97706]'; // Yellow/Orange for pending
        case 'PROCESSING':
            return 'bg-[#DBEAFE] text-[#1D4ED8] border border-[#1D4ED8]'; // Blue for processing
        case 'PENDING_RESOLUTION':
            return 'bg-[#FED7AA] text-[#EA580C] border border-[#EA580C]'; // Orange for pending resolution
        case 'RESOLVED':
            return 'bg-[#D1FAE5] text-[#059669] border border-[#059669]'; // Green for resolved
        case 'REJECTED':
            return 'bg-[#FEE2E2] text-[#DC2626] border border-[#DC2626]'; // Red for rejected
        case 'RETURN_INITIATED':
            return 'bg-[#E0E7FF] text-[#3730A3] border border-[#3730A3]'; // Indigo for return initiated
        case 'RETURN_DISPUTED':
            return 'bg-[#FECACA] text-[#B91C1C] border border-[#B91C1C]'; // Dark red for return disputed
        default:
            return 'bg-[#F3F4F6] text-[#6B7280] border border-[#6B7280]'; // Gray for unknown
    }
};

const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
};

const DisputeDetailsModal = ({
                                 dispute,
                                 onClose,
                                 onAcceptResolution,
                                 onReturnItem
                             }: {
    dispute: DisputeResponse;
    onClose: () => void;
    onAcceptResolution: () => void;
    onReturnItem?: () => void;
}) => {
    const requestDate = new Date(dispute.requestTime);
    const formattedRequestDate = requestDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const orderDate = new Date(dispute.orderTime);
    const formattedOrderDate = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedOrderTime = orderDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative z-10 bg-white w-[1100px] mx-4 px-[60px] py-[40px] shadow-lg">
                <div className="flex justify-between border-b-[0.5px] border-[#ededed] pb-[14px] items-start ">
                    <div className="flex flex-col">
                        <p className="text-[16px] text-[#022B23] font-medium">Dispute request</p>
                        <p className="text-[14px] text-[#707070] font-medium">View and process disputes on products with customers</p>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusStyle(dispute.status)}`}>
                        {formatStatus(dispute.status)}
                    </div>
                </div>

                <div className="w-full flex">
                    <div className="w-[50%] pt-[24px] pr-[32px] border-r-[0.5px] border-[#ededed] pb-[2px] gap-[30px] flex flex-col">
                        <div className="flex flex-col gap-[14px]">
                            <p className="text-[#022B23] text-[16px] font-semibold">{dispute.orderNumber}</p>
                            <div>
                                <p className="text-[#707070] font-medium text-[14px] leading-tight">Request date: <span className="text-[#000000]">{formattedRequestDate}</span></p>
                                <p className="text-[#707070] font-medium text-[14px] leading-tight">From: <span className="text-[#000000]">{dispute.orderItem.buyerName}</span></p>
                            </div>
                        </div>
                        <div className="w-[100%] flex items-center justify-between h-[72px] border-[1px] border-[#ededed] rounded-[14px]">
                            <div className="flex items-center h-full gap-[10px]">
                                <div className="h-full bg-[#f9f9f9] rounded-bl-[14px] rounded-tl-[14px] w-[70px] border-l-[0.5px] border-[#ededed]">
                                    <Image
                                        src={dispute.orderItem.productImage}
                                        alt={'product image'}
                                        width={70}
                                        height={70}
                                        className="h-full w-[70px] rounded-bl-[14px] rounded-tl-[14px]"
                                    />
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <p className="text-[#101828] text-[14px] font-medium">
                                        {dispute.orderItem.productName}
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
                                    src={dispute.imageUrl}
                                    width={150}
                                    height={150}
                                    alt={'dispute image'}
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
                                <p className="text-[#000000] text-[14px] font-medium">{formattedOrderDate}</p>
                            </div>
                            <div className="flex justify-between ">
                                <p className="text-[#707070] text-[14px] font-medium">Order time</p>
                                <p className="text-[#000000] text-[14px] font-medium">{formattedOrderTime}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Order amount</p>
                                <p className="text-[#000000] text-[14px] font-medium">NGN {dispute.orderItem.totalPrice.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[8px] pb-[25px] border-b-[0.5px] border-[#ededed]">
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Vendor name</p>
                                <p className="text-[#000000] text-[14px] font-medium">{dispute.orderItem.vendorName}</p>
                            </div>
                        </div>
                        {dispute.status === 'PENDING' && onReturnItem && (
                            <div className="h-[48px] flex gap-[4px]">
                                <div
                                    className="flex cursor-pointer text-[#022B23] text-[16px] font-semibold items-center justify-center w-full bg-[#ECFDF3] h-full rounded-[12px] hover:bg-[#D1FAE5] transition-colors"
                                    onClick={onReturnItem}
                                >
                                    Initiate Return
                                </div>
                            </div>
                        )}
                        {dispute.status === 'PENDING_RESOLUTION' && (
                            <div className="h-[48px] flex gap-[4px]">
                                <div
                                    className="flex cursor-pointer text-[#461602] text-[16px] font-semibold items-center justify-center w-full bg-[#FFEEBE] h-full rounded-[12px]"
                                    onClick={onAcceptResolution}
                                >
                                    Accept Resolution
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DisputeActionsDropdown = ({
                                    onViewDispute,
                                    disputeStatus,
                                    onAcceptResolution,
                                    onReturnItem,
                                    onAcceptReturnDispute
                                }: {
    onViewDispute: () => void;
    disputeStatus: string;
    onAcceptResolution: () => void;
    onReturnItem?: () => void;
    onAcceptReturnDispute?: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

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
                        {disputeStatus === 'PENDING' && onReturnItem && (
                            <li
                                className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReturnItem();
                                    setIsOpen(false);
                                }}
                            >
                                Initiate Return
                            </li>
                        )}
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
                        {disputeStatus === 'PENDING_RESOLUTION' && (
                            <li
                                className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAcceptResolution();
                                    setIsOpen(false);
                                }}
                            >
                                Mark resolved
                            </li>
                        )}
                        {disputeStatus === 'RETURN_DISPUTED' && onAcceptReturnDispute && (
                            <li
                                className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAcceptReturnDispute();
                                    setIsOpen(false);
                                }}
                            >
                                Accept Return Dispute
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

const DisputeTableRow = ({
                             dispute,
                             isLast,
                             onViewDispute,
                             onAcceptResolution,
                             onReturnItem,
                             onAcceptReturnDispute
                         }: {
    dispute: DisputeResponse;
    isLast: boolean;
    onViewDispute: () => void;
    onAcceptResolution: () => void;
    onReturnItem: () => void;
    onAcceptReturnDispute: () => void;
}) => {


    return (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center ${!isLast ? "border-b border-[#ededed]" : "border-none"} p-3 sm:p-0`}>
            {/* Mobile layout */}
            <div className="flex w-full sm:hidden gap-3 mb-3">
                <div className="w-[80px] h-[80px] rounded-[8px] overflow-hidden flex-shrink-0">
                    {dispute.orderItem.productImage ? (
                        <Image
                            src={dispute.orderItem.productImage}
                            alt={`product`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                            No image
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[12px] sm:text-[14px] text-[#1E1E1E] font-medium mb-1 truncate">
                        {dispute.orderItem.productName}
                    </p>
                    <p className="text-[10px] font-normal text-[#3D3D3D] uppercase mb-2">
                        Order #{dispute.orderNumber}
                    </p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-[#1E1E1E] text-[14px]">
                                ₦{Number(dispute.orderItem.totalPrice || 0).toLocaleString()}
                            </p>
                            <p className="text-[#3D3D3D] text-[10px]">
                                {dispute.orderItem.vendorName || "Unknown"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`flex h-[32px] px-2 items-center text-[12px] font-medium justify-center rounded-[100px] ${getStatusStyle(dispute.status)}`}>
                                <p>{formatStatus(dispute.status)}</p>
                            </div>
                            <DisputeActionsDropdown
                                onViewDispute={onViewDispute}
                                disputeStatus={dispute.status}
                                onAcceptResolution={onAcceptResolution}
                                onReturnItem={onReturnItem}
                                onAcceptReturnDispute={onAcceptReturnDispute}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden sm:flex items-center w-full h-[72px]">
                <div className="flex items-center w-[30%] pr-[24px] gap-3">
                    <div className="bg-[#f9f9f9] h-[60px] w-[70px] overflow-hidden rounded-[8px] flex-shrink-0">
                        {dispute.orderItem.productImage ? (
                            <Image
                                src={dispute.orderItem.productImage}
                                alt={'product image'}
                                width={70}
                                height={60}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
                                No image
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#101828] truncate">{dispute.orderItem.productName}</p>
                        <p className="text-[12px] text-[#667085]">Amount: ₦{Number(dispute.orderItem.totalPrice || 0).toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center w-[25%] px-[24px]">
                    <div className={`px-3 py-1 rounded-[8px] flex items-center justify-center ${getStatusStyle(dispute.status)}`}>
                        <p className="text-[10px] font-medium">{formatStatus(dispute.status)}</p>
                    </div>
                </div>
                
                <div className="flex items-center text-[#344054] text-[14px] w-[15%] px-[24px]">
                    <p className="truncate">{dispute.orderItem.vendorName || "Unknown"}</p>
                </div>
                
                <div className="flex items-center justify-center text-[#101828] text-[14px] w-[25%] px-[24px]">
                    <p className="text-[#101828] text-[12px] truncate">{dispute.reason}</p>
                </div>

                <div className="flex items-center justify-center w-[5%]">
                    <DisputeActionsDropdown
                        onViewDispute={onViewDispute}
                        disputeStatus={dispute.status}
                        onAcceptResolution={onAcceptResolution}
                        onReturnItem={onReturnItem}
                        onAcceptReturnDispute={onAcceptReturnDispute}
                    />
                </div>
            </div>
        </div>
    );
};

const Disputes = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const [disputes, setDisputes] = useState<DisputeResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState<DisputeResponse | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const disputesPerPage = 6;

    const fetchDisputes = useCallback(async () => {
        if (session?.user?.email) {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/get-user?email=${session.user.email}`
                );
                setDisputes(response.data);
            } catch (error) {
                console.error('Error fetching disputes:', error);
                toast.error('Failed to fetch disputes', {
                    position: 'top-center',
                    style: {
                        background: '#FF3333',
                        color: '#fff',
                    },
                });
            } finally {
                setLoading(false);
            }
        }
    }, [session]);

    // Calculate current disputes to display
    const indexOfLastDispute = currentPage * disputesPerPage;
    const indexOfFirstDispute = indexOfLastDispute - disputesPerPage;
    const currentDisputes = disputes.slice(indexOfFirstDispute, indexOfLastDispute);
    const totalPages = Math.ceil(disputes.length / disputesPerPage);

    useEffect(() => {
        fetchDisputes();
    }, [session, fetchDisputes]);


    const handleAcceptResolution = async (disputeId: number) => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/resolve?disputeId=${disputeId}`
            );

            if (response.status === 200) {
                toast.success('Resolution accepted successfully', {
                    position: 'top-center',
                    style: {
                        background: '#4BB543',
                        color: '#fff',
                    },
                });
                // Refresh disputes or update the specific dispute's status
                fetchDisputes();
                setSelectedDispute(null);
            } else {
                throw new Error('Failed to accept resolution');
            }
        } catch (error) {
            console.error('Error accepting resolution:', error);
            toast.error('Failed to accept resolution', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        }
    };

    const handleAcceptReturnDispute = async (disputeId: number) => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/accept-return-dispute?id=${disputeId}`
            );

            if (response.status === 200) {
                toast.success('Return dispute accepted successfully', {
                    position: 'top-center',
                    style: {
                        background: '#4BB543',
                        color: '#fff',
                    },
                });
                // Refresh disputes to update status
                fetchDisputes();
                setSelectedDispute(null);
            } else {
                throw new Error('Failed to accept return dispute');
            }
        } catch (error) {
            console.error('Error accepting return dispute:', error);
            toast.error('Failed to accept return dispute', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        }
    };

    const handleReturnItem = async (dispute: DisputeResponse) => {
        if (!session?.user?.email) {
            toast.error('User session not found', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
            return;
        }

        try {
            const returnRequest = {
                itemId: dispute.orderItem.id,
                buyerEmail: session.user.email,
                disputeId: dispute.id
            };

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/initiate`,
                returnRequest
            );

            if (response.status === 201) {
                toast.success('Return initiated successfully', {
                    position: 'top-center',
                    style: {
                        background: '#4BB543',
                        color: '#fff',
                    },
                });
                // Refresh disputes to update status
                fetchDisputes();
            } else {
                throw new Error('Failed to initiate return');
            }
        } catch (error: any) {
            console.error('Error initiating return:', error);
            const errorMessage = error.response?.data || 'Failed to initiate return';
            toast.error(errorMessage, {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        }
    };

    const handleViewDispute = (dispute: DisputeResponse) => {
        setSelectedDispute(dispute);
    };

    const closeModal = () => {
        setSelectedDispute(null);
    };

    if (loading) {
        return (
            <>
                <MarketPlaceHeader />
                <div className="h-[48px] w-full border-y-[0.5px] border-[#EDEDED]">
                    <div className="h-[48px] px-4 sm:px-6 lg:px-25 gap-[8px] items-center flex">
                        <BackButton variant="default" text="Go back" />
                        <p className="text-[12px] sm:text-[14px] text-[#3F3E3E]">Home // <span className="font-medium text-[#022B23]">Disputes</span></p>
                    </div>
                </div>
                <div className="px-4 sm:px-6 lg:px-25 pt-4 sm:pt-8 lg:pt-[62px] h-auto w-full">
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-[30px]">
                        {/* Sidebar skeleton */}
                        <div className="flex flex-col lg:block">
                            <SkeletonLoader type="card" className="w-full lg:w-[381px] h-[44px] rounded-[10px] mb-2 lg:mb-0" />
                            <SkeletonLoader type="card" className="w-full lg:w-[381px] h-[200px] rounded-[12px] mt-0 lg:mt-[6px]" />
                        </div>
                        
                        {/* Main content skeleton */}
                        <div className="flex flex-col w-full lg:w-[779px] gap-4 lg:gap-[24px]">
                            <SkeletonLoader type="card" className="w-[200px] h-[20px]" />
                            <div className="border-[0.5px] border-[#ededed] rounded-[12px] mb-[50px]">
                                {/* Table header skeleton */}
                                <div className="hidden sm:flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0] px-6">
                                    <SkeletonLoader type="card" className="w-[100px] h-[16px] my-auto" />
                                    <SkeletonLoader type="card" className="w-[80px] h-[16px] my-auto ml-auto" />
                                    <SkeletonLoader type="card" className="w-[80px] h-[16px] my-auto ml-auto" />
                                    <SkeletonLoader type="card" className="w-[100px] h-[16px] my-auto ml-auto" />
                                </div>
                                
                                {/* Table rows skeleton */}
                                {[...Array(3)].map((_, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center border-b border-[#ededed] p-3 sm:p-0">
                                        {/* Mobile layout skeleton */}
                                        <div className="flex w-full sm:hidden gap-3 mb-3">
                                            <SkeletonLoader type="card" className="w-[80px] h-[80px] rounded-[8px]" />
                                            <div className="flex-1 space-y-2">
                                                <SkeletonLoader type="card" className="w-full h-[16px]" />
                                                <SkeletonLoader type="card" className="w-[120px] h-[12px]" />
                                                <div className="flex justify-between items-center">
                                                    <div className="space-y-1">
                                                        <SkeletonLoader type="card" className="w-[80px] h-[14px]" />
                                                        <SkeletonLoader type="card" className="w-[100px] h-[10px]" />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <SkeletonLoader type="card" className="w-[60px] h-[32px] rounded-full" />
                                                        <SkeletonLoader type="card" className="w-[20px] h-[20px] rounded" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Desktop layout skeleton */}
                                        <div className="hidden sm:flex items-center w-full h-[72px]">
                                            <div className="flex items-center w-[30%] pr-[24px] gap-3">
                                                <SkeletonLoader type="card" className="w-[70px] h-[60px] rounded-[8px]" />
                                                <div className="flex-1 space-y-2">
                                                    <SkeletonLoader type="card" className="w-full h-[14px]" />
                                                    <SkeletonLoader type="card" className="w-[80px] h-[12px]" />
                                                </div>
                                            </div>
                                            <div className="w-[25%] px-[24px]">
                                                <SkeletonLoader type="card" className="w-[80px] h-[24px] rounded-[8px]" />
                                            </div>
                                            <div className="w-[15%] px-[24px]">
                                                <SkeletonLoader type="card" className="w-[60px] h-[14px]" />
                                            </div>
                                            <div className="w-[25%] px-[24px]">
                                                <SkeletonLoader type="card" className="w-full h-[12px]" />
                                            </div>
                                            <div className="w-[5%]">
                                                <SkeletonLoader type="card" className="w-[20px] h-[20px] rounded" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <MarketPlaceHeader />
            <div className="h-[48px] w-full border-y-[0.5px] border-[#EDEDED]">
                <div className="h-[48px] px-4 sm:px-6 lg:px-25 gap-[8px] items-center flex">
                    <BackButton variant="default" text="Go back" />
                    <p className="text-[12px] sm:text-[14px] text-[#3F3E3E]">Home // <span className="font-medium text-[#022B23]">Disputes</span></p>
                </div>
            </div>
            <div className="px-4 sm:px-6 lg:px-25 pt-4 sm:pt-8 lg:pt-[62px] h-auto w-full">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-[30px]">
                    {/* Sidebar - Hidden on mobile, shown as horizontal tabs on tablet */}
                    <div className="flex flex-col lg:block">
                        <div onClick={() => {router.push("/buyer/profile")}} className="w-full lg:w-[200px] text-[#022B23] text-[12px] font-medium h-[44px] bg-[#f8f8f8] rounded-[10px] flex items-center px-[8px] justify-between mb-2 lg:mb-0 cursor-pointer hover:bg-gray-100">
                            <p>Go to profile</p>
                            <Image src={arrowRight} alt={'image'}/>
                        </div>
                        <div className="flex flex-row lg:flex-col h-auto lg:h-[160px] w-full lg:w-[200px] mt-0 lg:mt-[6px] rounded-[12px] border border-[#eeeeee] overflow-hidden">
                            <div onClick={() => {router.push("/buyer/wishlist")}} className="flex-1 lg:w-full text-[#022B23] text-[12px] h-[40px] lg:rounded-t-[12px] flex items-center justify-center lg:justify-start px-[8px] cursor-pointer hover:bg-gray-50">
                                <p>Wishlist</p>
                            </div>
                            <div onClick={() => {router.push("/buyer/orders")}} className="flex-1 lg:w-full text-[#022B23] text-[12px] h-[40px] flex items-center justify-center lg:justify-start px-[8px] cursor-pointer hover:bg-gray-50">
                                <p>My orders</p>
                            </div>
                            <div onClick={() => {router.push("/buyer/disputes")}} className="flex-1 lg:w-full text-[#022B23] text-[12px] h-[40px] font-medium bg-[#f8f8f8] flex items-center justify-center lg:justify-start px-[8px] cursor-pointer">
                                <p>Order disputes</p>
                            </div>

                            <div onClick={() => {router.push("/buyer/payouts")}} className="flex-1 lg:w-full text-[#022B23] text-[12px] h-[40px] lg:rounded-b-[12px] flex items-center justify-center lg:justify-start px-[8px] cursor-pointer hover:bg-gray-50">
                                <p>Payouts</p>
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex flex-col w-full lg:w-[779px] gap-4 lg:gap-[24px]">
                        <p className="text-[#000000] text-[14px] sm:text-[16px] font-medium">My disputes ({disputes.length})</p>
                        <div className="border-[0.5px] border-[#ededed] rounded-[12px] mb-[50px]">
                            {currentDisputes.length === 0 ? (
                                <div className="flex items-center justify-center h-[100px] sm:h-[151px] text-[#3D3D3D] text-[14px]">
                                    <p>No disputes yet</p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop table header */}
                                    <div className="hidden sm:flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                                        <div className="flex items-center px-[24px] w-[30%] py-[12px] gap-[4px]">
                                            <p className="text-[#667085] font-medium text-[12px]">Products</p>
                                        </div>
                                        <div className="flex justify-center items-center px-[24px] w-[25%] py-[12px]">
                                            <p className="text-[#667085] font-medium text-[12px]">Status</p>
                                        </div>
                                        <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                                            <p className="text-[#667085] font-medium text-[12px]">Vendor</p>
                                        </div>
                                        <div className="flex items-center justify-center px-[15px] w-[25%] py-[12px]">
                                            <p className="text-[#667085] font-medium text-[12px]">Reason</p>
                                        </div>
                                        <div className="w-[5%]"></div>
                                    </div>

                                    <div className="flex flex-col">
                                        {currentDisputes.map((dispute, index) => (
                                            <DisputeTableRow
                                                key={dispute.id}
                                                dispute={dispute}
                                                isLast={index === currentDisputes.length - 1}
                                                onViewDispute={() => handleViewDispute(dispute)}
                                                onAcceptResolution={() => handleAcceptResolution(dispute.id)}
                                                onReturnItem={() => handleReturnItem(dispute)}
                                                onAcceptReturnDispute={() => handleAcceptReturnDispute(dispute.id)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination controls */}
            {disputes.length > disputesPerPage && (
                <div className="flex justify-center mb-4 px-4">
                    <div className="flex items-center gap-4 sm:gap-8 lg:gap-[70px] justify-between w-full max-w-md">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-2 sm:px-3 py-1 rounded-md text-sm ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#022B23] text-white hover:bg-[#033a30]'}`}
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1 sm:gap-[5px] overflow-x-auto">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-2 sm:px-3 py-1 rounded-md text-sm flex-shrink-0 ${currentPage === page ? 'bg-[#022B23] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-2 sm:px-3 py-1 rounded-md text-sm ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#022B23] text-white hover:bg-[#033a30]'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {selectedDispute && (
                <DisputeDetailsModal
                    dispute={selectedDispute}
                    onClose={closeModal}
                    onAcceptResolution={() => handleAcceptResolution(selectedDispute.id)}
                    onReturnItem={() => handleReturnItem(selectedDispute)}
                />
            )}


            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    error: {
                        style: {
                            background: '#FF3333',
                        },
                        duration: 4000,
                    },
                }}
            />
        </>
    );
};

export default Disputes;