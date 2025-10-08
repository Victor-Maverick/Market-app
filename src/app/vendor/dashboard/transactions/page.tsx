'use client'
import DashboardHeader from "@/components/dashboardHeader";
import Image from "next/image";
import biArrows from "../../../../../public/assets/images/biArrows.svg";
import arrowUp from "../../../../../public/assets/images/arrow-up.svg";
import exportImg from "../../../../../public/assets/images/exportImg.svg";
import archiveImg from "../../../../../public/assets/images/archive.svg";
import { useCallback, useEffect, useState } from "react";
import arrowDown from "../../../../../public/assets/images/arrow-down.svg";
import PayoutRequestSuccessModal from "@/components/payoutRequestSuccessModal";
import DashboardOptions from "@/components/dashboardOptions";
import axios from "axios";
import { useSession } from "next-auth/react";
import FilterDropdown from "@/components/filterDropdown";
import PayoutRequestModal from "@/components/payoutRequestModal";
import {toast} from "react-toastify";
import { SkeletonLoader } from "@/components/LoadingSkeletons";

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

interface PayoutResponse {
    id: number;
    paidAmount: number;
    paidAt: string;
    requestedAt: string;
    vendorName: string;
    isPaid: boolean;
}

interface ShopAccountDetails {
    bankName: string;
    accountNumber: string;
}

interface OrderItemDto {
    id: number;
    productId: number;
    productName: string;
    description: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

interface DeliveryInfo {
    method: string;
    address: string;
}

enum OrderStatus {
    PAID = 'PAID',
    PENDING_DELIVERY = 'PENDING_DELIVERY',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

const ProductTableRow = ({ order, isLast }: { order: OrderResponse; isLast: boolean }) => {
    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const firstItem = order.items[0];

    return (
        <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : 'border-b border-[#EAECF0]'}`}>
            <div className="flex items-center w-[35%] pr-[24px] gap-3">
                <div className="bg-[#f9f9f9] h-full w-[70px] overflow-hidden mt-[2px]">
                    <Image
                        src={firstItem.productImage || ''}
                        alt={firstItem.productName}
                        width={70}
                        height={70}
                        className="object-cover h-full"
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-[14px] font-medium text-[#101828]">{firstItem.productName}</p>
                    {order.items.length > 1 && (
                        <p className="text-[12px] text-[#667085]">+{order.items.length - 1} more items</p>
                    )}
                </div>
            </div>

            <div className="flex items-center w-[30%] px-[20px]">
                <p className="text-[12px] font-medium capitalize">NGN {order.totalAmount}</p>
            </div>

            <div className="flex flex-col w-[15%] px-[16px] justify-center">
                <p className="text-[14px] text-[#101828]">{formattedDate}</p>
                <p className="text-[14px] text-[#667085]">{formattedTime}</p>
            </div>

            <div className="flex flex-col gap-[4px] justify-center w-[20%] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    {order.deliveryInfo.method}
                </p>
            </div>
        </div>
    );
};

const PayoutTableRow = ({ payout, isLast }: { payout: PayoutResponse; isLast: boolean }) => {
    const formattedRequestDate = new Date(payout.requestedAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const formattedRequestTime = new Date(payout.requestedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return (
        <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : 'border-b border-[#EAECF0]'}`}>
            <div className="flex items-center w-[35%] px-[24px] gap-3">
                <div className="flex flex-col">
                    <p className="text-[14px] font-medium text-[#101828]">Payout #{payout.id}</p>
                </div>
            </div>

            <div className="flex items-center w-[30%] px-[20px]">
                <div className={`w-[50%] h-[22px] rounded-[8px] flex items-center justify-center ${
                    payout.isPaid
                        ? 'bg-[#ECFDF3] text-[#027A48]'
                        : 'bg-[#FFFAEB] text-[#B54708]'
                }`}>
                    <p className="text-[12px] font-medium capitalize">{payout.isPaid ? 'paid' : 'pending'}</p>
                </div>
            </div>

            <div className="flex flex-col w-[15%] px-[16px] justify-center">
                <p className="text-[14px] text-[#101828]">{formattedRequestDate}</p>
                <p className="text-[14px] text-[#667085]">{formattedRequestTime}</p>
            </div>

            <div className="flex flex-col gap-[4px] justify-center w-[20%] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    N {payout.paidAmount.toLocaleString()}.00
                </p>
            </div>
        </div>
    );
};

const Transactions = () => {
    const [activeView, setActiveView] = useState<'product-transactions' | 'pay-outs'>('product-transactions');
    const [currentPage, setCurrentPage] = useState(1);
    const [isPayoutRequestModalOpen, setIsPayoutRequestModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [payouts, setPayouts] = useState<PayoutResponse[]>([]);
    const [completedTransactions, setCompletedTransactions] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [payoutAmount, setPayoutAmount] = useState(0);
    const [filter, setFilter] = useState<'all' | 'today' | '1day' | '7days' | '30days'>('all');
    const [shopId, setShopId] = useState<number | null>(null);
    const [accountDetails, setAccountDetails] = useState<ShopAccountDetails | null>(null);

    const fetchShopData = useCallback(async () => {
        if (session?.user?.email) {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/getbyEmail?email=${session.user.email}`);
                const data = response.data;
                console.log("data for shop: ", data);

                if (data.id) {
                    setShopId(data.id);
                    const [countResponse, amountResponse, orderResponse, payoutAmountResponse, payoutsResponse, accountResponse] = await Promise.all([
                        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/getShopTransactionCount?shopId=${data.id}`),
                        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/getShopTransactionAmount?shopId=${data.id}`),
                        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/get-shop-orders?shopId=${data.id}`),
                        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/getPayoutAmount?shopId=${data.id}`),
                        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payout/allShop?shopId=${data.id}`),
                        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/get-account?shopId=${data.id}`)
                    ]);
                    setCompletedTransactions(countResponse.data);
                    setTotalSales(amountResponse.data);
                    setOrders(orderResponse.data);
                    setPayoutAmount(payoutAmountResponse.data);
                    setPayouts(payoutsResponse.data);
                    setAccountDetails(accountResponse.data);
                }
            } catch (error) {
                console.error('Error fetching shop data:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [session]);

    useEffect(() => {
        fetchShopData();
    }, [fetchShopData]);

    const handleOpenPayoutRequest = () => {
        setIsPayoutRequestModalOpen(true);
    };

    const handlePayoutRequestSuccess = () => {
        setIsPayoutRequestModalOpen(false);
        setIsSuccessModalOpen(true);
        fetchShopData(); // Refresh data after successful payout request
    };

    const handleUpdateAccount = async (details: ShopAccountDetails) => {
        if (!shopId) return false;
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/update-account?shopId=${shopId}`, details);
            setAccountDetails(details);
            return true;
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            toast.error(error.response?.data || 'Error updating account details');
            return false;
        }
    };
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
    const totalPages = Math.ceil(
        activeView === 'product-transactions'
            ? filteredOrders.length / PRODUCTS_PER_PAGE
            : payouts.length / PRODUCTS_PER_PAGE
    );

    const currentData = activeView === 'product-transactions'
        ? filteredOrders.slice(
            (currentPage - 1) * PRODUCTS_PER_PAGE,
            currentPage * PRODUCTS_PER_PAGE
        )
        : payouts.slice(
            (currentPage - 1) * PRODUCTS_PER_PAGE,
            currentPage * PRODUCTS_PER_PAGE
        );

    const handleCloseSuccessModal = () => {
        setIsSuccessModalOpen(false);
    };

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

    return (
        <>
            <DashboardHeader />
            <DashboardOptions />
            <div className="flex flex-col py-[30px] px-25">
                <div className="flex flex-col gap-[12px]">
                    <p className="text-[#022B23] text-[16px] font-medium">Transaction summary</p>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-[20px]">
                            <div className="flex hover:shadow-xl border-[0.5px] bg-[#FFFAEB] h-[100px] flex-col gap-[12px] p-[12px] border-[#F99007] rounded-[14px] w-[246px]">
                                <div className="flex items-center text-[#022B23] text-[12px] font-medium gap-[8px]">
                                    <Image src={biArrows} alt="Total amount earned" />
                                    <p>Total amount earned</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-[#18181B] hover:shadow-xl text-[16px] font-medium">N {totalSales.toLocaleString()}.00</p>
                                    <div className="flex gap-[4px] items-center">
                                        <Image src={arrowUp} alt="Increase" />
                                        <p className="text-[#22C55E] text-[12px] font-medium">2%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex hover:shadow-xl border-[0.5px] flex-col gap-[12px] p-[12px] border-[#E4E4E7] rounded-[14px] h-[110px] w-[324px]">
                                <div className="flex justify-between">
                                    <div className="flex items-center text-[#022B23] text-[12px] font-medium gap-[8px]">
                                        <Image src={exportImg} alt="Available for payout" />
                                        <p>Available for payout</p>
                                    </div>
                                    {payoutAmount >= 500 && (
                                        <span
                                            onClick={handleOpenPayoutRequest}
                                            className="text-[#C6EB5F] cursor-pointer flex justify-center items-center text-[12px] font-medium h-[30px] w-[113px] rounded-[100px] px-[8px] py-[6px] bg-[#022B23]"
                                        >
                                            Request payout
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-[#18181B] text-[16px] font-medium">N {payoutAmount.toLocaleString()}.00</p>
                                    <div className="flex gap-[4px] items-center">
                                        <Image src={arrowUp} alt="Increase" />
                                        <p className="text-[#22C55E] text-[12px] font-medium">2%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex hover:shadow-xl border-[0.5px] flex-col gap-[12px] p-[12px] border-[#E4E4E7] rounded-[14px] h-[100px] w-[246px]">
                                <div className="flex items-center text-[#71717A] text-[12px] font-medium gap-[8px]">
                                    <Image src={archiveImg} alt="Completed deliveries" />
                                    <p>Completed deliveries</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-[#18181B] text-[16px] font-medium">{completedTransactions}</p>
                                    <div className="flex gap-[4px] items-center">
                                        <Image src={arrowUp} alt="Increase" />
                                        <p className="text-[#22C55E] text-[12px] font-medium">2%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-[100px] border-[1px] border-[#ededed] rounded-[24px] pt-6 mb-10">
                <div className="flex items-center text-[#8C8C8C] text-[10px] w-[174px] mx-6 h-[26px] border-[0.5px] border-[#ededed] rounded-[8px] relative mb-4">
                    <div
                        className={`flex items-center justify-center w-[115px] h-full z-10 cursor-pointer ${
                            activeView === 'product-transactions'
                                ? 'border-r-[1px] border-[#ededed] rounded-tl-[8px] rounded-bl-[8px] bg-[#F8FAFB] text-[#8C8C8C]'
                                : ''
                        }`}
                        onClick={() => {
                            setActiveView('product-transactions');
                            setCurrentPage(1);
                        }}
                    >
                        <p>Product Transactions</p>
                    </div>
                    <div
                        className={`flex items-center justify-center w-[50%] h-full z-10 cursor-pointer ${
                            activeView === 'pay-outs'
                                ? 'border-l-[1px] border-[#ededed] rounded-tr-[8px] rounded-br-[8px] bg-[#F8FAFB] text-[#8C8C8C]'
                                : ''
                        }`}
                        onClick={() => {
                            setActiveView('pay-outs');
                            setCurrentPage(1);
                        }}
                    >
                        <p>Pay outs</p>
                    </div>
                    <div
                        className={`absolute top-0 h-full rounded-[6px] transition-all ${
                            activeView === 'product-transactions'
                                ? 'left-0 bg-[#F8FAFB]'
                                : 'left-[50%] bg-[#F8FAFB]'
                        }`}
                    ></div>
                </div>

                {activeView === 'product-transactions' ? (
                    <>
                        <div className="flex flex-col">
                            <div className="flex item-center justify-between">
                                <div className="mx-6 mb-6 flex flex-col">
                                    <p className="text-[#101828] font-medium">All transactions</p>
                                    <p className="text-[#667085] text-[14px]">View all your transaction details</p>
                                </div>
                                <FilterDropdown
                                    filter={filter}
                                    setFilter={setFilter}
                                    setCurrentPage={setCurrentPage}
                                />
                            </div>

                            <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                                <div className="flex items-center px-[24px] w-[35%] py-[12px] gap-[4px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Products</p>
                                    <Image src={arrowDown} alt="Sort" width={12} height={12} />
                                </div>
                                <div className="flex items-center px-[24px] w-[30%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Amount</p>
                                </div>
                                <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Date</p>
                                </div>
                                <div className="flex items-center px-[24px] w-[20%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Delivery method</p>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                {loading ? (
                                    <SkeletonLoader type="order" count={5} />
                                ) : currentData.length > 0 ? (
                                    currentData.map((item, index) => (
                                        <ProductTableRow
                                            key={item.id}
                                            order={item as OrderResponse}
                                            isLast={index === currentData.length - 1}
                                        />
                                    ))
                                ) : (
                                    <div className="flex justify-center items-center h-[200px]">
                                        <p>No transactions found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col">
                            <div className="flex item-center justify-between">
                                <div className="mx-6 mb-6 flex flex-col">
                                    <p className="text-[#101828] font-medium">All payouts</p>
                                    <p className="text-[#667085] text-[14px]">View all your payout details</p>
                                </div>
                            </div>

                            <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                                <div className="flex items-center px-[24px] w-[35%] py-[12px] gap-[4px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Payout</p>
                                </div>
                                <div className="flex items-center px-[24px] w-[30%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Status</p>
                                </div>
                                <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Request Date</p>
                                </div>
                                <div className="flex items-center px-[24px] w-[20%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Amount</p>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                {loading ? (
                                    <SkeletonLoader type="list" count={4} />
                                ) : currentData.length > 0 ? (
                                    currentData.map((item, index) => (
                                        <PayoutTableRow
                                            key={item.id}
                                            payout={item as PayoutResponse}
                                            isLast={index === currentData.length - 1}
                                        />
                                    ))
                                ) : (
                                    <div className="flex justify-center items-center h-[200px]">
                                        <p>No payouts found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {(activeView === 'product-transactions' ? orders.length > 0 : payouts.length > 0) && (
                    <div className="flex justify-between items-center mt-4 px-6 pb-6">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-md ${
                                currentPage === 1
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
                                    className={`w-8 h-8 rounded-md flex items-center justify-center ${
                                        currentPage === page
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
                            className={`px-4 py-2 rounded-md ${
                                currentPage === totalPages
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-[#022B23] hover:bg-gray-100'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {shopId && (
                <PayoutRequestModal
                    isPayoutRequestModalOpen={isPayoutRequestModalOpen}
                    onClosePayoutRequestModal={() => setIsPayoutRequestModalOpen(false)}
                    onRequestSuccess={handlePayoutRequestSuccess}
                    shopId={shopId}
                    amount={payoutAmount}
                    accountDetails={accountDetails}
                    onUpdateAccount={handleUpdateAccount}
                />
            )}

            <PayoutRequestSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleCloseSuccessModal}
            />
        </>
    );
};

export default Transactions;