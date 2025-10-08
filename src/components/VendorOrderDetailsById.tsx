'use client'
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import MarketPlaceHeader from './marketPlaceHeader';
import BackButton from './BackButton';
import DashboardHeader from './dashboardHeader';
import DashboardOptions from './dashboardOptions';
import { SkeletonLoader } from './LoadingSkeletons';

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

interface OrderResponse {
    id: number;
    orderNumber: string;
    buyerEmail: string;
    status: string;
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

interface VendorOrderDetailsByIdProps {
    layout?: 'dashboard' | 'marketplace';
}

const VendorOrderDetailsById: React.FC<VendorOrderDetailsByIdProps> = ({ layout = 'marketplace' }) => {
    const router = useRouter();
    const params = useParams();
    const orderId = params.orderId as string;
    const { data: session } = useSession();
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                console.log('Fetching order details for orderId:', orderId);

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/get-by-id?id=${orderId}`
                );

                console.log("Full API Response:", response);
                console.log("Response data:", response.data);

                if (response.data) {
                    const orderData = response.data.data || response.data.order || response.data;
                    console.log("Extracted order data:", orderData);

                    if (orderData && (orderData.id || orderData.orderNumber)) {
                        setOrder(orderData);
                    } else {
                        console.error("Invalid order data structure:", orderData);
                        toast.error('Invalid order data received');
                    }
                } else {
                    console.error("No data in response");
                    toast.error('No data received from server');
                }

            } catch (error: any) {
                console.error('Error fetching order details:', error);

                if (error.response) {
                    toast.error(`Error: ${error.response.status} - ${error.response.data?.message || 'Failed to fetch order details'}`);
                } else if (error.request) {
                    toast.error('No response from server');
                } else {
                    toast.error('Error fetching order details');
                }
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        } else {
            setLoading(false);
        }
    }, [orderId, router]);

    const handleProcessOrder = async () => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/process-order?id=${orderId}`
            );

            // Check for successful response (200 status) or success field
            if (response.status === 200 || response.data?.success) {
                toast.success('Order processed successfully');
                // Reload the page to reflect updated order status
                setTimeout(() => {
                    window.location.reload();
                }, 1000); // Small delay to show the success toast
            } else {
                toast.error('Failed to process order');
            }
        } catch (error) {
            console.error('Error processing order:', error);
            toast.error('Error processing order');
        }
    };

    const handleShipOrder = async () => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/ship-order?id=${orderId}`
            );

            // Check for successful response (200 status) or success field
            if (response.status === 200 || response.data?.success) {
                toast.success('Order shipped successfully');
                // Reload the page to reflect updated order status
                setTimeout(() => {
                    window.location.reload();
                }, 1000); // Small delay to show the success toast
            } else {
                toast.error('Failed to ship order');
            }
        } catch (error) {
            console.error('Error shipping order:', error);
            toast.error('Error shipping order');
        }
    };

    const handleDeclineOrder = async () => {
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/decline-order?id=${orderId}`
            );

            // Check for successful response (200 status) or success field
            if (response.status === 200 || response.data?.success) {
                toast.success('Order declined successfully');
                // Reload the page to reflect updated order status
                setTimeout(() => {
                    window.location.reload();
                }, 1000); // Small delay to show the success toast
            } else {
                toast.error('Failed to decline order');
            }
        } catch (error) {
            console.error('Error declining order:', error);
            toast.error('Error declining order');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-[#0C4F24] text-white';
            case 'SHIPPED':
                return 'bg-[#E6F4FA] text-[#0A6EB4]';
            case 'PROCESSING':
                return 'bg-[#FFFAEB] text-[#B54708]';
            case 'PENDING':
                return 'bg-[#FEF3F2] text-[#B42318]';
            case 'DECLINED':
                return 'bg-[#FFEBEB] text-[#F90707]';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'Delivered';
            case 'SHIPPED':
                return 'Shipped';
            case 'PROCESSING':
                return 'Processing';
            case 'PENDING':
                return 'Pending';
            case 'DECLINED':
                return 'Declined';
            default:
                return status;
        }
    };

    if (loading) {
        if (layout === 'dashboard') {
            return (
                <div className="min-h-screen flex flex-col">
                    <DashboardHeader />
                    <div className="flex flex-1">
                        <DashboardOptions />
                        <div className="flex-1 p-6">
                            <SkeletonLoader type="card" count={3} />
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="min-h-screen flex flex-col">
                <MarketPlaceHeader />
                <div className="flex-1 p-6">
                    <SkeletonLoader type="card" count={3} />
                </div>
            </div>
        );
    }

    if (!order) {
        if (layout === 'dashboard') {
            return (
                <div className="min-h-screen flex flex-col">
                    <DashboardHeader />
                    <div className="flex flex-1">
                        <DashboardOptions />
                        <div className="flex-1 p-6 flex flex-col items-center justify-center">
                            <p className="text-lg text-[#7c7c7c] mb-4">Order not found</p>
                            <button
                                onClick={() => router.back()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="min-h-screen flex flex-col">
                <DashboardHeader />
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <p className="text-lg text-[#7c7c7c] mb-4">Order not found</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (layout === 'dashboard') {
        return (
            <>
                <DashboardHeader />
                <DashboardOptions />
                <div className="flex flex-col">
                    {/* Navigation breadcrumb */}
                    <div className="flex border-b border-[#ededed] mb-6 px-[100px]">
                        <div className="w-[500px] h-[52px] gap-[24px] flex items-end">
                            <p className="py-2 text-[#11151F] cursor-pointer text-[14px] font-medium border-b-2 border-[#C6EB5F]">
                                Order Details
                            </p>
                        </div>
                    </div>
                    
                    {/* Order content */}
                    <div className="bg-white rounded-lg mx-[100px] mb-8 p-6">
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#ededed] pb-6 mb-6 gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-semibold text-[#022B23]">Order #{order.orderNumber}</h1>
                                <p className="text-sm sm:text-base text-[#7c7c7c] mt-1">
                                    Order date: {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <p className="text-sm sm:text-base text-[#7c7c7c] break-words">Buyer: {order.buyerEmail}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {getStatusText(order.status)}
                                </span>
                                {order.status === 'PENDING' && (
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={handleProcessOrder}
                                            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base"
                                        >
                                            Process
                                        </button>
                                        <button
                                            onClick={handleShipOrder}
                                            className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-700 text-sm sm:text-base"
                                        >
                                            Ship
                                        </button>
                                        <button
                                            onClick={handleDeclineOrder}
                                            className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-red-700 text-sm sm:text-base"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                )}
                                {order.status === 'PROCESSING' && (
                                    <button
                                        onClick={handleShipOrder}
                                        className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-700 text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        Ship Order
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border border-[#ededed] rounded-lg">
                                    <thead className="bg-[#f8f8f8]">
                                        <tr>
                                            <th className="text-left p-4 border-b border-[#ededed] text-sm sm:text-base">Product</th>
                                            <th className="text-left p-4 border-b border-[#ededed] text-sm sm:text-base">Quantity</th>
                                            <th className="text-left p-4 border-b border-[#ededed] text-sm sm:text-base">Unit Price</th>
                                            <th className="text-left p-4 border-b border-[#ededed] text-sm sm:text-base">Total Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item) => (
                                            <tr key={item.id} className="border-b border-[#ededed] last:border-b-0">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-16 bg-[#f9f9f9] rounded-lg overflow-hidden flex-shrink-0">
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
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-[#101828] text-sm sm:text-base">{item.quantity}</td>
                                                <td className="p-4 text-[#101828] text-sm sm:text-base">₦{Number(item.unitPrice).toLocaleString()}</td>
                                                <td className="p-4 text-[#101828] font-medium text-sm sm:text-base">₦{Number(item.totalPrice).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
                                <div className="bg-[#f8f8f8] p-4 rounded-lg">
                                    <p className="text-sm text-[#7c7c7c] mb-2">Delivery Method</p>
                                    <p className="font-medium text-sm sm:text-base break-words">{order.deliveryInfo?.method || 'N/A'}</p>
                                    <p className="text-sm text-[#7c7c7c] mt-3 mb-2">Delivery Address</p>
                                    <p className="font-medium text-sm sm:text-base break-words">{order.deliveryInfo?.address || 'N/A'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
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
                <ToastContainer />
            </>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <DashboardHeader />
            <DashboardOptions/>
            <div className="h-[48px] w-full border-y-[0.5px] border-[#EDEDED]">
                <div className="h-[48px] px-4 sm:px-6 lg:px-8 xl:px-[100px] gap-[8px] items-center flex">
                    <BackButton variant="default" text="Go back" />
                    <p className="text-[12px] sm:text-[14px] text-[#3F3E3E]">
                        Home // Vendor Orders // <span className="font-medium text-[#022B23]">#{order.orderNumber}</span>
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
                            <p className="text-[#7c7c7c] text-sm sm:text-base break-words">Buyer: {order.buyerEmail}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                            </span>
                            {order.status === 'PENDING' && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={handleProcessOrder}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                                    >
                                        Process
                                    </button>
                                    <button
                                        onClick={handleShipOrder}
                                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                                    >
                                        Ship
                                    </button>
                                    <button
                                        onClick={handleDeclineOrder}
                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                                    >
                                        Decline
                                    </button>
                                </div>
                            )}
                            {order.status === 'PROCESSING' && (
                                <button
                                    onClick={handleShipOrder}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                                >
                                    Ship Order
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order Items Table */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border border-[#ededed] rounded-lg min-w-[600px]">
                                <thead className="bg-[#f8f8f8]">
                                <tr>
                                    <th className="text-left p-4 border-b border-[#ededed] text-sm sm:text-base">Product</th>
                                    <th className="text-left p-4 border-b border-[#ededed] text-sm sm:text-base">Quantity</th>
                                    <th className="text-left p-4 border-b border-[#ededed] text-sm sm:text-base">Unit Price</th>
                                    <th className="text-left p-4 border-b border-[#ededed] text-sm sm:text-base">Total Price</th>
                                </tr>
                                </thead>
                                <tbody>
                                {order.items.map((item) => (
                                    <tr key={item.id} className="border-b border-[#ededed] last:border-b-0">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-16 bg-[#f9f9f9] rounded-lg overflow-hidden flex-shrink-0">
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
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-[#101828] text-sm sm:text-base">{item.quantity}</td>
                                        <td className="p-4 text-[#101828] text-sm sm:text-base">₦{Number(item.unitPrice).toLocaleString()}</td>
                                        <td className="p-4 text-[#101828] font-medium text-sm sm:text-base">₦{Number(item.totalPrice).toLocaleString()}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
                            <div className="bg-[#f8f8f8] p-4 rounded-lg">
                                <p className="text-sm text-[#7c7c7c] mb-2">Delivery Method</p>
                                <p className="font-medium text-sm sm:text-base break-words">{order.deliveryInfo?.method || 'N/A'}</p>
                                <p className="text-sm text-[#7c7c7c] mt-3 mb-2">Delivery Address</p>
                                <p className="font-medium text-sm sm:text-base break-words">{order.deliveryInfo?.address || 'N/A'}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
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
            <ToastContainer />
        </div>
    );
};

export default VendorOrderDetailsById;