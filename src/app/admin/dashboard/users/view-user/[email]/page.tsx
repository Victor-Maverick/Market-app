'use client'
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import BackButton from '@/components/BackButton';
import arrowDown from '../../../../../../../public/assets/images/arrow-down.svg';

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    roles: string[];
    active: boolean;
    phone: string | null;
}

interface OrderItemDto {
    id: number;
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    productImage: string;
}

interface ShopOrderInfo {
    shopId: number;
    shopName: string;
    vendorName: string;
    vendorEmail: string;
    subtotal: number;
    items: OrderItemDto[];
}

interface UserOrderResponse {
    orderNumber: string;
    status: string;
    deliveryInfo: {
        method: string;
        address: string;
    };
    createdAt: string;
    totalAmount: number;
    deliveryFee: number;
    grandTotal: number;
    itemsByShop: Record<number, OrderItemDto[]>; // Keep for backward compatibility
    items: OrderItemDto[]; // Flat list of all items
    shopOrders: ShopOrderInfo[]; // Shop-specific information
}

const OrderModal = ({
    order,
    onClose
}: {
    order: UserOrderResponse | null;
    onClose: () => void;
}) => {
    if (!order) return null;

    const allItems = order ? (order.items || Object.values(order.itemsByShop || {}).flat()) : [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-[#0C4F24] text-white';
            case 'PENDING_DELIVERY':
                return 'bg-[#FFFAEB] text-[#B54708]';
            case 'PENDING':
                return 'bg-[#FEF3F2] text-[#FF5050]';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'Delivered';
            case 'PENDING':
                return 'Pending';
            case 'PROCESSING':
                return 'Processing';
            case 'PENDING_DELIVERY':
                return 'Pending Delivery';
            default:
                return 'Paid';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20 p-2 sm:p-4">
            <div className="bg-white rounded-lg p-3 sm:p-6 lg:p-[30px] w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                <div className="flex border-b-[0.5px] pb-3 border-[#ededed] justify-between items-center">
                    <h2 className="text-[14px] sm:text-[16px] text-[#022B23] font-medium">Order Details</h2>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                        </span>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
                            &times;
                        </button>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row w-full gap-4 lg:gap-0">
                    <div className="w-full lg:w-[50%] lg:pr-[12px] pt-[12px] lg:border-r-[0.5px] lg:border-[#ededed]">
                        <div className="mb-6">
                            <h3 className="text-[14px] sm:text-[16px] text-[#022B23]">#{order.orderNumber}</h3>
                            <p className="text-[#7c7c7c] text-[12px] sm:text-[14px]">Order date: {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</p>
                        </div>
                        <div className="mb-6">
                            <h4 className="font-semibold mb-2 text-[14px] sm:text-[16px]">Products in order</h4>
                            <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-2 relative" style={{ scrollbarGutter: 'stable' }}>
                                {allItems.map((item) => (
                                    <div key={item.id} className="w-full min-h-[60px] flex justify-between pr-[8px] sm:pr-[12px] items-center border border-[#ededed] rounded-[10px] mb-2 relative p-2">
                                        <div className="flex gap-[8px] sm:gap-[12px] items-center flex-1">
                                            <div className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] bg-[#f9f9f9] rounded-[8px] sm:rounded-bl-[10px] sm:rounded-tl-[10px] flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {item.productImage ? (
                                                    <Image
                                                        src={item.productImage}
                                                        alt={item.productName}
                                                        width={60}
                                                        height={60}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-500">No image</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <p className="text-[#101828] text-[12px] sm:text-[14px] font-medium truncate">{item.productName}</p>
                                                <p className="text-[#7c7c7c] text-[10px] sm:text-[12px]">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[#101828] text-[12px] sm:text-[14px] font-medium">₦{item.unitPrice.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] flex flex-col justify-between lg:pl-[12px] border-t lg:border-t-0 pt-4 lg:pt-0">
                        <div className="gap-y-[12px] pt-[12px] flex flex-col border-b-[0.5px] pb-[12px] border-[#ededed]">
                            <div className="flex w-full justify-between items-center">
                                <p className="text-[#707070] font-medium text-[12px] sm:text-[14px]">Order time: </p>
                                <span className="text-[#000000] font-medium text-[12px] sm:text-[14px]">
                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex w-full justify-between items-center">
                                <p className="text-[#707070] font-medium text-[12px] sm:text-[14px]">Order amount: </p>
                                <span className="text-[#000000] font-medium text-[12px] sm:text-[14px]">₦{order.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex w-full justify-between items-center">
                                <p className="text-[#707070] font-medium text-[12px] sm:text-[14px]">Delivery method: </p>
                                <span className="text-[#000000] font-medium text-[12px] sm:text-[14px]">{order.deliveryInfo.method}</span>
                            </div>
                            <div className="flex w-full justify-between items-center">
                                <p className="text-[#707070] font-medium text-[12px] sm:text-[14px]">Delivery fee: </p>
                                <span className="text-[#000000] font-medium text-[12px] sm:text-[14px]">₦{order.deliveryFee.toLocaleString()}</span>
                            </div>
                            <div className="flex w-full justify-between items-center">
                                <p className="text-[#707070] font-medium text-[12px] sm:text-[14px]">Total: </p>
                                <span className="text-[#000000] font-medium text-[12px] sm:text-[14px]">₦{order.grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-[#022B23] text-[#C6EB5F] font-semibold cursor-pointer px-4 py-2 rounded hover:bg-green-700 text-[14px]"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrderActionsDropdown = ({
    order,
    onViewOrder,
    children
}: {
    order: UserOrderResponse;
    onViewOrder: (order: UserOrderResponse) => void;
    children: React.ReactNode;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        onViewOrder(order);
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
        <div className="relative w-full h-full" ref={dropdownRef}>
            <div
                onClick={handleToggle}
                className="cursor-pointer w-full h-full flex items-center justify-center"
            >
                {children}
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg z-50 border border-[#ededed] w-[125px]">
                    <ul className="py-1">
                        <li
                            className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                            onClick={handleAction}
                        >
                            View order
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const ViewUser = () => {
    const params = useParams();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<UserOrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<UserOrderResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

    const email = decodeURIComponent(params.email as string);

    // Calculate pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    const fetchUserProfile = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/get-profile`, {
                params: { email }
            });
            setUserProfile(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching user profile:', err);
            setError('Failed to fetch user profile');
        } finally {
            setLoading(false);
        }
    }, [email]);

    const fetchUserOrders = useCallback(async () => {
        try {
            setOrdersLoading(true);
            const response = await axios.get<UserOrderResponse[]>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/user`,
                { params: { buyerEmail: email } }
            );
            // Sort orders by createdAt in descending order (newest first)
            const sortedOrders = response.data.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setOrders(sortedOrders);
            console.log("ORders ::",sortedOrders);
        } catch (error) {
            console.error('Error fetching user orders:', error);
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    }, [email]);

    useEffect(() => {
        if (email) {
            fetchUserProfile();
            fetchUserOrders();
        }
    }, [email, fetchUserProfile, fetchUserOrders]);

    const handleViewOrder = (order: UserOrderResponse) => {
        setSelectedOrder(order);
    };

    const closeModal = () => {
        setSelectedOrder(null);
    };

    const getAllItemsFromOrder = (order: UserOrderResponse): OrderItemDto[] => {
        return order.items || Object.values(order.itemsByShop || {}).flat();
    };

    const getProductDisplayName = (order: UserOrderResponse) => {
        const allItems = getAllItemsFromOrder(order);
        if (allItems.length === 0) return 'No items';
        if (allItems.length === 1) return allItems[0].productName;
        return `${allItems[0].productName} + ${allItems.length - 1} other item${allItems.length > 2 ? 's' : ''}`;
    };

    const getFirstItem = (order: UserOrderResponse) => {
        const allItems = getAllItemsFromOrder(order);
        return allItems[0] || {
            productName: 'No product',
            productImage: '',
            productId: 0,
            id: 0,
            quantity: 0,
            unitPrice: 0
        };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'decimal',
            maximumFractionDigits: 2
        }).format(price);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'bg-[#F9FDE8] text-[#0C4F24]';
            case 'PENDING_DELIVERY':
                return 'bg-[#FFFAEB] text-[#F99007]';
            case 'PENDING':
                return 'bg-[#FFEBEB] text-[#F90707]';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'DELIVERED':
                return 'Delivered';
            case 'PENDING_DELIVERY':
                return 'Pending Delivery';
            case 'PENDING':
                return 'Pending';
            case 'PROCESSING':
                return 'Processing';
            default:
                return 'Paid';
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022B23]"></div>
                <p className="text-[#667085] ml-3">Loading user profile...</p>
            </div>
        );
    }

    if (error || !userProfile) {
        return (
            <div className="flex items-center justify-center h-screen flex-col">
                <p className="text-red-500 mb-2">{error || 'User not found'}</p>
                <button 
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-[#022B23] text-white rounded-md text-sm hover:bg-[#033228]"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <>
            {selectedOrder && (
                <OrderModal
                    order={selectedOrder}
                    onClose={closeModal}
                />
            )}

            <div className="text-[#022B23] text-[14px] px-[20px] font-medium gap-[8px] flex items-center h-[49px] w-full border-b-[0.5px] border-[#ededed]">
                <BackButton variant="minimal" />
                <p>User Profile - {userProfile.firstName} {userProfile.lastName}</p>
            </div>

            <div className="p-[20px]">
                {/* User Profile Section - Using same container style as demographics */}
                <div className="flex flex-col lg:flex-row w-full gap-4 lg:gap-[20px] mb-[20px]">
                    {/* Basic Information Card */}
                    <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#EAEAEA] border-[0.5px]">
                        <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#F7F7F7]">
                            <p className="text-[#707070] text-[12px] sm:text-[14px]">Full Name</p>
                        </div>
                        <div className="flex-1 flex justify-center flex-col p-[14px]">
                            <p className="text-[16px] sm:text-[18px] text-[#022B23] font-medium">{userProfile.firstName} {userProfile.lastName}</p>
                            <p className="text-[10px] sm:text-[11px] text-[#707070]">User Profile</p>
                        </div>
                    </div>

                    {/* Email Card */}
                    <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#EAEAEA] border-[0.5px]">
                        <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#F7F7F7]">
                            <p className="text-[#707070] text-[12px] sm:text-[14px]">Email Address</p>
                        </div>
                        <div className="flex-1 flex justify-center flex-col p-[14px]">
                            <p className="text-[12px] sm:text-[14px] text-[#022B23] font-medium truncate">{userProfile.email}</p>
                            <p className="text-[10px] sm:text-[11px] text-[#707070]">Contact Information</p>
                        </div>
                    </div>

                    {/* Phone Card */}
                    <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#EAEAEA] border-[0.5px]">
                        <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#022B23]">
                            <p className="text-[#C6EB5F] font-medium text-[12px] sm:text-[14px]">Phone Number</p>
                        </div>
                        <div className="flex-1 flex justify-center flex-col p-[14px]">
                            <p className="text-[16px] sm:text-[18px] text-[#022B23] font-medium">{userProfile.phone || 'None'}</p>
                            <p className="text-[10px] sm:text-[11px] text-[#707070]">Contact Details</p>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#EAEAEA] border-[0.5px]">
                        <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#F7F7F7]">
                            <p className="text-[#707070] text-[12px] sm:text-[14px]">Account Status</p>
                        </div>
                        <div className="flex-1 flex justify-center flex-col p-[14px]">
                            <div className={`inline-flex px-2 py-1 rounded-[8px] text-[12px] font-medium w-fit ${
                                userProfile.active
                                    ? 'bg-[#ECFDF3] text-[#027A48]'
                                    : 'bg-[#FEF3F2] text-[#FF5050]'
                            }`}>
                                {userProfile.active ? 'Active' : 'Inactive'}
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-[#707070] mt-1">
                                Member since {new Date(userProfile.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Roles Section */}
                <div className="bg-white rounded-[14px] border border-[#EAECF0] p-4 sm:p-6 lg:p-[24px] mb-[20px]">
                    <h3 className="text-[14px] sm:text-[16px] font-semibold text-[#101828] mb-[12px]">User Roles</h3>
                    {/* Add this line to show comma-separated roles */}
                    <p className="text-[12px] sm:text-[14px] text-[#667085] mt-2">
                        {userProfile.roles.map(role => role.replace(/[^a-zA-Z]/g, '').toLowerCase()).join(', ')}
                    </p>
                </div>

                {/* Orders Section */}
                <div className="bg-white rounded-[14px] border border-[#EAECF0]">
                    <div className="p-4 sm:p-6 lg:p-[24px] border-b border-[#EAECF0]">
                        <h2 className="text-[16px] sm:text-[18px] font-semibold text-[#101828]">Order History ({orders.length})</h2>
                        <p className="text-[12px] sm:text-[14px] text-[#667085]">View all orders placed by this user</p>
                    </div>

                    {ordersLoading ? (
                        <div className="flex items-center justify-center h-[200px]">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022B23]"></div>
                            <p className="text-[#667085] ml-3">Loading orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex items-center justify-center h-[200px]">
                            <p className="text-[#667085]">No orders found for this user</p>
                        </div>
                    ) : (
                        <>
                            {/* Orders Table Header - Hidden on mobile */}
                            <div className="hidden sm:flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                                <div className="flex items-center px-[16px] lg:px-[24px] w-[25%] py-[12px] gap-[4px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Order</p>
                                    <Image src={arrowDown} alt="Sort" width={12} height={12} />
                                </div>
                                <div className="flex items-center px-[16px] lg:px-[24px] w-[20%] py-[12px] gap-[4px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Date</p>
                                    <Image src={arrowDown} alt="Sort" width={12} height={12} />
                                </div>
                                <div className="flex items-center px-[16px] lg:px-[24px] w-[20%] py-[12px] gap-[4px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Total</p>
                                    <Image src={arrowDown} alt="Sort" width={12} height={12} />
                                </div>
                                <div className="flex items-center justify-center w-[20%]">
                                    <p className="text-[#667085] font-medium text-[12px]">Status</p>
                                </div>
                                <div className="flex items-center w-[15%] py-[12px]"></div>
                            </div>

                            {/* Orders Table Body */}
                            <div className="flex flex-col">
                                {currentOrders.map((order, index) => {
                                    const firstItem = getFirstItem(order);
                                    const productDisplayName = getProductDisplayName(order);
                                    
                                    return (
                                        <div key={order.orderNumber} className={`flex flex-col sm:flex-row min-h-[72px] p-4 sm:p-0 ${index !== currentOrders.length - 1 ? 'border-b border-[#EAECF0]' : ''}`}>
                                            {/* Mobile Layout */}
                                            <div className="sm:hidden space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-[12px] items-center">
                                                        <div className="w-[40px] h-[40px] bg-[#f9f9f9] rounded-[8px] flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {firstItem.productImage ? (
                                                                <Image
                                                                    src={firstItem.productImage}
                                                                    alt={firstItem.productName}
                                                                    width={40}
                                                                    height={40}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-xs text-gray-500">No image</span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <p className="text-[14px] text-[#101828] font-medium">#{order.orderNumber}</p>
                                                            <p className="text-[12px] text-[#667085] truncate max-w-[150px]">{productDisplayName}</p>
                                                        </div>
                                                    </div>
                                                    <OrderActionsDropdown
                                                        order={order}
                                                        onViewOrder={handleViewOrder}
                                                    >
                                                        <div className="cursor-pointer flex flex-col gap-[3px] items-center justify-center p-2">
                                                            <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                                                            <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                                                            <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                                                        </div>
                                                    </OrderActionsDropdown>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <p className="text-[12px] text-[#667085]">Date</p>
                                                            <p className="text-[14px] text-[#101828]">{formatDate(order.createdAt)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[12px] text-[#667085]">Total</p>
                                                            <p className="text-[14px] text-[#101828] font-medium">₦{formatPrice(order.grandTotal)}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-[8px] flex items-center justify-center ${getStatusStyle(order.status)}`}>
                                                        <p className="text-[12px] font-medium">{getStatusText(order.status)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Desktop Layout */}
                                            <div className="hidden sm:flex items-center w-[25%] pl-[16px] lg:pl-[24px]">
                                                <div className="flex gap-[12px] items-center">
                                                    <div className="w-[40px] h-[40px] bg-[#f9f9f9] rounded-[8px] flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {firstItem.productImage ? (
                                                            <Image
                                                                src={firstItem.productImage}
                                                                alt={firstItem.productName}
                                                                width={40}
                                                                height={40}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-gray-500">No image</span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="text-[14px] text-[#101828] font-medium">#{order.orderNumber}</p>
                                                        <p className="text-[12px] text-[#667085] truncate max-w-[150px]">{productDisplayName}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="hidden sm:flex flex-col justify-center w-[20%] px-[12px] lg:px-[15px]">
                                                <p className="text-[14px] text-[#101828]">{formatDate(order.createdAt)}</p>
                                                <p className="text-[12px] text-[#667085]">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>

                                            <div className="hidden sm:flex flex-col justify-center w-[20%] px-[12px] lg:px-[15px]">
                                                <p className="text-[14px] text-[#101828] font-medium">₦{formatPrice(order.grandTotal)}</p>
                                                <p className="text-[12px] text-[#667085]">{getAllItemsFromOrder(order).length} item{getAllItemsFromOrder(order).length > 1 ? 's' : ''}</p>
                                            </div>

                                            <div className="hidden sm:flex items-center w-[20%] justify-center">
                                                <div className={`px-2 py-1 rounded-[8px] flex items-center justify-center ${getStatusStyle(order.status)}`}>
                                                    <p className="text-[12px] font-medium">{getStatusText(order.status)}</p>
                                                </div>
                                            </div>

                                            <div className="hidden sm:flex items-center justify-center w-[15%] relative">
                                                <OrderActionsDropdown
                                                    order={order}
                                                    onViewOrder={handleViewOrder}
                                                >
                                                    <div className="cursor-pointer flex flex-col gap-[3px] items-center justify-center p-2">
                                                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                                                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                                                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                                                    </div>
                                                </OrderActionsDropdown>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-[24px] py-[16px] border-t border-[#EAECF0] gap-4 sm:gap-0">
                                    <p className="text-[14px] text-[#667085]">
                                        Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, orders.length)} of {orders.length} orders
                                    </p>
                                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center sm:justify-start">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-2 sm:px-3 py-1 text-[12px] sm:text-[14px] text-[#667085] border border-[#D0D5DD] rounded-md hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-2 sm:px-3 py-1 text-[12px] sm:text-[14px] border rounded-md ${
                                                    currentPage === page
                                                        ? 'bg-[#022B23] text-white border-[#022B23]'
                                                        : 'text-[#667085] border-[#D0D5DD] hover:bg-[#F9FAFB]'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-2 sm:px-3 py-1 text-[12px] sm:text-[14px] text-[#667085] border border-[#D0D5DD] rounded-md hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ViewUser;