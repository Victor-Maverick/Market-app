'use client'
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardHeader from "@/components/dashboardHeader";
import DashboardOptions from "@/components/dashboardOptions";
import Image from "next/image";
import { Toaster, toast } from 'react-hot-toast';
import arrowDown from "../../../public/assets/images/arrow-down.svg";
import FilterDropdown from "@/components/filterDropdown";
import { useSession } from "next-auth/react";
import axios from "axios";
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

interface OrderResponse {
    id: number;
    orderNumber: string;
    buyerEmail: string;
    status: OrderStatus;
    deliveryInfo: DeliveryInfo;
    totalAmount: number;
    deliveryFee: number;
    grandTotal: number;
    createdAt: string;
    items: OrderItemDto[];
    isParentOrder: boolean;
    shopId: number;
    shopOrdersCount: number;
}

interface DeliveryInfo {
    method: string;
    address: string;
}

enum OrderStatus {
    PAID = 'PAID',
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    PENDING_DELIVERY = 'PENDING_DELIVERY',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    DECLINED = 'DECLINED',
    CANCELLED = 'CANCELLED'
}

interface ProductActionsDropdownProps {
    children: React.ReactNode;
    orderId: number;
    orderNumber: string;
    orderStatus: OrderStatus;
    items: OrderItemDto[];
    onProcessOrder: (orderId: number) => Promise<void>;
    onDeclineOrder: (orderId: number) => Promise<void>;
    onShipOrder: (orderId: number) => Promise<void>;
    onViewOrder: () => void;
}

const ProductActionsDropdown = ({
    children,
    orderId,
    orderStatus,
    items,
    onProcessOrder,
    onDeclineOrder,
    onShipOrder,
    onViewOrder
}: ProductActionsDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleActionClick = async (
        e: React.MouseEvent,
        action: 'process' | 'decline' | 'ship' | 'view'
    ) => {
        e.stopPropagation();
        try {
            if (!items || items.length === 0) {
                throw new Error('No items found in this order');
            }

            if (action === 'view') {
                onViewOrder();
                setIsOpen(false);
                return;
            }

            switch (action) {
                case 'process':
                    await onProcessOrder(orderId);
                    break;
                case 'decline':
                    await onDeclineOrder(orderId);
                    break;
                case 'ship':
                    await onShipOrder(orderId);
                    break;
            }

            setIsOpen(false);
        } catch (error) {
            console.error('Error:', error);
            toast.error((error as Error).message || 'Failed to perform action', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        }
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
                {children}
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg z-50 border border-[#ededed] w-[150px]">
                    <ul className="py-1">
                        {orderStatus === OrderStatus.PENDING && (
                            <>
                                <li
                                    className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                                    onClick={(e) => handleActionClick(e, 'process')}
                                >
                                    Process order
                                </li>
                                <li
                                    className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                                    onClick={(e) => handleActionClick(e, 'decline')}
                                >
                                    Decline order
                                </li>
                                <li
                                    className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                                    onClick={(e) => handleActionClick(e, 'ship')}
                                >
                                    Ship order
                                </li>
                            </>
                        )}
                        {orderStatus === OrderStatus.PROCESSING && (
                            <li
                                className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                                onClick={(e) => handleActionClick(e, 'ship')}
                            >
                                Ship order
                            </li>
                        )}
                        <li
                            className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                            onClick={(e) => handleActionClick(e, 'view')}
                        >
                            View order
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const DisputeDetailsModal = ({
    dispute,
    onClose,
}: {
    dispute: DisputeResponse;
    onClose: () => void;
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

    const handleProcessDispute = async () => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/process?disputeId=${dispute.id}`
            );
            if (response.status === 200) {
                toast.success('Dispute processed successfully', {
                    position: 'top-center',
                    style: {
                        background: '#4BB543',
                        color: '#fff',
                    },
                });
                onClose();
            } else {
                throw new Error('Failed to process dispute');
            }
        } catch (error) {
            console.error('Error processing dispute:', error);
            toast.error((error as any).response?.data?.message || 'Failed to process dispute', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        }
    };

    const handleResolveDispute = async () => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/send-resolve?disputeId=${dispute.id}`
            );
            if (response.status === 200) {
                toast.success('Dispute resolved successfully', {
                    position: 'top-center',
                    style: {
                        background: '#4BB543',
                        color: '#fff',
                    },
                });
                onClose();
            } else {
                throw new Error('Failed to resolve dispute');
            }
        } catch (error) {
            console.error('Error resolving dispute:', error);
            toast.error((error as any).response?.data?.message || 'Failed to resolve dispute', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        }
    };

    const handleRejectDispute = async () => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/reject?disputeId=${dispute.id}`
            );
            if (response.status === 200) {
                toast.success('Dispute rejected successfully', {
                    position: 'top-center',
                    style: {
                        background: '#4BB543',
                        color: '#fff',
                    },
                });
                onClose();
            } else {
                throw new Error('Failed to reject dispute');
            }
        } catch (error) {
            console.error('Error rejecting dispute:', error);
            toast.error((error as any).response?.data?.message || 'Failed to reject dispute', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <Toaster
                position="top-center"
                containerStyle={{
                    position: 'absolute',
                    top: '20px',
                    left: 0,
                    right: 0,
                }}
                toastOptions={{
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        style: {
                            background: '#4BB543',
                        },
                        duration: 3000,
                    },
                    error: {
                        style: {
                            background: '#FF3333',
                        },
                        duration: 4000,
                    },
                }}
            />
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative z-10 bg-white w-[1100px] mx-4 px-[60px] py-[40px] shadow-lg">
                <div className="flex justify-between border-b-[0.5px] border-[#ededed] pb-[14px] items-start">
                    <div className="flex flex-col">
                        <p className="text-[16px] text-[#022B23] font-medium">Dispute request</p>
                        <p className="text-[14px] text-[#707070] font-medium">View and process disputes on products with customers</p>
                    </div>
                    <div
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${dispute.status === "PENDING"
                            ? "bg-[#ECFDF3] text-[#027A48]"
                            : dispute.status === "PROCESSING"
                                ? "bg-[#FFFAEB] text-[#F99007]"
                                : "bg-[#EDEDED] text-[#707070]"
                            }`}
                    >
                        {dispute.status.replace(/_/g, ' ')}
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
                                    <Image src={dispute.orderItem.productImage} alt={'image'} width={70} height={70} className="h-full w-[70px] rounded-bl-[14px] rounded-tl-[14px]" />
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <p className="text-[#101828] text-[14px] font-medium">
                                        {dispute.orderItem.productName}
                                    </p>
                                </div>
                            </div>
                            <p className="text-[#667085] text-[14px] mr-[10px]">Quantity: 1</p>
                        </div>
                        <div className="h-[230px] p-[20px] rounded-[24px] bg-[#FFFBF6] w-[100%] border-[#FF9500] flex flex-col gap-[12px] border">
                            <div className="flex flex-col leading-tight">
                                <p className="text-[#101828] text-[14px] font-medium">Reason for return</p>
                                <p className="text-[#525252] text-[14px]">{dispute.reason}</p>
                            </div>
                            <div className="bg-[#EFEFEF] w-[100%] flex justify-center rounded-[24px] h-[150px]">
                                <Image src={dispute.imageUrl} width={150} height={150} alt={'image'} className="rounded-[24px] w-[100%] h-[150px]" />
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
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Order time</p>
                                <p className="text-[#000000] text-[14px] font-medium">{formattedOrderTime}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Order amount</p>
                                <p className="text-[#000000] text-[14px] font-medium">NGN {dispute.orderItem.totalPrice}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[8px] pb-[25px] border-b-[0.5px] border-[#ededed]">
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Customer name</p>
                                <p className="text-[#000000] text-[14px] font-medium">{dispute.orderItem.buyerName}</p>
                            </div>
                        </div>

                        {/* No action buttons for PENDING status - view only */}
                        {dispute.status === "PROCESSING" && (
                            <div className="h-[48px] flex gap-[4px]">
                                <div
                                    className="flex cursor-pointer text-[#461602] text-[16px] font-semibold items-center justify-center w-full bg-[#FFEEBE] h-full rounded-[12px]"
                                    onClick={handleResolveDispute}
                                >
                                    Resolve dispute
                                </div>
                            </div>
                        )}

                        {/* Show action buttons for other statuses that are not PENDING */}
                        {dispute.status !== "PENDING" && dispute.status !== "PROCESSING" && dispute.status === "RETURN_INITIATED" && (
                            <div className="h-[48px] flex gap-[4px]">
                                <div
                                    className="flex cursor-pointer text-[#707070] text-[16px] font-semibold items-center justify-center w-[116px] h-full border-[0.5px] border-[#707070] rounded-[12px]"
                                    onClick={handleRejectDispute}
                                >
                                    Reject
                                </div>
                                <div
                                    className="flex cursor-pointer text-[#461602] text-[16px] font-semibold items-center justify-center w-[163px] bg-[#FFEEBE] h-full rounded-[12px]"
                                    onClick={handleProcessDispute}
                                >
                                    Process dispute
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrderDetailsModal = ({
    order,
    onClose,
    onProcessOrder,
    onDeclineOrder,
    onShipOrder
}: {
    order: OrderResponse;
    onClose: () => void;
    onProcessOrder: (orderId: number) => Promise<void>;
    onDeclineOrder: (orderId: number) => Promise<void>;
    onShipOrder: (orderId: number) => Promise<void>;
}) => {
    const orderDate = new Date(order.createdAt);
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

    const handleProcessOrder = async () => {
        try {
            await onProcessOrder(order.id);
            onClose();
        } catch (error) {
            console.error('Error processing order:', error);
        }
    };

    const handleDeclineOrder = async () => {
        try {
            await onDeclineOrder(order.id);
            onClose();
        } catch (error) {
            console.error('Error declining order:', error);
        }
    };

    const handleShipOrder = async () => {
        try {
            await onShipOrder(order.id);
            onClose();
        } catch (error) {
            console.error('Error shipping order:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <Toaster
                position="top-center"
                containerStyle={{
                    position: 'absolute',
                    top: '20px',
                    left: 0,
                    right: 0,
                }}
                toastOptions={{
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        style: {
                            background: '#4BB543',
                        },
                        duration: 3000,
                    },
                    error: {
                        style: {
                            background: '#FF3333',
                        },
                        duration: 4000,
                    },
                }}
            />
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative z-10 bg-white w-[1100px] mx-4 px-[60px] py-[40px] shadow-lg">
                <div className="flex justify-between border-b-[0.5px] border-[#ededed] pb-[14px] items-start">
                    <div className="flex flex-col">
                        <p className="text-[16px] text-[#022B23] font-medium">Order Details</p>
                        <p className="text-[14px] text-[#707070] font-medium">View and manage order details</p>
                    </div>
                    <div
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${order.status === "PENDING"
                            ? "bg-[#ECFDF3] text-[#027A48]"
                            : order.status === "PROCESSING"
                                ? "bg-[#FFFAEB] text-[#F99007]"
                                : order.status === "SHIPPED"
                                    ? "bg-[#E6F4FA] text-[#0A6EB4]"
                                    : order.status === "DELIVERED"
                                        ? "bg-[#E6F4FA] text-[#0A6EB4]"
                                        : "bg-[#EDEDED] text-[#707070]"
                            }`}
                    >
                        {order.status}
                    </div>
                </div>

                <div className="w-full flex">
                    <div className="w-[50%] pt-[24px] pr-[32px] border-r-[0.5px] border-[#ededed] pb-[2px] gap-[30px] flex flex-col">
                        <div className="flex flex-col gap-[14px]">
                            <p className="text-[#022B23] text-[16px] font-semibold">{order.orderNumber}</p>
                            <div>
                                <p className="text-[#707070] font-medium text-[14px] leading-tight">Order date: <span className="text-[#000000]">{formattedOrderDate}</span></p>
                                {/*<p className="text-[#707070] font-medium text-[14px] leading-tight">Buyer: <span className="text-[#000000]">{order.items[0]?.buyerName || 'Unknown'}</span></p>*/}
                            </div>
                        </div>
                        {order.items.map((item, index) => (
                            <div key={index} className="w-[100%] flex items-center justify-between h-[72px] border-[1px] border-[#ededed] rounded-[14px]">
                                <div className="flex items-center h-full gap-[10px]">
                                    <div className="h-full bg-[#f9f9f9] rounded-bl-[14px] rounded-tl-[14px] w-[70px] border-l-[0.5px] border-[#ededed]">
                                        <Image src={item.productImage} alt={'image'} width={70} height={70} className="h-full w-[70px] rounded-bl-[14px] rounded-tl-[14px]" />
                                    </div>
                                    <div className="flex flex-col leading-tight">
                                        <p className="text-[#101828] text-[14px] font-medium">{item.productName}</p>
                                        <p className="text-[#667085] text-[12px]">{item.description}</p>
                                    </div>
                                </div>
                                <p className="text-[#667085] text-[14px] mr-[10px]">Quantity: {item.quantity}</p>
                            </div>
                        ))}
                    </div>
                    <div className="w-[50%] flex justify-between flex-col gap-[20px] pl-[15px] pt-[20px] pb-[5px]">
                        <p className="text-[#022B23] font-semibold text-[16px]">Order Summary</p>
                        <div className="flex flex-col gap-[8px] pb-[25px] border-b-[0.5px] border-[#ededed]">
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Order date</p>
                                <p className="text-[#000000] text-[14px] font-medium">{formattedOrderDate}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Order time</p>
                                <p className="text-[#000000] text-[14px] font-medium">{formattedOrderTime}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Total amount</p>
                                <p className="text-[#000000] text-[14px] font-medium">NGN {order.grandTotal.toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Delivery method</p>
                                <p className="text-[#000000] text-[14px] font-medium capitalize">{order.deliveryInfo.method}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Delivery address</p>
                                <p className="text-[#000000] text-[14px] font-medium">{order.deliveryInfo.address}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[8px] pb-[25px] border-b-[0.5px] border-[#ededed]">
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Customer email</p>
                                <p className="text-[#000000] text-[14px] font-medium">{order.buyerEmail}</p>
                            </div>
                        </div>

                        {order.status === OrderStatus.PENDING && (
                            <div className="h-[48px] flex gap-[4px]">
                                <div
                                    className="flex cursor-pointer text-[#707070] text-[16px] font-semibold items-center justify-center w-[116px] h-full border-[0.5px] border-[#707070] rounded-[12px]"
                                    onClick={handleDeclineOrder}
                                >
                                    Decline
                                </div>
                                <div
                                    className="flex cursor-pointer text-[#461602] text-[16px] font-semibold items-center justify-center w-[163px] bg-[#FFEEBE] h-full rounded-[12px]"
                                    onClick={handleProcessOrder}
                                >
                                    Process order
                                </div>
                                <div
                                    className="flex cursor-pointer text-[#461602] text-[16px] font-semibold items-center justify-center w-[163px] bg-[#FFEEBE] h-full rounded-[12px]"
                                    onClick={handleShipOrder}
                                >
                                    Ship order
                                </div>
                            </div>
                        )}
                        {order.status === OrderStatus.PROCESSING && (
                            <div className="h-[48px] flex gap-[4px]">
                                <div
                                    className="flex cursor-pointer text-[#461602] text-[16px] font-semibold items-center justify-center w-[163px] bg-[#FFEEBE] h-full rounded-[12px]"
                                    onClick={handleShipOrder}
                                >
                                    Ship order
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
    dispute, 
    onViewDispute, 
    onAcceptReturn, 
    onDisputeReturn 
}: { 
    dispute: DisputeResponse; 
    onViewDispute: () => void;
    onAcceptReturn?: (disputeId: number) => void;
    onDisputeReturn?: (dispute: DisputeResponse) => void;
}) => {
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
                <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg z-[99999] border border-[#ededed] w-[125px]">
                    <ul className="py-1">
                        {/* Only show Accept Return and Dispute Return options if status is RETURN_INITIATED */}
                        {dispute.status === 'RETURN_INITIATED' && onAcceptReturn && onDisputeReturn && (
                            <>
                                <li
                                    className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAcceptReturn(dispute.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    Accept Return
                                </li>
                                <li
                                    className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDisputeReturn(dispute);
                                        setIsOpen(false);
                                    }}
                                >
                                    Dispute Return
                                </li>
                            </>
                        )}
                        {/* Always show View dispute option */}
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

const DisputeTableRow = ({
    dispute,
    isLast,
    onViewDispute,
    onAcceptReturn,
    onDisputeReturn
}: {
    dispute: DisputeResponse;
    isLast: boolean;
    onViewDispute: () => void;
    onAcceptReturn?: (disputeId: number) => void;
    onDisputeReturn?: (dispute: DisputeResponse) => void;
}) => {
    return (
        <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}>
            <div className="flex items-center w-[30%] pr-[24px] gap-3">
                <div className="bg-[#f9f9f9] h-full w-[70px] overflow-hidden mt-[2px]">
                    <Image
                        src={dispute.orderItem.productImage}
                        alt={'product image'}
                        width={70}
                        height={70}
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-[14px] font-medium text-[#101828]">{dispute.orderItem.productName}</p>
                    <p className="text-[12px] text-[#667085]">Qty: {dispute.orderItem.quantity}</p>
                </div>
            </div>

            <div className="flex items-center w-[10%] px-[24px]">
                <div className={`min-w-[80px] h-[22px] px-2 rounded-[8px] flex items-center justify-center ${dispute.status === 'Processed'
                    ? 'bg-[#ECFDF3] text-[#027A48]'
                    : dispute.status === 'Inspecting'
                        ? 'bg-[#FFFAEB] text-[#F99007]'
                        : dispute.status === 'RETURN_INITIATED'
                        ? 'bg-[#E0E7FF] text-[#3730A3]'
                        : dispute.status === 'RETURN_DISPUTED'
                        ? 'bg-[#FECACA] text-[#B91C1C]'
                        : 'bg-[#EDEDED] text-[#707070]'
                    }`}>
                    <p className="text-[12px] font-medium whitespace-nowrap">{dispute.status.replace(/_/g, ' ')}</p>
                </div>
            </div>
            <div className="flex items-center text-[#344054] text-[14px] w-[15%] px-[24px]">
                <p>{dispute.orderItem.buyerName || "Unknown"}</p>
            </div>
            <div className="flex items-center justify-center text-[#101828] text-[14px] w-[25%] px-[24px]">
                <p className="text-[#101828] text-[14px]">Product issue</p>
            </div>
            <div className="flex items-center text-[#344054] text-[14px] w-[15%] px-[24px]">
                <p>₦{dispute.orderItem.totalPrice?.toLocaleString() || "0"}</p>
            </div>

            <div className="flex items-center justify-center w-[5%]">
                <DisputeActionsDropdown 
                    dispute={dispute} 
                    onViewDispute={onViewDispute}
                    onAcceptReturn={onAcceptReturn}
                    onDisputeReturn={onDisputeReturn}
                />
            </div>
        </div>
    );
};

interface ProductTableRowProps {
    order: OrderResponse;
    isLast: boolean;
    onProcessOrder: (orderId: number) => Promise<void>;
    onDeclineOrder: (orderId: number) => Promise<void>;
    onShipOrder: (orderId: number) => Promise<void>;
    onViewOrder: () => void;
}

const ProductTableRow = ({
    order,
    isLast,
    onProcessOrder,
    onDeclineOrder,
    onShipOrder,
    onViewOrder
}: ProductTableRowProps) => {
    const firstItem = order.items[0];

    return (
        <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : 'border-b border-[#EAECF0]'}`}>
            <div className="flex items-center w-[30%] pr-[24px] gap-3">
                <div className="bg-[#f9f9f9] h-[70px] w-[70px] flex items-center justify-center overflow-hidden">
                    {firstItem.productImage && (
                        <Image
                            src={firstItem.productImage}
                            alt={firstItem.productName}
                            width={70}
                            height={70}
                            className="object-cover w-full h-full"
                        />
                    )}
                </div>
                <div className="flex flex-col">
                    <p className="text-[14px] font-medium text-[#101828]">{firstItem.productName}</p>
                    {order.items.length > 1 && (
                        <p className="text-[12px] text-[#667085]">+{order.items.length - 1} more items</p>
                    )}
                </div>
            </div>

            <div className="flex justify-center items-center w-[10%]">
                <span className={`px-2 py-1 text-xs rounded-full ${order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800' :
                    order.status === OrderStatus.SHIPPED ? 'bg-green-100 text-green-800' :
                        order.status === OrderStatus.PROCESSING ? 'bg-yellow-100 text-yellow-800' :
                            order.status === OrderStatus.DECLINED ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                    }`}>
                    {order.status}
                </span>
            </div>
            <div className="flex items-center w-[13%]">
                <p className="text-[#101828] text-[10px]">
                    {order.orderNumber}
                </p>
            </div>
            <div className="flex pl-[24px] items-center w-[20%]">
                <p className="text-[#101828] text-[14px] capitalize">
                    {order.deliveryInfo?.method || ''}
                </p>
            </div>
            <div className="flex pl-[24px] items-center w-[15%]">
                <p className="text-[#101828] text-[14px]">
                    ₦{order.items.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
                </p>
            </div>
            <div className="flex items-center pl-[24px] w-[10%]">
                <p className="text-[#101828] text-[14px]">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
            </div>
            <div className="flex items-center justify-center w-[2%]">
                <ProductActionsDropdown
                    orderId={order.id}
                    orderNumber={order.orderNumber}
                    orderStatus={order.status}
                    items={order.items}
                    onProcessOrder={onProcessOrder}
                    onDeclineOrder={onDeclineOrder}
                    onShipOrder={onShipOrder}
                    onViewOrder={onViewOrder}
                >
                    <div className="flex flex-col gap-[3px] items-center justify-center p-2 -m-2">
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    </div>
                </ProductActionsDropdown>
            </div>
        </div>
    );
};

interface PendingOrdersProps {
    orders: OrderResponse[];
    loading: boolean;
}

const PendingOrders = ({ orders: initialOrders, loading }: PendingOrdersProps) => {
    const [orders, setOrders] = useState<OrderResponse[]>(initialOrders);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<'all' | 'today' | '1day' | '7days' | '30days'>('all');
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

    const handleProcessOrder = async (orderId: number) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/process-order?id=${orderId}`,
                null,
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 200) {
                toast.success('Order processed successfully', {
                    position: 'top-center',
                    style: {
                        background: '#4BB543',
                        color: '#fff',
                    },
                });
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === orderId
                            ? { ...order, status: OrderStatus.PROCESSING }
                            : order
                    )
                );
            } else {
                throw new Error('Failed to process order');
            }
        } catch (error) {
            console.error('Error processing order:', error);
            toast.error((error as any).response?.data?.message || 'Failed to process order', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        }
    };

    const handleDeclineOrder = async (orderId: number) => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/decline?id=${orderId}`,
                null,
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 200) {
                toast.success('Order declined successfully', {
                    position: 'top-center',
                    style: {
                        background: '#4BB543',
                        color: '#fff',
                    },
                });
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === orderId
                            ? { ...order, status: OrderStatus.DECLINED }
                            : order
                    )
                );
            } else {
                throw new Error('Failed to decline order');
            }
        } catch (error) {
            console.error('Error declining order:', error);
            toast.error((error as any).response?.data?.message || 'Failed to decline order', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        }
    };

    const handleShipOrder = async (orderId: number) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/ship-order?id=${orderId}`,
                null,
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 200) {
                toast.success('Order shipped successfully', {
                    position: 'top-center',
                    style: {
                        background: '#4BB543',
                        color: '#fff',
                    },
                });
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === orderId
                            ? { ...order, status: OrderStatus.SHIPPED }
                            : order
                    )
                );
            } else {
                throw new Error('Failed to ship order');
            }
        } catch (error) {
            console.error('Error shipping order:', error);
            toast.error((error as any).response?.data?.message || 'Failed to ship order', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        }
    };
    const router = useRouter();

    const handleViewOrder = (order: OrderResponse) => {
        // Navigate using order ID instead of order number
        router.push(`/vendor/dashboard/order/${order.id}`);
    };

    const closeModal = () => {
        setSelectedOrder(null);
    };

    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    const getFilteredOrders = () => {
        const now = new Date();
        const today = new Date(now.setHours(0, 0, 0, 0));

        switch (filter) {
            case 'today':
                return orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= today;
                });
            case '1day':
                const oneDayAgo = new Date(today);
                oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                return orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= oneDayAgo && orderDate < today;
                });
            case '7days':
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= sevenDaysAgo;
                });
            case '30days':
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= thirtyDaysAgo;
                });
            default:
                return orders;
        }
    };

    const PRODUCTS_PER_PAGE = 5;
    const filteredOrders = getFilteredOrders();
    const totalPages = Math.ceil(filteredOrders.length / PRODUCTS_PER_PAGE);
    const currentOrders = filteredOrders.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
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

    if (loading) {
        return (
            <div className="p-4">
                <SkeletonLoader type="order" count={5} />
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return <div className="p-4 text-center">No orders found.</div>;
    }

    if (filteredOrders.length === 0) {
        return (
            <div className="p-4 text-center">
                No orders found for the selected filter.
                <button
                    onClick={() => setFilter('all')}
                    className="mt-2 text-[#022B23] hover:underline"
                >
                    Clear filters
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-[50px]">
                <div className="flex flex-col rounded-[24px] border-[1px] border-[#EAECF0]">
                    <div className="my-[20px] mx-[25px] flex flex-col">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[#101828] font-medium">Orders ({filteredOrders.length})</p>
                                <p className="text-[#667085] text-[14px]">View your product orders</p>
                            </div>
                            <FilterDropdown
                                filter={filter}
                                setFilter={setFilter}
                                setCurrentPage={setCurrentPage}
                            />
                        </div>
                    </div>

                    <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                        <div className="flex items-center px-[24px] w-[30%] py-[12px] gap-[4px]">
                            <p className="text-[#667085] font-medium text-[12px]">Products</p>
                            <Image src={arrowDown} alt="Sort" width={12} height={12} />
                        </div>
                        <div className="flex justify-center items-center px-[24px] w-[10%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Status</p>
                        </div>
                        <div className="flex items-center px-[24px] w-[13%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Order Number</p>
                        </div>
                        <div className="flex items-center px-[15px] w-[20%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Delivery method</p>
                        </div>
                        <div className="flex items-center px-[10px] w-[15%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Total Amount</p>
                        </div>
                        <div className="flex items-center px-[10px] w-[10%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Items</p>
                        </div>
                        <div className="w-[2%]"></div>
                    </div>

                    <div className="flex flex-col">
                        {filteredOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <p className="text-[#667085] text-[14px] mb-4">No orders</p>
                                <button
                                    onClick={() => setFilter('all')}
                                    className="text-[#022B23] text-[14px] font-medium hover:underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            currentOrders.map((order, index) => (
                                <ProductTableRow
                                    key={order.id}
                                    order={order}
                                    isLast={index === currentOrders.length - 1}
                                    onProcessOrder={() => handleProcessOrder(order.id)}
                                    onDeclineOrder={() => handleDeclineOrder(order.id)}
                                    onShipOrder={() => handleShipOrder(order.id)}
                                    onViewOrder={() => handleViewOrder(order)}
                                />
                            ))
                        )}
                    </div>

                    {filteredOrders.length > 0 && (
                        <div className="flex justify-between items-center mt-4 px-6 pb-6">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-md ${currentPage === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-[#022B23] hover:bg-gray-100'
                                    }`}
                            >
                                Previous
                            </button>

                            <div className="flex gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-8 h-8 rounded-md flex items-center justify-center ${currentPage === page
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
                                className={`px-4 py-2 rounded-md ${currentPage === totalPages
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

            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={closeModal}
                    onProcessOrder={handleProcessOrder}
                    onDeclineOrder={handleDeclineOrder}
                    onShipOrder={handleShipOrder}
                />
            )}
        </>
    );
};

const Disputes = () => {
    const [disputes, setDisputes] = useState<DisputeResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState<DisputeResponse | null>(null);
    const [disputeReturnModalOpen, setDisputeReturnModalOpen] = useState(false);
    const [disputeReturnItem, setDisputeReturnItem] = useState<DisputeResponse | null>(null);
    const [disputeReturnReason, setDisputeReturnReason] = useState('');
    const [disputeReturnImage, setDisputeReturnImage] = useState<File | null>(null);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchDisputes = async () => {
            if (session?.user?.email) {
                try {
                    setLoading(true);
                    
                    // First check if shop exists
                    const existsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/exists?email=${session.user.email}`);
                    const shopExists = await existsResponse.json();
                    
                    if (!shopExists) {
                        // Shop doesn't exist, no disputes to fetch
                        setDisputes([]);
                        setLoading(false);
                        return;
                    }

                    const shopResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/getbyEmail?email=${session.user.email}`
                    );
                    if (!shopResponse.ok) {
                        throw new Error('Failed to fetch shop details');
                    }
                    const shopData = await shopResponse.json();

                    const disputesResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/get-shop-disputes?id=${shopData.id}`
                    );
                    if (!disputesResponse.ok) {
                        throw new Error('Failed to fetch disputes');
                    }
                    const disputesData = await disputesResponse.json();
                    // Sort disputes by most recent (createdAt or updatedAt)
                    const sortedDisputes = disputesData.sort((a: any, b: any) => {
                        const dateA = new Date(a.createdAt || a.updatedAt || 0);
                        const dateB = new Date(b.createdAt || b.updatedAt || 0);
                        return dateB.getTime() - dateA.getTime();
                    });
                    setDisputes(sortedDisputes);
                    console.log("Disputes: ", sortedDisputes);
                } catch (error) {
                    console.error('Error fetching disputes:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchDisputes();
    }, [session]);

    const handleViewDispute = (dispute: DisputeResponse) => {
        setSelectedDispute(dispute);
    };

    const closeModal = () => {
        setSelectedDispute(null);
    };

    const handleAcceptReturn = async (disputeId: number) => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/mark-return-accepted?id=${disputeId}`
            );

            if (response.status === 200) {
                toast.success('Return accepted successfully');
                // Refresh disputes
                // First check if shop exists
                const existsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/exists?email=${session?.user?.email}`);
                const shopExists = await existsResponse.json();
                
                if (shopExists) {
                    const shopResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/getbyEmail?email=${session?.user?.email}`
                    );
                    const shopData = await shopResponse.json();
                    const disputesResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/get-shop-disputes?id=${shopData.id}`
                    );
                    const disputesData = await disputesResponse.json();
                    setDisputes(disputesData);
                }
            }
        } catch (error) {
            console.error('Error accepting return:', error);
            toast.error('Failed to accept return');
        }
    };

    const handleDisputeReturn = (dispute: DisputeResponse) => {
        setDisputeReturnItem(dispute);
        setDisputeReturnModalOpen(true);
    };

    const handleCloseDisputeReturnModal = () => {
        setDisputeReturnModalOpen(false);
        setDisputeReturnReason('');
        setDisputeReturnImage(null);
        setDisputeReturnItem(null);
    };

    const handleDisputeReturnImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setDisputeReturnImage(e.target.files[0]);
        }
    };

    const handleSubmitDisputeReturn = async () => {
        if (!disputeReturnItem || !disputeReturnReason) {
            toast.error('Please provide all required information');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('disputeId', disputeReturnItem.id.toString());
            if (disputeReturnImage) {
                formData.append('itemImage', disputeReturnImage);
            }
            formData.append('reason', disputeReturnReason);

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/dispute-refund`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.status === 201) {
                toast.success('Return disputed successfully');
                handleCloseDisputeReturnModal();
                
                // Refresh disputes
                // First check if shop exists
                const existsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/exists?email=${session?.user?.email}`);
                const shopExists = await existsResponse.json();
                
                if (shopExists) {
                    const shopResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/getbyEmail?email=${session?.user?.email}`
                    );
                    const shopData = await shopResponse.json();
                    const disputesResponse = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/get-shop-disputes?id=${shopData.id}`
                    );
                    const disputesData = await disputesResponse.json();
                    setDisputes(disputesData);
                }
            }
        } catch (error) {
            console.error('Error disputing return:', error);
            toast.error('Failed to dispute return');
        }
    };

    if (loading) {
        return (
            <div className="p-4">
                <SkeletonLoader type="dispute" count={5} />
            </div>
        );
    }

    if (!disputes || disputes.length === 0) {
        return <div className="p-4 text-center">No disputes found.</div>;
    }

    return (
        <>
            <div className="flex flex-col gap-[50px]">
                <div className="flex flex-col rounded-[24px] border-[1px] border-[#EAECF0]">
                    <div className="my-[20px] mx-[25px] flex flex-col">
                        <p className="text-[#101828] font-medium">Disputes ({disputes.length})</p>
                        <p className="text-[#667085] text-[14px]">View all disputes</p>
                    </div>

                    <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                        <div className="flex items-center px-[24px] w-[30%] py-[12px] gap-[4px]">
                            <p className="text-[#667085] font-medium text-[12px]">Products</p>
                            <Image src={arrowDown} alt="Sort" width={12} height={12} />
                        </div>
                        <div className="flex items-center justify-center px-[24px] w-[10%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Status</p>
                        </div>
                        <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Customer ID</p>
                        </div>
                        <div className="flex items-center justify-center px-[15px] w-[25%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Reason for request</p>
                        </div>
                        <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Price</p>
                        </div>
                        <div className="w-[5%]"></div>
                    </div>

                    <div className="flex flex-col">
                        {disputes.map((dispute, index) => (
                            <DisputeTableRow
                                key={dispute.id}
                                dispute={dispute}
                                isLast={index === disputes.length - 1}
                                onViewDispute={() => handleViewDispute(dispute)}
                                onAcceptReturn={handleAcceptReturn}
                                onDisputeReturn={handleDisputeReturn}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {selectedDispute && (
                <DisputeDetailsModal
                    dispute={{
                        id: selectedDispute.id,
                        requestTime: selectedDispute.requestTime,
                        status: selectedDispute.status,
                        resolvedDate: selectedDispute.resolvedDate,
                        orderNumber: selectedDispute.orderNumber,
                        imageUrl: selectedDispute.orderItem.productImage,
                        reason: selectedDispute.reason,
                        orderTime: selectedDispute.orderTime,
                        deliveryMethod: selectedDispute.deliveryMethod,
                        orderItem: selectedDispute.orderItem
                    }}
                    onClose={closeModal}
                />
            )}

            {/* Dispute Return Modal */}
            {disputeReturnModalOpen && disputeReturnItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-[30px] w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex border-b-[0.5px] pb-3 border-[#ededed] justify-between items-center">
                            <h2 className="text-sm sm:text-[16px] text-[#022B23] font-medium">Dispute Return</h2>
                            <button onClick={handleCloseDisputeReturnModal} className="text-gray-500 hover:text-gray-700 text-xl">
                                &times;
                            </button>
                        </div>

                        <div className="mt-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload Image (Optional)
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {disputeReturnImage ? (
                                                <Image
                                                    src={URL.createObjectURL(disputeReturnImage)}
                                                    alt={`Dispute return preview`}
                                                    width={80}
                                                    height={80}
                                                    className="h-20 object-contain mb-2"
                                                />
                                            ) : (
                                                <>
                                                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                                    </svg>
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleDisputeReturnImageUpload}
                                            accept="image/*"
                                        />
                                    </label>
                                </div>
                                {disputeReturnImage && (
                                    <button
                                        onClick={() => setDisputeReturnImage(null)}
                                        className="mt-2 text-sm text-red-500 hover:text-red-700"
                                    >
                                        Remove image
                                    </button>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="dispute-return-reason" className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason for Disputing Return *
                                </label>
                                <textarea
                                    id="dispute-return-reason"
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#022B23]"
                                    placeholder="Please describe why you are disputing this return..."
                                    value={disputeReturnReason}
                                    onChange={(e) => setDisputeReturnReason(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                                <button
                                    onClick={handleCloseDisputeReturnModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitDisputeReturn}
                                    disabled={!disputeReturnReason}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md order-1 sm:order-2 ${
                                        !disputeReturnReason
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-[#022B23] hover:bg-[#033a30]'
                                    }`}
                                >
                                    Submit Dispute
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// VendorReturns component
const VendorReturns = () => {
    const { data: session } = useSession();
    const [returns, setReturns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingReturn, setProcessingReturn] = useState<number | null>(null);

    useEffect(() => {
        const fetchReturns = async () => {
            if (session?.user?.email) {
                try {
                    setLoading(true);

                    // First, fetch shop details to get the shop ID
                    const shopResponse = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/getbyEmail?email=${session.user.email}`
                    );

                    if (!shopResponse.data?.id) {
                        throw new Error('Failed to fetch shop details');
                    }

                    const shopId = shopResponse.data.id;

                    // Then fetch returns using the shop ID
                    const returnsResponse = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/returns/get-shop?shopId=${shopId}`
                    );
                    setReturns(returnsResponse.data);
                } catch (error) {
                    console.error('Error fetching returns:', error);
                    toast.error('Failed to fetch returns', {
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
        };

        fetchReturns();
    }, [session]);

    const handleProcessReturn = async (returnId: number, action: 'APPROVED' | 'REJECTED') => {
        setProcessingReturn(returnId);
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/returns/process`,
                {
                    returnId,
                    status: action
                }
            );

            if (response.status === 200) {
                // Update the return status in the local state
                setReturns(prevReturns =>
                    prevReturns.map(returnItem =>
                        returnItem.id === returnId
                            ? { ...returnItem, returnStatus: action }
                            : returnItem
                    )
                );

                toast.success(`Return ${action.toLowerCase()} successfully`, {
                    position: 'top-center',
                    style: {
                        background: '#10B981',
                        color: '#fff',
                    },
                });
            }
        } catch (error) {
            console.error('Error processing return:', error);
            toast.error('Failed to process return', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        } finally {
            setProcessingReturn(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-[#F9FDE8] text-[#0C4F24]';
            case 'PENDING':
                return 'bg-[#FFFAEB] text-[#B54708]';
            case 'REJECTED':
                return 'bg-[#FFEBEB] text-[#F90707]';
            default:
                return 'bg-[#E7E7E7] text-[#1E1E1E]';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="p-4">
                <SkeletonLoader type="return" count={5} />
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Returns ({returns.length})</h2>
            {returns.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-[#3D3D3D] text-[14px]">
                    <p>No returns yet</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-[#ededed] rounded-lg">
                        <thead className="bg-[#f8f8f8]">
                        <tr>
                            <th className="text-left p-4 border-b border-[#ededed]">Product</th>
                            <th className="text-left p-4 border-b border-[#ededed]">Buyer</th>
                            <th className="text-left p-4 border-b border-[#ededed]">Amount</th>
                            <th className="text-left p-4 border-b border-[#ededed]">Reason</th>
                            <th className="text-left p-4 border-b border-[#ededed]">Status</th>
                            <th className="text-left p-4 border-b border-[#ededed]">Date</th>
                            <th className="text-left p-4 border-b border-[#ededed]">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {returns.map((returnItem, index) => (
                            <tr key={returnItem.id} className="border-b border-[#ededed] last:border-b-0">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-[#f9f9f9] rounded-lg overflow-hidden flex-shrink-0">
                                            {returnItem.item?.productImage ? (
                                                <Image
                                                    src={returnItem.item.productImage}
                                                    alt={returnItem.item.productName}
                                                    width={48}
                                                    height={48}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                                    No image
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#101828]">{returnItem.item?.productName || 'N/A'}</p>
                                            <p className="text-sm text-[#7c7c7c]">Qty: {returnItem.item?.quantity || 0}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-[#101828]">{returnItem.buyerEmail}</td>
                                <td className="p-4 text-[#101828] font-medium">₦{Number(returnItem.totalAmount).toLocaleString()}</td>
                                <td className="p-4 text-[#101828]">{returnItem.reason}</td>
                                <td className="p-4">
                                    <div className={`inline-flex h-[32px] px-3 items-center text-[12px] font-medium justify-center rounded-[100px] ${getStatusColor(returnItem.returnStatus)}`}>
                                        <p>{returnItem.returnStatus}</p>
                                    </div>
                                </td>
                                <td className="p-4 text-[#101828]">{formatDate(returnItem.createdAt)}</td>
                                <td className="p-4">
                                    {returnItem.returnStatus === 'PENDING' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleProcessReturn(returnItem.id, 'APPROVED')}
                                                disabled={processingReturn === returnItem.id}
                                                className={`px-3 py-1 text-xs font-medium rounded-md ${
                                                    processingReturn === returnItem.id
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-[#10B981] text-white hover:bg-[#059669]'
                                                }`}
                                            >
                                                {processingReturn === returnItem.id ? 'Processing...' : 'Accept'}
                                            </button>
                                            <button
                                                onClick={() => handleProcessReturn(returnItem.id, 'REJECTED')}
                                                disabled={processingReturn === returnItem.id}
                                                className={`px-3 py-1 text-xs font-medium rounded-md ${
                                                    processingReturn === returnItem.id
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                                                }`}
                                            >
                                                {processingReturn === returnItem.id ? 'Processing...' : 'Reject'}
                                            </button>
                                        </div>
                                    )}
                                    {returnItem.returnStatus !== 'PENDING' && (
                                        <span className="text-sm text-gray-500">No actions available</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const OrderClient = () => {
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get('tab') as 'orders' | 'disputes') || 'orders';
    const [activeTab, setActiveTab] = useState<'orders' | 'disputes'>(initialTab);
    const [pendingOrders, setPendingOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        const fetchPendingOrders = async (): Promise<void> => {
            if (session?.user?.email) {
                try {
                    setLoading(true);
                    
                    // First check if shop exists
                    const existsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/exists?email=${session.user.email}`);
                    const shopExists = await existsResponse.json();
                    
                    if (!shopExists) {
                        // Shop doesn't exist, no orders to fetch
                        setPendingOrders([]);
                        setLoading(false);
                        return;
                    }

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/getbyEmail?email=${session.user.email}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch orders');
                    }
                    const data = await response.json();
                    const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/get-shop-orders?shopId=${data.id}`);
                    const orderData = await orderResponse.json();
                    setPendingOrders(orderData);
                    console.log("Orders: ", orderData);
                } catch (error) {
                    console.error('Error fetching orders:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPendingOrders();
    }, [session]);

    const handleTabChange = (tab: 'orders' | 'disputes') => {
        setActiveTab(tab);
        router.replace(`/vendor/dashboard/order?tab=${tab}`, { scroll: false });
    };

    return (
        <>
            <DashboardHeader />
            <DashboardOptions />
            <div className="flex flex-col">
                <div className="flex border-b border-[#ededed] mb-6 px-[100px]">
                    <div className="w-[500px] h-[52px] gap-[24px] flex items-end">
                        <p
                            className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${activeTab === 'orders' ? 'font-medium border-b-2 border-[#C6EB5F]' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('orders')}
                        >
                            All Orders
                        </p>
                        <p
                            className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${activeTab === 'disputes' ? 'font-medium border-b-2 border-[#C6EB5F]' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('disputes')}
                        >
                            Disputes
                        </p>

                    </div>
                </div>
                <div className="bg-white rounded-lg mx-[100px] mb-8">
                    {activeTab === 'orders' && (
                        <PendingOrders
                            orders={pendingOrders}
                            loading={loading}
                        />
                    )}
                    {activeTab === 'disputes' && <Disputes />}
                </div>
            </div>
        </>
    );
};

export default OrderClient;