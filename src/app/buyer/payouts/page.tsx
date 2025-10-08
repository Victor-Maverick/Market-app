'use client'
import MarketPlaceHeader from "@/components/marketPlaceHeader";
import Image from "next/image";
import arrowRight from "../../../../public/assets/images/greyforwardarrow.svg";
import React, {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import axios from "axios";
import {ToastContainer, toast} from "react-toastify";
import { SkeletonLoader } from '@/components/LoadingSkeletons';
import { useSession } from "next-auth/react";

interface RefundResponse {
    id: number;
    orderId: number;
    orderNumber: string;
    buyerEmail: string;
    buyerName: string;
    vendorEmail: string;
    vendorName: string;
    shopName: string;
    refundAmount: number;
    reason: string;
    description: string;
    status: string;
    processedBy: string;
    refundReference: string;
    adminNotes: string;
    createdAt: string;
    processedAt: string;
}

interface Bank {
    name: string;
    code: string;
}

interface BankListResponse {
    status: boolean;
    message: string;
    data: Bank[];
}

const Payouts = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const [refunds, setRefunds] = useState<RefundResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [payoutAmount, setPayoutAmount] = useState(0);
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [payoutLoading, setPayoutLoading] = useState(false);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        const fetchRefunds = async () => {
            try {
                const userEmail = session?.user?.email || localStorage.getItem('userEmail');
                if (!userEmail) {
                    router.push('/login');
                    return;
                }

                const [refundsResponse, payoutResponse] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/refund/user?email=${userEmail}`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payout/get-user-payable?email=${userEmail}`)
                ]);

                setRefunds(refundsResponse.data);
                setPayoutAmount(payoutResponse.data);
            } catch (error) {
                console.error('Error fetching refunds:', error);
                toast.error('Failed to load payouts');
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.email) {
            fetchRefunds();
        }
    }, [router, session]);

    const fetchBanks = async () => {
        try {
            const response = await axios.get<BankListResponse>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/banks`);
            if (response.data.status && response.data.data) {
                setBanks(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching banks:', error);
            toast.error('Failed to load banks');
        }
    };

    const handlePayoutRequest = async () => {
        if (!selectedBank || !accountNumber || !amount || !session?.user?.email) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setPayoutLoading(true);
            const payoutData = {
                email: session.user.email,
                amount: parseFloat(amount),
                bankName: selectedBank.name,
                accountNumber: accountNumber,
                bankCode: selectedBank.code
            };

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/payout/request-user`,
                payoutData
            );
            
            toast.success('Payout request submitted successfully!');
            setIsPayoutModalOpen(false);
            setSelectedBank(null);
            setAccountNumber('');
            setAmount('');
            
            // Refresh payout amount
            if (session?.user?.email) {
                const payoutResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/payout/get-user-payable?email=${session.user.email}`
                );
                setPayoutAmount(payoutResponse.data);
            }
        } catch (error: any) {
            console.error('Error requesting payout:', error);
            toast.error(error.response?.data || 'Failed to request payout');
        } finally {
            setPayoutLoading(false);
        }
    };

    const openPayoutModal = () => {
        setIsPayoutModalOpen(true);
        fetchBanks();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
            case 'PROCESSED':
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
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <>
                <MarketPlaceHeader />
                <div className="h-[48px] w-full border-y-[0.5px] border-[#EDEDED]">
                    <div className="h-[48px] px-4 sm:px-6 lg:px-25 gap-[8px] items-center flex">
                        <BackButton variant="default" text="Go back" />
                        <p className="text-[12px] sm:text-[14px] text-[#3F3E3E]">Home // <span className="font-medium text-[#022B23]">Payouts</span></p>
                    </div>
                </div>
                <div className="px-4 sm:px-6 lg:px-25 pt-4 sm:pt-8 lg:pt-[62px] h-auto w-full">
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-[30px]">
                        {/* Sidebar skeleton */}
                        <div className="flex flex-col lg:block">
                            <div className="w-full lg:w-[200px] h-[44px] bg-gray-200 animate-pulse rounded-[10px] mb-2 lg:mb-0"></div>
                            <div className="w-full lg:w-[200px] h-[160px] bg-gray-200 animate-pulse rounded-[12px] mt-0 lg:mt-[6px]"></div>
                        </div>
                        
                        {/* Main content skeleton */}
                        <div className="flex flex-col w-full lg:w-[779px] gap-4 lg:gap-[24px]">
                            <div className="w-[200px] h-[20px] bg-gray-200 animate-pulse rounded"></div>
                            <div className="border-[0.5px] border-[#ededed] rounded-[12px] mb-[50px]">
                                <SkeletonLoader type="list" count={5} />
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
                    <p className="text-[12px] sm:text-[14px] text-[#3F3E3E]">Home // <span className="font-medium text-[#022B23]">Payouts</span></p>
                </div>
            </div>
            <div className="px-4 sm:px-6 lg:px-25 pt-4 sm:pt-8 lg:pt-[62px] h-auto w-full">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-[30px]">
                    {/* Sidebar */}
                    <div className="flex flex-col lg:block">
                        <div onClick={() => {router.push("/buyer/profile")}} className="w-full lg:w-[200px] text-[#022B23] text-[12px] font-medium h-[44px] bg-[#f8f8f8] rounded-[10px] flex items-center px-[8px] justify-between mb-2 lg:mb-0 cursor-pointer hover:bg-gray-100">
                            <p>Go to profile</p>
                            <Image src={arrowRight} alt={'image'}/>
                        </div>
                        <div className="flex flex-col h-auto lg:h-[160px] w-full lg:w-[200px] mt-[6px] rounded-[12px] border border-[#eeeeee]">
                            <div onClick={() => {router.push("/buyer/wishlist")}} className="w-full text-[#022B23] text-[12px] font-medium h-[40px] rounded-t-[12px] flex items-center px-[8px] cursor-pointer hover:bg-gray-50">
                                <p>Wishlist</p>
                            </div>
                            <div onClick={() => {router.push("/buyer/orders")}} className="w-full text-[#022B23] text-[12px] h-[40px] flex items-center px-[8px] cursor-pointer hover:bg-gray-50">
                                <p>My orders</p>
                            </div>
                            <div onClick={() => {router.push("/buyer/disputes")}} className="w-full text-[#022B23] text-[12px] h-[40px] flex items-center px-[8px] cursor-pointer hover:bg-gray-50">
                                <p>Order disputes</p>
                            </div>
                            <div onClick={() => {router.push("/buyer/payouts")}} className="w-full bg-[#f8f8f8] text-[#022B23] text-[12px] h-[40px] rounded-b-[12px] flex items-center px-[8px] cursor-pointer">
                                <p>Payouts</p>
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex flex-col w-full lg:w-[779px] gap-4 lg:gap-[24px]">
                        {/* Payout Container */}
                        <div className="flex hover:shadow-xl border-[0.5px] flex-col gap-[12px] p-[12px] border-[#E4E4E7] rounded-[14px] h-[110px] w-full lg:w-[324px]">
                            <div className="flex justify-between">
                                <div className="flex items-center text-[#022B23] text-[12px] font-medium gap-[8px]">
                                    <p>Available for payout</p>
                                </div>
                                {payoutAmount >= 1000 && (
                                    <span
                                        onClick={openPayoutModal}
                                        className="text-[#C6EB5F] cursor-pointer flex justify-center items-center text-[12px] font-medium h-[30px] w-[113px] rounded-[100px] px-[8px] py-[6px] bg-[#022B23] hover:bg-[#033d30]"
                                    >
                                        Request payout
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#18181B] text-[16px] font-medium">₦{payoutAmount.toLocaleString()}.00</p>
                                <div className="flex gap-[4px] items-center">
                                    <p className="text-[#22C55E] text-[12px] font-medium">Available</p>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-[#000000] text-[14px] sm:text-[16px] font-medium">My Payouts ({refunds.length})</p>
                        <div className="border-[0.5px] border-[#ededed] rounded-[12px] mb-[50px]">
                            {refunds.length === 0 ? (
                                <div className="flex items-center justify-center h-[100px] sm:h-[151px] text-[#3D3D3D] text-[14px]">
                                    <p>No payouts yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#f8f8f8] border-b border-[#ededed]">
                                            <tr>
                                                <th className="text-left p-4 text-[12px] font-medium text-[#7c7c7c]">Order #</th>
                                                <th className="text-left p-4 text-[12px] font-medium text-[#7c7c7c]">Shop</th>
                                                <th className="text-left p-4 text-[12px] font-medium text-[#7c7c7c]">Amount</th>
                                                <th className="text-left p-4 text-[12px] font-medium text-[#7c7c7c]">Reason</th>
                                                <th className="text-left p-4 text-[12px] font-medium text-[#7c7c7c]">Status</th>
                                                <th className="text-left p-4 text-[12px] font-medium text-[#7c7c7c]">Date</th>
                                                <th className="text-left p-4 text-[12px] font-medium text-[#7c7c7c]">Reference</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {refunds
                                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                .map((refund, index) => {
                                                    const isLastItem = index === refunds.length - 1;
                                                    return (
                                                        <tr key={refund.id} className={`${!isLastItem ? "border-b border-[#ededed]" : ""}`}>
                                                            <td className="p-4">
                                                                <p className="text-[14px] font-medium text-[#1E1E1E]">#{refund.orderNumber}</p>
                                                            </td>
                                                            <td className="p-4">
                                                                <p className="text-[14px] text-[#1E1E1E]">{refund.shopName}</p>
                                                                <p className="text-[12px] text-[#7c7c7c]">{refund.vendorName}</p>
                                                            </td>
                                                            <td className="p-4">
                                                                <p className="text-[14px] font-medium text-[#1E1E1E]">
                                                                    ₦{Number(refund.refundAmount).toLocaleString()}
                                                                </p>
                                                            </td>
                                                            <td className="p-4">
                                                                <p className="text-[14px] text-[#1E1E1E]">{refund.reason}</p>
                                                                {refund.description && (
                                                                    <p className="text-[12px] text-[#7c7c7c] mt-1">{refund.description}</p>
                                                                )}
                                                            </td>
                                                            <td className="p-4">
                                                                <div className={`inline-flex h-[32px] px-3 items-center text-[12px] font-medium justify-center rounded-[100px] ${getStatusColor(refund.status)}`}>
                                                                    <p>{refund.status}</p>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <p className="text-[14px] text-[#1E1E1E]">{formatDate(refund.createdAt)}</p>
                                                                {refund.processedAt && (
                                                                    <p className="text-[12px] text-[#7c7c7c]">Processed: {formatDate(refund.processedAt)}</p>
                                                                )}
                                                            </td>
                                                            <td className="p-4">
                                                                <p className="text-[14px] text-[#1E1E1E]">{refund.refundReference || 'N/A'}</p>
                                                                {refund.adminNotes && (
                                                                    <p className="text-[12px] text-[#7c7c7c] mt-1">{refund.adminNotes}</p>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Payout Modal */}
            {isPayoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsPayoutModalOpen(false)}>
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Request Payout</h2>
                            <button onClick={() => setIsPayoutModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                ×
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Available amount:</p>
                            <p className="text-xl font-bold text-green-600">₦{payoutAmount.toLocaleString()}.00</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                                <select
                                    value={selectedBank?.code || ''}
                                    onChange={(e) => {
                                        const bank = banks.find(b => b.code === e.target.value);
                                        setSelectedBank(bank || null);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    required
                                >
                                    <option value="">Select a bank</option>
                                    {banks.map((bank) => (
                                        <option key={bank.code} value={bank.code}>
                                            {bank.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    placeholder="Enter account number"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    max={payoutAmount}
                                    min="1000"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    placeholder="Enter amount"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsPayoutModalOpen(false)}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePayoutRequest}
                                disabled={payoutLoading || !selectedBank || !accountNumber || !amount}
                                className="flex-1 px-4 py-2 bg-[#022B23] text-white rounded-md hover:bg-[#033d30] disabled:opacity-50"
                            >
                                {payoutLoading ? 'Processing...' : 'Request Payout'}
                            </button>
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

export default Payouts;