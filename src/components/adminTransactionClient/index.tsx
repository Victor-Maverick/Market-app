import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { paymentService } from "../../services/paymentService";
import { PaymentTransactionResponse, PayoutResponse } from "../../services/paymentService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Simple placeholder components
const TransactionsTable = ({ transactions, loading, currentPage, totalTransactions, onPageChange, onTransactionUpdated }: any) => {
    if (loading) {
        return <div className="p-4">Loading transactions...</div>;
    }
    
    return (
        <div className="p-4">
            <p>Transactions table - {transactions.length} transactions</p>
            <p>Page {currentPage} of {Math.ceil(totalTransactions / 10)}</p>
        </div>
    );
};

const PayoutsTable = ({ payouts, loading, currentPage, totalPayouts, onPageChange, onPayoutUpdated }: any) => {
    if (loading) {
        return <div className="p-4">Loading payouts...</div>;
    }
    
    return (
        <div className="p-4">
            <p>Payouts table - {payouts.length} payouts</p>
            <p>Page {currentPage} of {Math.ceil(totalPayouts / 10)}</p>
        </div>
    );
};

const RefundsTab = () => {
    return (
        <div className="p-4">
            <p>Refunds tab - Coming soon</p>
        </div>
    );
};

const AdminTransactionClient = () => {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') as 'transactions' | 'pay-outs' | 'refunds' || 'transactions';
    const [activeTab, setActiveTab] = useState(initialTab);
    const router = useRouter();
    const [transactions, setTransactions] = useState<PaymentTransactionResponse[]>([]);
    const [payouts, setPayouts] = useState<PayoutResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [totalPayouts, setTotalPayouts] = useState(0);
    const [totalTransactionAmount, setTotalTransactionAmount] = useState(0);
    const [totalPayoutAmount, setTotalPayoutAmount] = useState(0);

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await paymentService.getAllTransactions();
            setTransactions(response);
            setTotalTransactions(response.length);
            setTotalTransactionAmount(response.reduce((sum, t) => sum + (t.amount || 0), 0));
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    const fetchPayouts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await paymentService.getAllPayouts();
            setPayouts(response);
            setTotalPayouts(response.length);
            setTotalPayoutAmount(response.reduce((sum, p) => sum + (p.paidAmount || 0), 0));
        } catch (error) {
            console.error('Error fetching payouts:', error);
            toast.error('Failed to fetch payouts');
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    const handleTransactionUpdated = () => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        }
    };

    const handlePayoutUpdated = () => {
        if (activeTab === 'pay-outs') {
            fetchPayouts();
        }
    };

    useEffect(() => {
        const tab = searchParams.get('tab') || 'transactions';
        setActiveTab(tab as 'transactions' | 'pay-outs' | 'refunds');
    }, [searchParams]);

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        } else if (activeTab === 'pay-outs') {
            fetchPayouts();
        }
    }, [activeTab, fetchTransactions, fetchPayouts]);

    const handleTabChange = (tab: 'transactions' | 'pay-outs' | 'refunds') => {
        setActiveTab(tab);
        setCurrentPage(1);
        router.push(`/admin/dashboard/transactions?tab=${tab}`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="w-full flex border-b-[0.5px] border-[#ededed] text-[#022B23] text-[14px] font-medium h-[49px] px-[20px] items-center">
                <p>Transactions</p>
            </div>
            <div className="w-full flex border-b-[0.5px] border-[#ededed] text-[#1e1e1e] text-[14px] font-medium h-[49px] px-[20px] items-center">
                <p>View all transactions and payouts</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-[#ededed] px-[20px]">
                <button
                    onClick={() => handleTabChange('transactions')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'transactions'
                            ? 'border-[#022B23] text-[#022B23]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Transactions
                </button>
                <button
                    onClick={() => handleTabChange('pay-outs')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'pay-outs'
                            ? 'border-[#022B23] text-[#022B23]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Pay-outs
                </button>
                <button
                    onClick={() => handleTabChange('refunds')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'refunds'
                            ? 'border-[#022B23] text-[#022B23]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Refunds
                </button>
            </div>

            <div className="flex-1 p-[20px]">
                {activeTab === 'transactions' && (
                    <>
                        {/* Transaction Stats */}
                        <div className="flex w-full gap-[20px] mb-[20px] h-[86px]">
                            <div className="flex flex-col w-[270px] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#000000]">
                                    <p className="text-[#ffffff] text-[12px]">Total transactions</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    {loading ? (
                                        <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
                                    ) : (
                                        <p className="text-[20px] text-[#022B23] font-medium">{totalTransactions.toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col w-[270px] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#000000]">
                                    <p className="text-white text-[12px]">Total amount</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    {loading ? (
                                        <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
                                    ) : (
                                        <p className="text-[20px] text-[#022B23] font-medium">₦{totalTransactionAmount.toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <TransactionsTable
                            transactions={transactions}
                            loading={loading}
                            currentPage={currentPage}
                            totalTransactions={totalTransactions}
                            onPageChange={handlePageChange}
                            onTransactionUpdated={handleTransactionUpdated}
                        />
                    </>
                )}

                {activeTab === 'pay-outs' && (
                    <>
                        {/* Payout Stats */}
                        <div className="flex w-full gap-[20px] mb-[20px] h-[86px]">
                            <div className="flex flex-col w-[270px] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#000000]">
                                    <p className="text-[#ffffff] text-[12px]">Total payouts</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    {loading ? (
                                        <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
                                    ) : (
                                        <p className="text-[20px] text-[#022B23] font-medium">{totalPayouts.toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col w-[270px] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#000000]">
                                    <p className="text-white text-[12px]">Total amount</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    {loading ? (
                                        <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
                                    ) : (
                                        <p className="text-[20px] text-[#022B23] font-medium">₦{totalPayoutAmount.toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <PayoutsTable
                            payouts={payouts}
                            loading={loading}
                            currentPage={currentPage}
                            totalPayouts={totalPayouts}
                            onPageChange={handlePageChange}
                            onPayoutUpdated={handlePayoutUpdated}
                        />
                    </>
                )}

                {activeTab === 'refunds' && <RefundsTab />}
            </div>

            <ToastContainer />
        </div>
    );
};

export default AdminTransactionClient;