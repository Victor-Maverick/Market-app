'use client'
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardHeader from "@/components/dashboardHeader";
import DashboardOptions from "@/components/dashboardOptions";
import Image from "next/image";
import { Toaster, toast } from 'react-hot-toast';
import { useSession } from "next-auth/react";
import axios from "axios";
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

const VendorOrderDetails = () => {
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const orderNumber = params.orderNumber as string;
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if order data was passed via sessionStorage
        const storedOrderData = sessionStorage.getItem(`vendor_order_${orderNumber}`);
        if (storedOrderData) {
            try {
                const orderData = JSON.parse(storedOrderData);
                setOrder(orderData);
                setLoading(false);
                // Clean up sessionStorage after use
                sessionStorage.removeItem(`vendor_order_${orderNumber}`);
                return;
            } catch (error) {
                console.error('Error parsing stored order data:', error);
            }
        }

        // Fallback: fetch order details if no stored data
        const fetchOrderDetails = async () => {
            if (!session?.user?.email) {
                return;
            }

            try {
                // First get the shop data by email to get shopId
                const shopResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/getbyEmail?email=${session.user.email}`);
                const shopData = shopResponse.data;
                
                if (!shopData.id) {
                    console.error('No shop found for user');
                    return;
                }

                // Then get the orders using the shopId
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/get-shop-orders?shopId=${shopData.id}`
                );

                const foundOrder = response.data.find((o: OrderResponse) => o.orderNumber === orderNumber);
                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    toast.error('Order not found', {
                        position: 'top-center',
                        style: {
                            background: '#FF3333',
                            color: '#fff',
                        },
                    });
                    router.push('/vendor/dashboard/order');
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                toast.error('Failed to load order details', {
                    position: 'top-center',
                    style: {
                        background: '#FF3333',
                        color: '#fff',
                    },
                });
                router.push('/vendor/dashboard/order');
            } finally {
                setLoading(false);
            }
        };

        if (orderNumber) {
            if (session?.user?.email) {
                fetchOrderDetails();
            } else if (storedOrderData) {
                // If we have stored data but no session yet, wait for session
                return;
            }
        }
    }, [orderNumber, session, router]);

    const handleProcessOrder = async () => {
        if (!order) return;

        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/process-order?orderId=${order.id}`
            );

            toast.success('Order processed successfully', {
                position: 'top-center',
                style: {
                    background: '#4BB543',
                    color: '#fff',
                },
            });

            setOrder(prev => prev ? { ...prev, status: 'PROCESSING' } : null);
        } catch (error) {
            console.error('Error processing order:', error);
            toast.error('Failed to process order', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        }
    };

    const handleShipOrder = async () => {
        if (!order) return;

        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/ship-order?orderId=${order.id}`
            );

            toast.success('Order shipped successfully', {
                position: 'top-center',
                style: {
                    background: '#4BB543',
                    color: '#fff',
                },
            });

            setOrder(prev => prev ? { ...prev, status: 'SHIPPED' } : null);
        } catch (error) {
            console.error('Error shipping order:', error);
            toast.error('Failed to ship order', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        }
    };

    const handleDeclineOrder = async () => {
        if (!order) return;

        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/decline-order?orderId=${order.id}`
            );

            toast.success('Order declined successfully', {
                position: 'top-center',
                style: {
                    background: '#4BB543',
                    color: '#fff',
                },
            });

            setOrder(prev => prev ? { ...prev, status: 'DECLINED' } : null);
        } catch (error) {
            console.error('Error declining order:', error);
            toast.error('Failed to decline order', {
                position: 'top-center',
                style: {
                    background: '#FF3333',
                    color: '#fff',
                },
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-[#0C4F24] text-white';
            case 'SHIPPED':
                return 'bg-[#E6F4FA] text-[#0A6EB4]';
            case 'PROCESSING':
                return 'bg-[#FFFAEB] text-[#F99007]';
            case 'PENDING':
                return 'bg-[#FFFAEB] text-[#B54708]';
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
        return (
            <div className="flex flex-col h-screen">
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

    if (!order) {
        return (
            <div className="flex flex-col h-screen">
                <DashboardHeader />
                <div className="flex flex-1">
                    <DashboardOptions />
                    <div className="flex-1 flex justify-center items-center">
                        <p>Order not found</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen">
            <DashboardHeader />
            <div className="flex flex-1">
                <DashboardOptions />
                <div className="flex-1 overflow-auto">
                    <div className="min-h-full px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-lg border border-[#ededed] p-4 sm:p-6 lg:p-8">
                            {/* Order Header */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#ededed] pb-4 sm:pb-6 mb-4 sm:mb-6 gap-4">
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
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Order Items</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full border border-[#ededed] rounded-lg min-w-[600px]">
                                        <thead className="bg-[#f8f8f8]">
                                            <tr>
                                                <th className="text-left p-2 sm:p-3 lg:p-4 border-b border-[#ededed] text-sm sm:text-base">Product</th>
                                                <th className="text-left p-2 sm:p-3 lg:p-4 border-b border-[#ededed] text-sm sm:text-base">Quantity</th>
                                                <th className="text-left p-2 sm:p-3 lg:p-4 border-b border-[#ededed] text-sm sm:text-base">Unit Price</th>
                                                <th className="text-left p-2 sm:p-3 lg:p-4 border-b border-[#ededed] text-sm sm:text-base">Total Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item) => (
                                                <tr key={item.id} className="border-b border-[#ededed] last:border-b-0">
                                                    <td className="p-2 sm:p-3 lg:p-4">
                                                        <div className="flex items-center gap-2 sm:gap-3">
                                                            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-[#f9f9f9] rounded-lg overflow-hidden flex-shrink-0">
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
                                                    <td className="p-2 sm:p-3 lg:p-4 text-[#101828] text-sm sm:text-base">{item.quantity}</td>
                                                    <td className="p-2 sm:p-3 lg:p-4 text-[#101828] text-sm sm:text-base">₦{Number(item.unitPrice).toLocaleString()}</td>
                                                    <td className="p-2 sm:p-3 lg:p-4 text-[#101828] font-medium text-sm sm:text-base">₦{Number(item.totalPrice).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Delivery Information</h3>
                                    <div className="bg-[#f8f8f8] p-3 sm:p-4 rounded-lg">
                                        <p className="text-xs sm:text-sm text-[#7c7c7c] mb-2">Delivery Method</p>
                                        <p className="font-medium text-sm sm:text-base break-words">{order.deliveryInfo?.method || 'N/A'}</p>
                                        <p className="text-xs sm:text-sm text-[#7c7c7c] mt-3 mb-2">Delivery Address</p>
                                        <p className="font-medium text-sm sm:text-base break-words">{order.deliveryInfo?.address || 'N/A'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Order Summary</h3>
                                    <div className="bg-[#f8f8f8] p-3 sm:p-4 rounded-lg space-y-3">
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
                </div>
            </div>
            <Toaster />
        </div>
    );
};

export default VendorOrderDetails;