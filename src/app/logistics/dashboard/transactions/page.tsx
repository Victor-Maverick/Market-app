'use client'
import LogisticsCompanyGuard from "@/components/LogisticsCompanyGuard";
import DashboardHeader from "@/components/dashboardHeader";
import LogisticsDashboardOptions from "@/components/logisticsDashboardOptions";
import Image, { StaticImageData } from "next/image";
import biArrows from "../../../../../public/assets/images/biArrows.svg";
import arrowUp from "../../../../../public/assets/images/arrow-up.svg";
import exportImg from "../../../../../public/assets/images/exportImg.svg";
import archiveImg from "../../../../../public/assets/images/archive.svg";
import Stats from "../../../../../public/assets/images/Stats.svg";
import { useEffect, useState } from "react";
import iPhone from "../../../../../public/assets/images/blue14.png";
import arrowDown from "../../../../../public/assets/images/arrow-down.svg";
import PayoutRequestSuccessModal from "@/components/payoutRequestSuccessModal";
import {
    logisticsService,
    type DeliveryResponse,
} from "@/services/logisticsService"
import { useSession } from "next-auth/react";
import { SkeletonLoader } from "@/components/LoadingSkeletons";

interface Product {
    id: number;
    orderNumber: string;
    image: StaticImageData;
    name: string;
    date: string;
    status: 'Paid' | 'Pending';
    deliveryMethod: string;
    time: string;
    deliveryAddress: string;
    fee: number;
}

const ProductTableRow = ({ product, isLast }: { product: Product; isLast: boolean }) => {
    return (
        <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}>
            <div className="flex items-center w-[35%] pr-[24px] gap-3">
                <div className="bg-[#f9f9f9] h-full w-[70px] overflow-hidden mt-[2px]">
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={70}
                        height={70}
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-[14px] font-medium text-[#101828]">{product.name}</p>
                    <p className="text-[12px] text-[#667085]">ID: #{product.orderNumber}</p>
                </div>
            </div>

            <div className="flex items-center w-[13%] px-[20px]">
                <div className={`w-[55px] h-[22px] rounded-[8px] flex items-center justify-center ${
                    product.status === 'Paid'
                        ? 'bg-[#ECFDF3] text-[#027A48]'
                        : 'bg-[#FEF3F2] text-[#FF5050]'
                }`}>
                    <p className="text-[12px] font-medium">{product.status}</p>
                </div>
            </div>

            <div className="flex flex-col w-[17%] px-[16px] justify-center">
                <p className="text-[14px] text-[#101828]">{product.date}</p>
                <p className="text-[14px] text-[#667085]">{product.time}</p>
            </div>

            <div className="flex flex-col gap-[4px] justify-center w-[20%] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    {product.deliveryMethod}
                </p>
                <p className="text-[12px] w-[176px] leading-tight text-[#667085]">
                    {product.deliveryAddress}
                </p>
            </div>

            <div className="flex items-center w-[17%] px-[28px]">
                <p className="text-[14px] text-[#101828]">NGN {product.fee.toLocaleString()}.00</p>
            </div>
        </div>
    );
};

const Transactions = () => {
    const [activeView, setActiveView] = useState<'product-transactions' | 'pay-outs'>('product-transactions');
    const [currentPage, setCurrentPage] = useState(1);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [orders, setOrders] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.email) {
                setLoading(true);
                try {
                    const orderData = await logisticsService.getAllCompanyOrders(session.user.email);
                    // Map DeliveryResponse to Product type
                    const mappedOrders: Product[] = orderData.map((order: DeliveryResponse) => ({
                        id: order.id,
                        orderNumber: order.orderNumber,
                        image: iPhone, // Using default image since DeliveryResponse doesn't include image
                        name: order.customerName, // Using customerName as product name
                        date: new Date(order.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        }),
                        status: order.grandTotal > 0 ? 'Paid' : 'Pending', // Assuming paid if grandTotal exists
                        deliveryMethod: order.deliveryMethod,
                        time: new Date(order.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        }),
                        deliveryAddress: order.deliveryAddress,
                        fee: order.deliveryFee
                    }));
                    setOrders(mappedOrders);
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [session]);

    const productsPerPage = 5;
    const totalPages = Math.ceil(orders.length / productsPerPage);
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = orders.slice(indexOfFirstProduct, indexOfLastProduct);

    const handleCloseSuccessModal = () => setIsSuccessModalOpen(false);

    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <LogisticsCompanyGuard>
            <DashboardHeader />
            <LogisticsDashboardOptions />
            <div className="flex flex-col py-[30px] px-25">
                <div className="flex flex-col gap-[12px]">
                    <p className="text-[#022B23] text-[16px] font-medium">Transaction summary</p>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-[20px]">
                            <div className="flex border-[0.5px] bg-[#FFFAEB] h-[100px] flex-col gap-[12px] p-[12px] border-[#F99007] rounded-[14px] w-[246px]">
                                <div className="flex items-center text-[#022B23] text-[12px] font-medium gap-[8px]">
                                    <Image src={biArrows} alt="Total amount earned" />
                                    <p>Total amount earned</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-[#18181B] text-[16px] font-medium">N102,426,231.00</p>
                                    <div className="flex gap-[4px] items-center">
                                        <Image src={arrowUp} alt="Increase" />
                                        <p className="text-[#22C55E] text-[12px] font-medium">2%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex border-[0.5px] flex-col gap-[12px] p-[12px] border-[#E4E4E7] rounded-[14px] h-[110px] w-[324px]">
                                <div className="flex justify-between">
                                    <div className="flex items-center text-[#022B23] text-[12px] font-medium gap-[8px]">
                                        <Image src={exportImg} alt="Available for payout" />
                                        <p>Available for payout</p>
                                    </div>
                                    <span
                                        className="text-[#C6EB5F] cursor-pointer flex justify-center items-center text-[12px] font-medium h-[30px] w-[113px] rounded-[100px] px-[8px] py-[6px] bg-[#022B23]"
                                    >
                                        Request payout
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-[#18181B] text-[16px] font-medium">N84,426,231.00</p>
                                    <div className="flex gap-[4px] items-center">
                                        <Image src={arrowUp} alt="Increase" />
                                        <p className="text-[#22C55E] text-[12px] font-medium">2%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex border-[0.5px] flex-col gap-[12px] p-[12px] border-[#E4E4E7] rounded-[14px] h-[100px] w-[246px]">
                                <div className="flex items-center text-[#71717A] text-[12px] font-medium gap-[8px]">
                                    <Image src={archiveImg} alt="Completed deliveries" />
                                    <p>Completed deliveries</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-[#18181B] text-[16px] font-medium">720</p>
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
                        onClick={() => setActiveView('product-transactions')}
                    >
                        <p>Product Transactions</p>
                    </div>
                    <div
                        className={`flex items-center justify-center w-[50%] h-full z-10 cursor-pointer ${
                            activeView === 'pay-outs'
                                ? 'border-l-[1px] border-[#ededed] rounded-tr-[8px] rounded-br-[8px] bg-[#F8FAFB] text-[#8C8C8C]'
                                : ''
                        }`}
                        onClick={() => setActiveView('pay-outs')}
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
                            <div className="mx-6 mb-6 flex flex-col">
                                <p className="text-[#101828] font-medium">All transactions</p>
                                <p className="text-[#667085] text-[14px]">View all your transaction details</p>
                            </div>

                            <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                                <div className="flex items-center px-[24px] w-[35%] py-[12px] gap-[4px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Order</p>
                                    <Image src={arrowDown} alt="Sort" width={12} height={12} />
                                </div>
                                <div className="flex items-center px-[24px] w-[13%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Status</p>
                                </div>
                                <div className="flex items-center px-[24px] w-[17%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Date</p>
                                </div>
                                <div className="flex items-center px-[24px] w-[20%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Delivery method</p>
                                </div>
                                <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Fee earned</p>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                {loading ? (
                                    <SkeletonLoader type="table" count={5} />
                                ) : currentProducts.length > 0 ? (
                                    currentProducts.map((product, index) => (
                                        <ProductTableRow
                                            key={product.id}
                                            product={product}
                                            isLast={index === currentProducts.length - 1}
                                        />
                                    ))
                                ) : (
                                    <p className="text-center my-[30px]">No transactions available</p>
                                )}
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex justify-between items-center p-6">
                                <button
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-md ${
                                        currentPage === 1
                                            ? 'bg-gray-200 cursor-not-allowed'
                                            : 'bg-[#022B23] text-white hover:bg-[#033a30]'
                                    }`}
                                >
                                    Previous
                                </button>

                                <span className="text-[#667085]">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-md ${
                                        currentPage === totalPages
                                            ? 'bg-gray-200 cursor-not-allowed'
                                            : 'bg-[#022B23] text-white hover:bg-[#033a30]'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex text-[#7A7A7A] text-[14px] mt-[30px] font-semibold justify-between items-center">
                            <p>ORDERS</p>
                            <select className="text-[#707070] text-[12px] border-[1px] p-[10px] border-[#F2F2F2] shadow-xs w-[123px] h-[38px] rounded-[8px] bg-white">
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>Last 90 days</option>
                            </select>
                        </div>

                        <div className="flex justify-between items-center my-5">
                            <div className="flex items-center gap-[5px]">
                                <h3 className="text-[#18181B] font-medium text-[44px]">1.4K</h3>
                                <div className="flex items-center w-[45px] h-[20px] text-[12px] font-medium rounded-[4px] text-[#377E36] bg-[#E0F0E4] justify-center">
                                    <p>+3.4%</p>
                                </div>
                            </div>
                        </div>

                        <Image src={Stats} alt="Statistics graph" className="mb-[20px]"/>

                        <div className="flex items-center justify-between gap-4">
                            <div className="w-[234px] border-[1px] flex flex-col border-[#EDEDED] gap-[9px] rounded-lg p-4">
                                <div className="flex items-center gap-[9px]">
                                    <span className="rounded-full w-[6px] h-[6px] bg-[#C6EB5F]"></span>
                                    <p className="text-[#707070] text-[12px]">DELIVERED</p>
                                </div>
                                <div className="flex w-[108px] h-[28px] items-center gap-[10px]">
                                    <span className="text-[#18181B] font-medium text-[20px]">900</span>
                                    <div className="flex bg-[#E0F0E4] w-[53px] px-[4px] py-[2px] rounded-[100px] items-center justify-center">
                                        <span className="text-[#377E36] font-medium text-[12px]">+44.3%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-[326px] border-[1px] flex flex-col border-[#EDEDED] gap-[9px] rounded-[8px] p-4">
                                <div className="flex items-center gap-[9px]">
                                    <span className="rounded-full w-[6px] h-[6px] bg-[#1E1E1E]"></span>
                                    <p className="text-[#707070] text-[12px]">EN-ROUTE</p>
                                </div>
                                <div className="flex w-[108px] h-[28px] items-center gap-[10px]">
                                    <span className="text-[#18181B] font-medium text-[20px]">82</span>
                                    <div className="flex bg-[#E0F0E4] w-[53px] px-[4px] py-[2px] rounded-[100px] items-center justify-center">
                                        <span className="text-[#377E36] font-medium text-[12px]">+11.4%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-[234px] border-[1px] flex flex-col border-[#EDEDED] gap-[9px] rounded-lg p-4">
                                <div className="flex items-center gap-[9px]">
                                    <span className="rounded-full w-[6px] h-[6px] bg-[#1E1E1E]"></span>
                                    <p className="text-[#707070] text-[12px]">PENDING</p>
                                </div>
                                <div className="flex w-[108px] h-[28px] items-center gap-[10px]">
                                    <span className="text-[#18181B] font-medium text-[20px]">200</span>
                                    <div className="flex bg-[#FEECEB] w-[53px] px-[4px] py-[2px] rounded-[100px] items-center justify-center">
                                        <span className="text-[#B12F30] font-medium text-[12px]">-1.03%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-[234px] border-[1px] flex flex-col border-[#EDEDED] gap-[9px] rounded-lg p-4">
                                <div className="flex items-center gap-[9px]">
                                    <span className="rounded-full w-[6px] h-[6px] bg-[#1E1E1E]"></span>
                                    <p className="text-[#707070] text-[12px]">FAILED ORDERS</p>
                                </div>
                                <div className="flex w-[108px] h-[28px] items-center gap-[10px]">
                                    <span className="text-[#18181B] font-medium text-[20px]">12</span>
                                    <div className="flex bg-[#FEECEB] w-[53px] px-[4px] py-[2px] rounded-[100px] items-center justify-center">
                                        <span className="text-[#B12F30] font-medium text-[12px]">-1.03%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <PayoutRequestSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleCloseSuccessModal}
            />
        </LogisticsCompanyGuard>
    );
};

export default Transactions;
