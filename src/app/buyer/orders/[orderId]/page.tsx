'use client'
import MarketPlaceHeader from "@/components/marketPlaceHeader";
import Image from "next/image";
import React, {useEffect, useState} from "react";
import { useRouter, useParams } from "next/navigation";
import BackButton from "@/components/BackButton";
import axios from "axios";
import {ToastContainer, toast} from "react-toastify";
import { SkeletonLoader } from "@/components/LoadingSkeletons";

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
    itemStatus: string;
}

interface DeliveryInfo {
    method: string;
    address: string;
}

interface BuyerOrderResponse {
    orderNumber: string;
    status: string;
    deliveryInfo: DeliveryInfo;
    totalAmount: number;
    deliveryFee: number;
    grandTotal: number;
    createdAt: string;
    items: OrderItemDto[];
}

const OrderDetails = () => {
    const router = useRouter();
    const params = useParams();
    const orderNumber = params.orderId as string;
    const [order, setOrder] = useState<BuyerOrderResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [disputeModalOpen, setDisputeModalOpen] = useState(false);
    const [disputeItem, setDisputeItem] = useState<OrderItemDto | null>(null);
    const [disputeReason, setDisputeReason] = useState('');
    const [disputeImage, setDisputeImage] = useState<File | null>(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                // Get user email from localStorage
                const userEmail = localStorage.getItem('userEmail');
                if (!userEmail) {
                    toast.error('Please log in to view order details');
                    router.push('/login');
                    return;
                }

                // Fetch all user orders and filter by order number
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/user`,
                    { params: { buyerEmail: userEmail } }
                );

                // Find the specific order by order number
                const foundOrder = response.data.find((o: BuyerOrderResponse) => o.orderNumber === orderNumber);
                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    toast.error('Order not found');
                    router.push('/buyer/orders');
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                toast.error('Failed to load order details');
                router.push('/buyer/orders');
            } finally {
                setLoading(false);
            }
        };

        if (orderNumber) {
            fetchOrderDetails();
        }
    }, [orderNumber, router]);

    const handleOpenDisputeModal = (item: OrderItemDto) => {
        setDisputeItem(item);
        setDisputeModalOpen(true);
    };

    const handleCloseDisputeModal = () => {
        setDisputeModalOpen(false);
        setDisputeReason('');
        setDisputeImage(null);
        setDisputeItem(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setDisputeImage(e.target.files[0]);
        }
    };



    const handleDisputeAndDecline = async () => {
        if (!disputeItem || !disputeReason || !order) {
            toast.warn('Please provide all required information');
            return;
        }

        try {
            const userEmail = localStorage.getItem('userEmail');
            if (!userEmail) {
                router.push('/login');
                return;
            }

            // First call decline-item endpoint
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/decline-item?itemId=${disputeItem.id}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Then call dispute/add endpoint
            const formData = new FormData();
            formData.append('buyerEmail', userEmail);
            formData.append('orderNumber', order.orderNumber);
            formData.append('itemId', disputeItem.id.toString());
            if (disputeImage) {
                formData.append('itemImage', disputeImage);
            }
            formData.append('reason', disputeReason);

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/add`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            toast.success('Item disputed and declined successfully!');
            handleCloseDisputeModal();
            
            // Refresh the page to show updated status
            window.location.reload();
        } catch (error) {
            console.error('Error processing dispute and decline:', error);
            toast.error('Failed to process dispute. Please try again.');
        }
    };

    const handleAcceptOrder = async () => {
        if (!order) return;

        try {
            await toast.promise(
                axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/validate-pickUp`,
                    { orderNumber: order.orderNumber },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                ),
                {
                    pending: 'Accepting order...',
                    success: 'Order accepted successfully!',
                    error: 'Failed to accept order. Please try again.'
                }
            );

            // Refresh order details
            window.location.reload();
        } catch (error) {
            console.error('Error accepting order:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-[#0C4F24] text-white';
            case 'SHIPPED':
                return 'bg-[#E6F4FA] text-[#0A6EB4]';
            case 'PENDING_DELIVERY':
                return 'bg-[#FFFAEB] text-[#B54708]';
            case 'DISPUTED':
                return 'bg-[#FFEBEB] text-[#F90707]';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        return status.replace(/_/g, ' ');
    };

    if (loading) {
        return (
            <>
                <MarketPlaceHeader />
                <div className="p-6">
                    <SkeletonLoader type="card" count={3} />
                </div>
            </>
        );
    }

    if (!order) {
        return (
            <>
                <MarketPlaceHeader />
                <div className="flex justify-center items-center h-screen">
                    <p>Order not found</p>
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
                    <p className="text-[12px] sm:text-[14px] text-[#3F3E3E]">
                        Home // Orders // <span className="font-medium text-[#022B23]">#{order.orderNumber}</span>
                    </p>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 xl:px-[100px] pt-8 pb-16 min-h-screen">
                <div className="bg-white rounded-lg border border-[#ededed] p-4 sm:p-6 lg:p-8">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#ededed] pb-6 mb-6 gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-semibold text-[#022B23]">Order #{order.orderNumber}</h1>
                            <p className="text-[#7c7c7c] mt-1 text-sm sm:text-base">
                                Order date: {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                            </span>
                            {(() => {
                                // Check if there are multiple items and at least one is not disputed
                                const hasMultipleItems = order.items.length > 1;
                                const hasNonDisputedItem = order.items.some(item => item.itemStatus !== 'DISPUTED');
                                
                                // Show Accept Order button if:
                                // 1. Order status is SHIPPED (original condition)
                                // 2. OR Order status is DISPUTED but has multiple items with at least one non-disputed item
                                const shouldShowAcceptButton = 
                                    order.status === 'SHIPPED' ? (hasMultipleItems ? hasNonDisputedItem : true) :
                                    order.status === 'DISPUTED' ? (hasMultipleItems && hasNonDisputedItem) :
                                    false;
                                
                                return shouldShowAcceptButton && (
                                    <button
                                        onClick={handleAcceptOrder}
                                        className="bg-[#022B23] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#034A2E] transition-colors"
                                    >
                                        Accept Order
                                    </button>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Order Items Table */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border border-[#ededed] rounded-lg min-w-[600px]">
                                <thead className="bg-[#f8f8f8]">
                                    <tr>
                                        <th className="text-left p-2 sm:p-4 border-b border-[#ededed] text-sm sm:text-base">Product</th>
                                        <th className="text-left p-2 sm:p-4 border-b border-[#ededed] text-sm sm:text-base">Qty</th>
                                        <th className="text-left p-2 sm:p-4 border-b border-[#ededed] text-sm sm:text-base">Unit Price</th>
                                        <th className="text-left p-2 sm:p-4 border-b border-[#ededed] text-sm sm:text-base">Total</th>
                                        <th className="text-left p-2 sm:p-4 border-b border-[#ededed] text-sm sm:text-base">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item) => (
                                        <tr key={item.id} className="border-b border-[#ededed] last:border-b-0">
                                            <td className="p-2 sm:p-4">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#f9f9f9] rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.productImage ? (
                                                            <Image
                                                                src={item.productImage}
                                                                alt={item.productName}
                                                                width={64}
                                                                height={64}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                                                No image
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium text-[#101828] text-sm sm:text-base truncate">{item.productName}</p>
                                                        <p className="text-xs sm:text-sm text-[#7c7c7c] truncate">{item.description}</p>
                                                        <p className="text-xs sm:text-sm text-[#7c7c7c] truncate">Vendor: {item.vendorName}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-2 sm:p-4 text-[#101828] text-sm sm:text-base">{item.quantity}</td>
                                            <td className="p-2 sm:p-4 text-[#101828] text-sm sm:text-base">₦{Number(item.unitPrice).toLocaleString()}</td>
                                            <td className="p-2 sm:p-4 text-[#101828] font-medium text-sm sm:text-base">₦{Number(item.totalPrice).toLocaleString()}</td>
                                            <td className="p-2 sm:p-4">
                                                {order.status === 'SHIPPED' && item.itemStatus !== 'DISPUTED' && (
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => handleOpenDisputeModal(item)}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors w-full min-w-[100px]"
                                                        >
                                                            Dispute
                                                        </button>
                                                    </div>
                                                )}
                                                {item.itemStatus === 'DISPUTED' && (
                                                    <span className="text-xs text-gray-500 px-3 py-2">Disputed</span>
                                                )}
                                                {order.status !== 'SHIPPED' && item.itemStatus !== 'DISPUTED' && (
                                                    <span className="text-xs text-gray-500 px-3 py-2">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold mb-4">Delivery Information</h3>
                            <div className="bg-[#f8f8f8] p-4 rounded-lg">
                                <p className="text-sm text-[#7c7c7c] mb-2">Delivery Method</p>
                                <p className="font-medium text-sm sm:text-base break-words">{order.deliveryInfo?.method || 'N/A'}</p>
                                <p className="text-sm text-[#7c7c7c] mt-3 mb-2">Delivery Address</p>
                                <p className="font-medium text-sm sm:text-base break-words">{order.deliveryInfo?.address || 'N/A'}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-base sm:text-lg font-semibold mb-4">Order Summary</h3>
                            <div className="bg-[#f8f8f8] p-4 rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#7c7c7c] text-sm sm:text-base">Order Amount:</span>
                                    <span className="font-medium text-sm sm:text-base">₦{Number(order.totalAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#7c7c7c] text-sm sm:text-base">Delivery Fee:</span>
                                    <span className="font-medium text-sm sm:text-base">₦{Number(order.deliveryFee).toLocaleString()}</span>
                                </div>
                                <div className="border-t border-[#ededed] pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-sm sm:text-base">Total:</span>
                                        <span className="font-semibold text-base sm:text-lg">₦{Number(order.grandTotal).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dispute Modal */}
            {disputeModalOpen && disputeItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-[30px] w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex border-b-[0.5px] pb-3 border-[#ededed] justify-between items-center">
                            <h2 className="text-sm sm:text-[16px] text-[#022B23] font-medium">File Dispute</h2>
                            <button onClick={handleCloseDisputeModal} className="text-gray-500 hover:text-gray-700 text-xl">
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
                                            {disputeImage ? (
                                                <Image
                                                    src={URL.createObjectURL(disputeImage)}
                                                    alt={`Dispute preview`}
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
                                            id="dropzone-file"
                                            type="file"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                        />
                                    </label>
                                </div>
                                {disputeImage && (
                                    <button
                                        onClick={() => setDisputeImage(null)}
                                        className="mt-2 text-sm text-red-500 hover:text-red-700"
                                    >
                                        Remove image
                                    </button>
                                )}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="dispute-reason" className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason for Dispute *
                                </label>
                                <textarea
                                    id="dispute-reason"
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#022B23]"
                                    placeholder="Please describe the issue with this item..."
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                                <button
                                    onClick={handleCloseDisputeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDisputeAndDecline}
                                    disabled={!disputeReason}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md order-1 sm:order-2 ${
                                        !disputeReason
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

            <ToastContainer
                position="top-right"
                autoClose={5000}
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
};

export default OrderDetails;