import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { paymentService } from "../../services/paymentService";
import { PaymentTransactionResponse, PayoutResponse } from "../../services/paymentService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Transaction Details Modal
const TransactionDetailsModal = ({ transaction, onClose, onVerify }: {
    transaction: PaymentTransactionResponse;
    onClose: () => void;
    onVerify: () => void;
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'success':
            case 'completed':
            case '0':
                return 'bg-[#F9FDE8] text-[#0C4F24] border-[#0C4F24]';
            case 'pending':
                return 'bg-[#FFFAEB] text-[#B54708] border-[#B54708]';
            case 'failed':
            case 'cancelled':
                return 'bg-[#FFEBEB] text-[#F90707] border-[#F90707]';
            default:
                return 'bg-[#E7E7E7] text-[#1E1E1E] border-[#1E1E1E]';
        }
    };

    const formatStatus = (status: string) => {
        return status === '0' ? 'success' : status;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white px-[60px] py-[50px] w-[597px] h-[620px] shadow-lg relative">
                <div className="w-full flex justify-between h-[60px] border-b-[0.5px] border-[#D9D9D9]">
                    <div className="flex flex-col">
                        <p className="text-[#022B23] text-[16px] font-medium">Transaction Details</p>
                        <p className="text-[#707070] text-[14px] font-medium">View transaction information</p>
                    </div>
                    <span className={`w-[77px] text-[12px] font-medium flex justify-center items-center h-[32px] rounded-[8px] border ${getStatusColor(transaction.status)}`}>
                        {formatStatus(transaction.status)}
                    </span>
                </div>

                <div className="w-full flex flex-col h-[430px] pt-[20px] pb-[2px] gap-[30px]">
                    <div className="flex flex-col h-[79px] gap-[6px]">
                        <p className="text-[16px] font-semibold text-[#022B23]">ID: <span>#{transaction.id}</span></p>
                        <p className="text-[14px] font-medium text-[#707070]">Reference: <span className="text-[#000000]">{transaction.reference}</span></p>
                        <p className="text-[14px] font-medium text-[#707070]">Email: <span className="text-[#000000]">{transaction.email}</span></p>
                    </div>
                    <div className="flex flex-col w-full pr-[30px]">
                        <p className="text-[14px] text-[#022B23] font-medium">Transaction details</p>
                        <div className="flex flex-col w-full">
                            <div className="flex justify-between items-center">
                                <p className="text-[14px] text-[#707070] font-medium">Amount</p>
                                <p className="text-[14px] text-[#1E1E1E] font-medium">₦{transaction.amount.toLocaleString()}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-[14px] text-[#707070] font-medium">Payment Type</p>
                                <p className="text-[14px] text-[#1E1E1E] font-medium">{transaction.paymentType || 'N/A'}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-[14px] text-[#707070] font-medium">Date</p>
                                <p className="text-[14px] text-[#1E1E1E] font-medium">{formatDate(transaction.createdAt)}</p>
                            </div>
                            <div className="flex text-start justify-between items-center">
                                <p className="text-[14px] text-[#707070] font-medium">Time</p>
                                <p className="text-[14px] text-[#1E1E1E] font-medium">{formatTime(transaction.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-3 h-[46px] gap-[6px]">
                    {transaction.status?.toLowerCase() === 'pending' && (
                        <button
                            onClick={onVerify}
                            className="justify-center text-[16px] font-medium flex items-center text-white bg-[#022B23] px-4 rounded-[12px] hover:bg-[#033a30] mr-2"
                        >
                            Verify
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="justify-center text-[16px] font-medium flex items-center text-[#FF5050] w-[87px] border border-[#FF5050] rounded-[12px]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Actions Dropdown for Transactions
const TransactionActionsDropdown = ({
                                        transaction,
                                        onViewDetails,
                                        onVerify
                                    }: {
    transaction: PaymentTransactionResponse;
    onViewDetails: () => void;
    onVerify: () => void;
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
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={handleToggle}
                className="cursor-pointer flex flex-col gap-[3px] items-center justify-center"
            >
                <div className="flex flex-col gap-1">
                    <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                </div>
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-[8px] shadow-lg z-50 border border-[#ededed] w-[175px]">
                    <ul className="py-1">
                        <li
                            onClick={() => {
                                onViewDetails();
                                setIsOpen(false);
                            }}
                            className="px-[8px] py-[4px] text-[12px] hover:bg-[#f9f9f9] text-[#1E1E1E] cursor-pointer"
                        >
                            View transaction
                        </li>
                        {transaction.status?.toLowerCase() === 'pending' && (
                            <li
                                onClick={() => {
                                    onVerify();
                                    setIsOpen(false);
                                }}
                                className="px-[8px] py-[4px] text-[12px] hover:bg-[#f9f9f9] text-[#1E1E1E] cursor-pointer"
                            >
                                Verify transaction
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

// Actions Dropdown for Payouts
const PayoutActionsDropdown = ({
                                   payout,
                                   onTransfer
                               }: {
    payout: PayoutResponse;
    onTransfer: () => void;
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
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={handleToggle}
                className="cursor-pointer flex flex-col gap-[3px] items-center justify-center"
            >
                <div className="flex flex-col gap-1">
                    <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                </div>
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-[8px] shadow-lg z-50 border border-[#ededed] w-[120px]">
                    <ul className="py-1">
                        {!payout.isPaid && (
                            <li
                                onClick={() => {
                                    onTransfer();
                                    setIsOpen(false);
                                }}
                                className="px-[8px] py-[4px] text-[12px] hover:bg-[#f9f9f9] text-[#1E1E1E] cursor-pointer"
                            >
                                Transfer
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

// Transactions Table Component
const TransactionsTable = ({
                               transactions,
                               loading,
                               currentPage,
                               totalTransactions,
                               onPageChange,
                               onTransactionUpdated
                           }: {
    transactions: PaymentTransactionResponse[];
    loading: boolean;
    currentPage: number;
    totalTransactions: number;
    onPageChange: (page: number) => void;
    onTransactionUpdated: () => void;
}) => {
    const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransactionResponse | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const transactionsPerPage = 6;
    const totalPages = Math.ceil(totalTransactions / transactionsPerPage);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'success':
            case 'completed':
            case '0':
                return 'bg-[#F9FDE8] text-[#0C4F24]';
            case 'pending':
                return 'bg-[#FFFAEB] text-[#B54708]';
            case 'failed':
            case 'cancelled':
                return 'bg-[#FFEBEB] text-[#F90707]';
            default:
                return 'bg-[#E7E7E7] text-[#1E1E1E]';
        }
    };

    const handleViewDetails = (transaction: PaymentTransactionResponse) => {
        setSelectedTransaction(transaction);
        setShowModal(true);
    };

    const handleVerifyTransaction = async (transaction: PaymentTransactionResponse) => {
        setIsVerifying(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/verify?reference=${transaction.reference}`);

            if (response.data.status === true) {
                toast.success('Verified successfully');
                onTransactionUpdated();
            } else {
                toast.error('Transaction not found');
            }
        } catch (error: any) {
            if (error.response?.data) {
                try {
                    const errorData = typeof error.response.data === 'string'
                        ? JSON.parse(error.response.data)
                        : error.response.data;

                    toast.error('Transaction not found');
                } catch (parseError) {
                    toast.error('Transaction not found');
                }
            } else {
                toast.error('Transaction not found');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleModalVerify = () => {
        if (selectedTransaction) {
            handleVerifyTransaction(selectedTransaction);
            setShowModal(false);
        }
    };

    if (loading) {
        return (
            <div className="border-[0.5px] border-[#ededed] rounded-[24px] pt-6 mb-10">
                <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                    <div className="flex items-center px-[24px] w-[20%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Email</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Amount</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Status</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[20%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Payment Type</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Date</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Actions</p>
                    </div>
                </div>
                <div className="p-8 text-center">Loading transactions...</div>
            </div>
        );
    }

    return (
        <>
            <div className="border-[0.5px] border-[#ededed] rounded-[24px] pt-6 mb-10">
                <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                    <div className="flex items-center px-[24px] w-[20%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Email</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Amount</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Status</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[20%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Payment Type</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Date</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Actions</p>
                    </div>
                </div>

                <div className="flex flex-col">
                    {transactions.length === 0 ? (
                        <div className="flex justify-center items-center h-[200px]">
                            <p>No transactions found</p>
                        </div>
                    ) : (
                        (() => {
                            const startIndex = (currentPage - 1) * transactionsPerPage;
                            const endIndex = startIndex + transactionsPerPage;
                            const paginatedTransactions = transactions.slice(startIndex, endIndex);
                            
                            return paginatedTransactions.map((transaction, index) => (
                            <div key={transaction.id} className={`flex h-[72px] ${index !== paginatedTransactions.length - 1 ? 'border-b border-[#EAECF0]' : ''}`}>
                                <div className="flex items-center px-[24px] w-[20%]">
                                    <p className="text-[#101828] text-[14px] font-medium truncate">{transaction.email}</p>
                                </div>
                                <div className="flex items-center px-[24px] w-[15%]">
                                    <p className="text-[#101828] text-[14px]">₦{transaction.amount.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center px-[24px] w-[15%]">
                                    <div className={`px-2 py-1 rounded-[8px] flex items-center justify-center ${getStatusColor(transaction.status)}`}>
                                        <p className="text-[12px] font-medium">{transaction.status === '0' ? 'SUCCESS' : transaction.status}</p>
                                    </div>
                                </div>
                                <div className="flex items-center px-[24px] w-[20%]">
                                    <p className="text-[#101828] text-[14px] truncate">{transaction.paymentType || 'N/A'}</p>
                                </div>
                                <div className="flex flex-col justify-center px-[24px] w-[15%]">
                                    <p className="text-[#101828] text-[14px] font-medium">{formatDate(transaction.createdAt)}</p>
                                    <p className="text-[#667085] text-[14px]">{formatTime(transaction.createdAt)}</p>
                                </div>
                                <div className="flex items-center justify-center px-[24px] w-[15%]">
                                    <TransactionActionsDropdown
                                        transaction={transaction}
                                        onViewDetails={() => handleViewDetails(transaction)}
                                        onVerify={() => handleVerifyTransaction(transaction)}
                                    />
                                </div>
                            </div>
                            ));
                        })()
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 px-6 pb-6">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => onPageChange(page)}
                                        className={`w-8 h-8 rounded-md flex items-center justify-center ${
                                            currentPage === page
                                                ? 'bg-[#022B23] text-white'
                                                : 'text-[#022B23] hover:bg-gray-100'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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

            {showModal && selectedTransaction && (
                <TransactionDetailsModal
                    transaction={selectedTransaction}
                    onClose={() => setShowModal(false)}
                    onVerify={handleModalVerify}
                />
            )}
        </>
    );
};

// Payouts Table Component
const PayoutsTable = ({
                          payouts,
                          loading,
                          currentPage,
                          totalPayouts,
                          onPageChange,
                          onPayoutUpdated
                      }: {
    payouts: PayoutResponse[];
    loading: boolean;
    currentPage: number;
    totalPayouts: number;
    onPageChange: (page: number) => void;
    onPayoutUpdated: () => void;
}) => {
    const [isTransferring, setIsTransferring] = useState<number | null>(null);

    const payoutsPerPage = 6;
    const totalPages = Math.ceil(totalPayouts / payoutsPerPage);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleTransfer = async (payout: PayoutResponse) => {
        setIsTransferring(payout.id);
        try {
            const transferResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/transfer`, {
                name: payout.vendorName,
                amount: payout.paidAmount,
                accountNumber: payout.accountNumber,
                bankCode: payout.bankCode
            });

            toast.success(transferResponse.data || 'Transfer initiated successfully');

            try {
                const markPaidResponse = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payout/markAsPaid?id=${payout.id}`);
                toast.success('Payout marked as paid');
                onPayoutUpdated();
            } catch (markPaidError: any) {
                const errorMessage = markPaidError.response?.data || markPaidError.message || 'Failed to mark payout as paid';
                toast.error(errorMessage);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data || error.message || 'Failed to initiate transfer';
            toast.error(errorMessage);
        } finally {
            setIsTransferring(null);
        }
    };

    if (loading) {
        return (
            <div className="border-[0.5px] border-[#ededed] rounded-[24px] pt-6 mb-10">
                <div className="p-8 text-center">Loading payouts...</div>
            </div>
        );
    }

    return (
        <div className="border-[0.5px] border-[#ededed] rounded-[24px] pt-6 mb-10">
            <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                <div className="flex items-center px-[24px] w-[20%] py-[12px]">
                    <p className="text-[#667085] font-medium text-[12px]">Vendor</p>
                </div>
                <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                    <p className="text-[#667085] font-medium text-[12px]">Amount</p>
                </div>
                <div className="flex items-center px-[24px] w-[20%] py-[12px]">
                    <p className="text-[#667085] font-medium text-[12px]">Bank Details</p>
                </div>
                <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                    <p className="text-[#667085] font-medium text-[12px]">Status</p>
                </div>
                <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                    <p className="text-[#667085] font-medium text-[12px]">Requested</p>
                </div>
                <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                    <p className="text-[#667085] font-medium text-[12px]">Actions</p>
                </div>
            </div>

            <div className="flex flex-col">
                {payouts.length === 0 ? (
                    <div className="flex justify-center items-center h-[200px]">
                        <p>No payouts found</p>
                    </div>
                ) : (
                    (() => {
                        const startIndex = (currentPage - 1) * payoutsPerPage;
                        const endIndex = startIndex + payoutsPerPage;
                        const paginatedPayouts = payouts.slice(startIndex, endIndex);
                        
                        return paginatedPayouts.map((payout, index) => (
                        <div key={payout.id} className={`flex h-[72px] ${index !== paginatedPayouts.length - 1 ? 'border-b border-[#EAECF0]' : ''}`}>
                            <div className="flex items-center px-[24px] w-[20%]">
                                <p className="text-[#101828] text-[14px] font-medium truncate">{payout.vendorName}</p>
                            </div>
                            <div className="flex items-center px-[24px] w-[15%]">
                                <p className="text-[#101828] text-[14px]">₦{payout.paidAmount.toLocaleString()}</p>
                            </div>
                            <div className="flex flex-col justify-center px-[24px] w-[20%]">
                                <p className="text-[#101828] text-[14px] truncate">{payout.bankName}</p>
                                <p className="text-[#667085] text-[12px] truncate">{payout.accountNumber}</p>
                            </div>
                            <div className="flex items-center px-[24px] w-[15%]">
                                <div className={`px-2 py-1 rounded-[8px] flex items-center justify-center ${
                                    payout.isPaid ? 'bg-[#F9FDE8] text-[#0C4F24]' : 'bg-[#FFFAEB] text-[#B54708]'
                                }`}>
                                    <p className="text-[12px] font-medium">{payout.isPaid ? 'PAID' : 'PENDING'}</p>
                                </div>
                            </div>
                            <div className="flex items-center px-[24px] w-[15%]">
                                <p className="text-[#101828] text-[14px]">{formatDate(payout.requestedAt)}</p>
                            </div>
                            <div className="flex items-center justify-center px-[24px] w-[15%]">
                                {!payout.isPaid && (
                                    <button
                                        onClick={() => handleTransfer(payout)}
                                        disabled={isTransferring === payout.id}
                                        className="px-3 py-1 bg-[#022B23] text-white text-[12px] rounded hover:bg-[#033a30] disabled:opacity-50"
                                    >
                                        {isTransferring === payout.id ? 'Processing...' : 'Transfer'}
                                    </button>
                                )}
                            </div>
                        </div>
                        ));
                    })()
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 px-6 pb-6">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-8 h-8 rounded-md flex items-center justify-center ${
                                        currentPage === page
                                            ? 'bg-[#022B23] text-white'
                                            : 'text-[#022B23] hover:bg-gray-100'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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
    );
};

const AdminTransactionClient = () => {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') as 'transactions' | 'pay-outs' || 'transactions';
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
        setActiveTab(tab as 'transactions' | 'pay-outs');
    }, [searchParams]);

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        } else if (activeTab === 'pay-outs') {
            fetchPayouts();
        }
    }, [activeTab, fetchTransactions, fetchPayouts]);

    const handleTabChange = (tab: 'transactions' | 'pay-outs') => {
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
            </div>

            <div className="flex-1 p-[20px]">
                {activeTab === 'transactions' && (
                    <>
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
            </div>

            <ToastContainer />
        </div>
    );
};

export default AdminTransactionClient;