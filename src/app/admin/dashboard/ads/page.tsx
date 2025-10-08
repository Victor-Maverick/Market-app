'use client'
import {useEffect, useRef, useState} from "react";
import Image from "next/image";
import searchImg from "../../../../../public/assets/images/search-normal.png";
import arrowDown from "../../../../../public/assets/images/arrow-down.svg";
import TierEditModal from "@/components/tierEditModal";
import { cleanPaymentType } from "@/utils/paymentUtils";
import { getStatusStyling, getStatusText } from "@/utils/statusUtils";

interface Tier {
    id: number;
    tier: string;
    price: number;
    shopsPromoted: number;
    benefits: string[];
    updateTime: string;
}

interface TransactionDetails {
    id: number;
    reference: string;
    email: string;
    amount: number;
    status: string;
    paymentType: string | null;
    createdAt: string;
    payerName?: string;
    bankDetails?: {
        bankName?: string;
        accountNumber?: string;
    };
}

const TransactionDetailsModal = ({
                                     transactionId,
                                     onClose,
                                 }: {
    transactionId: number;
    onClose: () => void;
}) => {
    const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTransactionDetails = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/transaction?id=${transactionId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch transaction details');
                }
                const data = await response.json();
                setTransactionDetails(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch transaction details');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [transactionId]);

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(amount / 100); // Assuming amount is in kobo
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#808080]/20">
                <div className="bg-white px-[60px] py-[50px] w-[597px] h-[620px] shadow-lg relative flex items-center justify-center">
                    <p>Loading transaction details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#808080]/20">
                <div className="bg-white px-[60px] py-[50px] w-[597px] h-[620px] shadow-lg relative flex items-center justify-center">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    if (!transactionDetails) {
        return (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#808080]/20">
                <div className="bg-white px-[60px] py-[50px] w-[597px] h-[620px] shadow-lg relative flex items-center justify-center">
                    <p>No transaction details found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white px-[60px] py-[50px] w-[597px] h-[620px] shadow-lg relative">
                <div className="w-full flex justify-between h-[60px] border-b-[0.5px] border-[#D9D9D9]">
                    <div className={`flex flex-col`}>
                        <p className={`text-[#022B23] text-[16px] font-medium`}>View details</p>
                        <p className="text-[#707070] text-[14px] font-medium">View details of transaction</p>
                    </div>
                    <span className={`w-[77px] text-[12px] font-medium flex justify-center items-center h-[32px] rounded-[8px] border ${getStatusStyling(transactionDetails.status)}`}>
                        {getStatusText(transactionDetails.status)}
                    </span>
                </div>

                <div className="w-full flex flex-col h-[430px] pt-[20px] pb-[2px] gap-[30px]">
                    <div className="flex flex-col h-[79px] gap-[6px]">
                        <p className="text-[16px] font-semibold text-[#022B23]">ID: <span>#{transactionDetails.id}</span></p>
                        <p className="text-[14px] font-medium text-[#707070]">Type: <span className="text-[#000000]">{cleanPaymentType(transactionDetails.paymentType)}</span></p>
                    </div>
                    <div className="flex flex-col w-full pr-[30px]">
                        <p className="text-[14px] text-[#022B23] font-medium">Tier details</p>
                        <div className="flex flex-col w-full">
                            <div className="flex justify-between items-center">
                                <p className="text-[14px] text-[#707070] font-medium">Tier amount</p>
                                <p className="text-[14px] text-[#1E1E1E] font-medium">{formatCurrency(transactionDetails.amount)}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-[14px] text-[#707070] font-medium">Date promoted</p>
                                <p className="text-[14px] text-[#1E1E1E] font-medium">{formatDate(transactionDetails.createdAt)}</p>
                            </div>
                            <div className="flex text-start justify-between items-center">
                                <p className="text-[14px] text-[#707070] font-medium">Time</p>
                                <p className="text-[14px] text-[#1E1E1E] font-medium">{formatTime(transactionDetails.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-3 h-[46px] gap-[6px]">
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

const ActionsDropdown = ({
                             children,
                             transactionId,
                             transaction,
                             onTransactionUpdate,
                         }: {
    children: React.ReactNode;
    transactionId: number;
    transaction: TransactionDetails;
    onTransactionUpdate: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleViewDetails = () => {
        setShowModal(true);
        setIsOpen(false);
    };

    const handleVerifyTransaction = async () => {
        setIsVerifying(true);
        setIsOpen(false);
        
        try {
            // First verify the payment
            const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/verify?reference=${transaction.reference}`);
            if (!verifyResponse.ok) {
                throw new Error('Failed to verify payment');
            }
            
            const verifyData = await verifyResponse.json();
            
            if (verifyData.status === 'success' && verifyData.data?.status?.toLowerCase().includes('success')) {
                // Update the transaction
                const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/update?reference=${transaction.reference}`, {
                    method: 'PUT'
                });
                
                if (!updateResponse.ok) {
                    throw new Error('Failed to update transaction');
                }
                
                const updateData = await updateResponse.json();
                alert(`Transaction verified and updated successfully: ${updateData}`);
                onTransactionUpdate();
            } else {
                alert('Payment verification failed or payment is not successful');
            }
        } catch (error) {
            console.error('Error verifying transaction:', error);
            alert('Failed to verify transaction');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleCloseModal = () => setShowModal(false);

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
                {children}
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-[8px] shadow-lg z-50 border border-[#ededed] w-[175px]">
                    <ul className="py-1">
                        <li
                            onClick={handleViewDetails}
                            className="px-[8px] py-[4px] text-[12px] hover:bg-[#f9f9f9] text-[#1E1E1E] cursor-pointer"
                        >
                            View transaction details
                        </li>
                        {transaction.status?.toLowerCase() === 'pending' && (
                            <li
                                onClick={handleVerifyTransaction}
                                className={`px-[8px] py-[4px] text-[12px] hover:bg-[#f9f9f9] text-[#1E1E1E] cursor-pointer ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isVerifying ? 'Verifying...' : 'Verify transaction'}
                            </li>
                        )}
                    </ul>
                </div>
            )}

            {showModal && (
                <TransactionDetailsModal
                    transactionId={transactionId}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

const AdsTableRow = ({ transaction, isLast, onTransactionUpdate }: { transaction: TransactionDetails; isLast: boolean; onTransactionUpdate: () => void }) => {
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

    return (
        <>
            {/* Desktop Row */}
            <div className={`hidden lg:flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}>
                <div className="flex items-center pl-[15px] w-[20%] ">
                    <p className="text-[#101828] text-[14px] font-medium">{cleanPaymentType(transaction.paymentType)}</p>
                </div>

                <div className="flex flex-col justify-center w-[25%] px-[15px]">
                    <p className="text-[#101828] text-[14px] font-medium">{transaction.payerName}</p>
                    <p className="text-[#667085] text-[14px]">{transaction.email}</p>
                </div>

                <div className="flex items-center w-[20%] pl-[24px]">
                    <p className="text-[#101828] text-[14px]">{transaction.amount/100}</p>
                </div>

                <div className="flex flex-col justify-center w-[15%] ">
                    <p className="text-[#101828] text-[14px] font-medium">{formatDate(transaction.createdAt)}</p>
                    <p className="text-[#667085] text-[14px]">{formatTime(transaction.createdAt)}</p>
                </div>

                <div className={`flex items-center w-[19%] px-[10px]`}>
                    <div className={`w-[55px] h-[22px] rounded-[8px] flex items-center justify-center ${getStatusStyling(transaction.status)}`}>
                        <p className="text-[12px] font-medium">
                            {getStatusText(transaction.status)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center w-[3%]">
                    <ActionsDropdown transactionId={transaction.id} transaction={transaction} onTransactionUpdate={onTransactionUpdate}>
                        <div className="flex flex-col gap-1">
                            <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                            <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                            <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                        </div>
                    </ActionsDropdown>
                </div>
            </div>

            {/* Mobile Card */}
            <div className={`lg:hidden p-[15px] ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <p className="text-[#101828] text-[13px] font-medium mb-1">{cleanPaymentType(transaction.paymentType)}</p>
                        <p className="text-[#101828] text-[12px] font-medium">{transaction.payerName}</p>
                        <p className="text-[#667085] text-[11px]">{transaction.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-[6px] flex items-center justify-center ${getStatusStyling(transaction.status)}`}>
                            <p className="text-[10px] font-medium">
                                {getStatusText(transaction.status)}
                            </p>
                        </div>
                        <ActionsDropdown transactionId={transaction.id} transaction={transaction} onTransactionUpdate={onTransactionUpdate}>
                            <div className="flex flex-col gap-1 p-1">
                                <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                                <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                                <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                            </div>
                        </ActionsDropdown>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[#101828] text-[12px] font-medium">₦{transaction.amount/100}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[#101828] text-[11px] font-medium">{formatDate(transaction.createdAt)}</p>
                        <p className="text-[#667085] text-[10px]">{formatTime(transaction.createdAt)}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

const Ads = () => {
    const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [transactions, setTransactions] = useState<TransactionDetails[]>([]);
    const [totalPromotionAmount, setTotalPromotionAmount] = useState<number>(0);
    const [vendorFee, setVendorFee] = useState<number>(5000);
    const [isEditingFee, setIsEditingFee] = useState(false);
    const [newFeeAmount, setNewFeeAmount] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const transactionsPerPage = 5;
    const [loading, setLoading] = useState({
        tiers: true,
        transactions: true,
        totalPromotionAmount: true
    });
    const [error, setError] = useState({
        tiers: '',
        transactions: '',
        totalPromotionAmount: ''
    });

    const fetchTiers = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/all-tiers`);
            if (!response.ok) {
                throw new Error('Failed to fetch tiers');
            }
            const data = await response.json();
            setTiers(data);
            console.log("Tiers: ",data)
        } catch (err) {
            setError(prev => ({...prev, tiers: err instanceof Error ? err.message : 'Failed to fetch tiers'}));
        } finally {
            setLoading(prev => ({...prev, tiers: false}));
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/allPromotion`);
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
            const data = await response.json();
            setTransactions(data);
            console.log("Transactions:: ",data)
        } catch (err) {
            setError(prev => ({...prev, transactions: err instanceof Error ? err.message : 'Failed to fetch transactions'}));
        } finally {
            setLoading(prev => ({...prev, transactions: false}));
        }
    };

    const fetchTotalPromotionAmount = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/allPromotionAmount`);
            if (!response.ok) {
                throw new Error('Failed to fetch total promotion amount');
            }
            const data = await response.json();
            setTotalPromotionAmount(data);
        } catch (err) {
            setError(prev => ({...prev, totalPromotionAmount: err instanceof Error ? err.message : 'Failed to fetch total promotion amount'}));
        } finally {
            setLoading(prev => ({...prev, totalPromotionAmount: false}));
        }
    };

    const fetchVendorFee = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/get-vendor-fee`);
            if (!response.ok) {
                throw new Error('Failed to fetch vendor fee');
            }
            const data = await response.json();
            setVendorFee(data || 5000); // Default to 5000 if null
        } catch (err) {
            console.error('Error fetching vendor fee:', err);
            setVendorFee(5000); // Default to 5000 on error
        }
    };

    const updateVendorFee = async (amount: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/update-vendor-fee?amount=${amount}`, {
                method: 'PUT',
            });
            if (!response.ok) {
                throw new Error('Failed to update vendor fee');
            }
            setVendorFee(amount);
            setIsEditingFee(false);
            setNewFeeAmount('');
        } catch (err) {
            console.error('Error updating vendor fee:', err);
            alert('Failed to update vendor fee');
        }
    };

    const handleEditFee = () => {
        setIsEditingFee(true);
        setNewFeeAmount(vendorFee.toString());
    };

    const handleSaveFee = () => {
        const amount = parseFloat(newFeeAmount);
        if (isNaN(amount) || amount < 0) {
            alert('Please enter a valid amount');
            return;
        }
        updateVendorFee(amount);
    };

    const handleCancelEdit = () => {
        setIsEditingFee(false);
        setNewFeeAmount('');
    };

    useEffect(() => {
        fetchTiers();
        fetchTransactions();
        fetchTotalPromotionAmount();
        fetchVendorFee();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Filter transactions based on search term
    const filteredTransactions = transactions.filter(transaction =>
        transaction.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.payerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cleanPaymentType(transaction.paymentType).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Reset to first page when search term changes
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <>
            <div className="w-full flex border-b-[0.5px] border-[#ededed] text-[#022B23] text-[14px] font-medium h-[49px] px-[20px] items-center">
                <p>Ads and promotion</p>
            </div>
            <div className="w-full flex border-b-[0.5px] border-[#ededed] text-[#1e1e1e] text-[14px] font-medium h-[49px] px-[20px] items-center">
                <p>View all ads and promotions</p>
            </div>
            <div className="p-[15px] sm:p-[20px]">
                {loading.tiers || loading.totalPromotionAmount ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-[15px] sm:gap-[20px] h-auto">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex flex-col rounded-[12px] sm:rounded-[14px] h-[70px] sm:h-[86px] border-[#EAEAEA] border-[0.5px] animate-pulse">
                                <div className="w-full h-[28px] sm:h-[34px] rounded-tl-[12px] rounded-tr-[12px] sm:rounded-tl-[14px] sm:rounded-tr-[14px] bg-gray-200"></div>
                                <div className="flex-1 flex justify-center flex-col p-[10px] sm:p-[14px]">
                                    <div className="h-4 sm:h-6 w-3/4 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error.tiers || error.totalPromotionAmount ? (
                    <div className="text-red-500">{error.tiers || error.totalPromotionAmount}</div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-[15px] sm:gap-[20px] h-auto">
                        <div className="flex flex-col rounded-[12px] sm:rounded-[14px] h-[70px] sm:h-[86px] border-[#EAEAEA] border-[0.5px]">
                            <div className="w-full px-[10px] sm:px-[14px] flex items-center rounded-tl-[12px] rounded-tr-[12px] sm:rounded-tl-[14px] sm:rounded-tr-[14px] h-[28px] sm:h-[34px] bg-[#000000]">
                                <p className="text-[#ffffff] text-[10px] sm:text-[12px] truncate">Total promotions earnings</p>
                            </div>
                            <div className="flex-1 flex justify-center flex-col p-[10px] sm:p-[14px]">
                                <p className="text-[16px] sm:text-[20px] text-[#022B23] font-medium truncate">{formatCurrency(totalPromotionAmount/100)}</p>
                            </div>
                        </div>
                        {tiers.slice(0, 3).map((tier) => (
                            <div key={tier.id} className="flex flex-col rounded-[12px] sm:rounded-[14px] h-[70px] sm:h-[86px] border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[10px] sm:px-[14px] flex items-center rounded-tl-[12px] rounded-tr-[12px] sm:rounded-tl-[14px] sm:rounded-tr-[14px] h-[28px] sm:h-[34px] bg-[#000000]">
                                    <p className="text-white text-[10px] sm:text-[12px] truncate">{tier.tier}</p>
                                </div>
                                <div className="flex-1 flex justify-center flex-col p-[10px] sm:p-[14px]">
                                    <p className="text-[16px] sm:text-[20px] text-[#022B23] font-medium truncate">{formatCurrency(tier.price)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Vendor Onboarding Fee Section */}
                <div className="mt-[30px] flex flex-col gap-[4px]">
                    <p className="text-[16px] text-[#1E1E1E] font-medium">Vendor Onboarding Fee</p>
                    <p className="text-[14px] text-[#707070]">Set the fee for vendor shop onboarding</p>
                </div>

                <div className="mt-[10px] flex flex-col rounded-[12px] sm:rounded-[14px] h-auto border-[#EAEAEA] border-[0.5px] w-full sm:w-[300px]">
                    <div className="w-full px-[10px] sm:px-[14px] flex items-center rounded-tl-[12px] rounded-tr-[12px] sm:rounded-tl-[14px] sm:rounded-tr-[14px] h-[28px] sm:h-[34px] bg-[#022B23]">
                        <p className="text-white text-[10px] sm:text-[12px] font-medium">Vendor Onboarding Fee</p>
                    </div>
                    <div className="flex-1 flex items-center justify-between p-[10px] sm:p-[14px]">
                        {isEditingFee ? (
                            <div className="flex items-center gap-2 w-full">
                                <input
                                    type="number"
                                    value={newFeeAmount}
                                    onChange={(e) => setNewFeeAmount(e.target.value)}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-[14px] focus:outline-none focus:ring-1 focus:ring-[#022B23]"
                                    placeholder="Enter amount"
                                />
                                <button
                                    onClick={handleSaveFee}
                                    className="px-3 py-1 bg-[#022B23] text-white text-[12px] rounded hover:bg-[#033a30]"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 text-[12px] rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-[16px] sm:text-[20px] text-[#022B23] font-medium">₦{vendorFee.toLocaleString()}</p>
                                <p
                                    className="underline text-[10px] sm:text-[12px] text-[#022B23] font-medium cursor-pointer hover:text-[#033a30] transition-colors"
                                    onClick={handleEditFee}
                                >
                                    Edit fee
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-[30px] flex flex-col gap-[4px]">
                    <p className="text-[16px] text-[#1E1E1E] font-medium">Tiers</p>
                    <p className="text-[14px] text-[#707070]">View and edit tier pricing</p>
                </div>

                {loading.tiers ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[15px] sm:gap-[20px] mt-[10px]">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex flex-col rounded-[12px] sm:rounded-[14px] h-[70px] sm:h-[86px] border-[#EAEAEA] border-[0.5px] animate-pulse">
                                <div className="w-full h-[28px] sm:h-[34px] rounded-tl-[12px] rounded-tr-[12px] sm:rounded-tl-[14px] sm:rounded-tr-[14px] bg-gray-200"></div>
                                <div className="flex-1 flex items-center justify-between p-[10px] sm:p-[14px]">
                                    <div className="h-4 sm:h-6 w-3/4 bg-gray-200 rounded"></div>
                                    <div className="h-3 sm:h-4 w-1/4 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error.tiers ? (
                    <div className="text-red-500">{error.tiers}</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[15px] sm:gap-[20px] mt-[10px]">
                        {tiers.map((tier, index) => (
                            <div
                                key={tier.id}
                                className="flex flex-col rounded-[12px] sm:rounded-[14px] h-[70px] sm:h-[86px] border-[#EAEAEA] border-[0.5px]"
                            >
                                <div
                                    className="w-full px-[10px] sm:px-[14px] flex items-center rounded-tl-[12px] rounded-tr-[12px] sm:rounded-tl-[14px] sm:rounded-tr-[14px] h-[28px] sm:h-[34px]"
                                    style={{ backgroundColor: index === 0 ? '#EBFF70' : index === 1 ? '#AA63ED' : '#A1FFCC' }}
                                >
                                    <p className="text-[#022B23] text-[10px] sm:text-[12px] font-medium truncate">{tier.tier}</p>
                                </div>
                                <div className="flex-1 flex items-center justify-between p-[10px] sm:p-[14px]">
                                    <p className="text-[16px] sm:text-[20px] text-[#022B23] font-medium truncate">{formatCurrency(tier.price)}</p>
                                    <p
                                        className="underline text-[10px] sm:text-[12px] text-[#022B23] font-medium cursor-pointer hover:text-[#033a30] transition-colors"
                                        onClick={() => setSelectedTier(tier)}
                                    >
                                        Edit tier
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedTier && (
                    <TierEditModal
                        tier={{
                            id: selectedTier.id,
                            name: selectedTier.tier,
                            color: selectedTier.id === 1 ? '#EBFF70' : selectedTier.id === 2 ? '#AA63ED' : '#A1FFCC',
                            amount: selectedTier.price.toString()
                        }}
                        onClose={() => setSelectedTier(null)}
                    />
                )}

                <div className="w-full flex mt-[30px] sm:mt-[50px] flex-col h-auto border-[#EAECF0] border rounded-[16px] sm:rounded-[24px]">
                    <div className="w-full h-auto sm:h-[91px] flex flex-col sm:flex-row sm:items-center justify-between px-[15px] sm:px-[24px] pt-[15px] sm:pt-[20px] pb-[15px] sm:pb-[19px] gap-[15px] sm:gap-0">
                        <div className="flex flex-col gap-[4px]">
                            <div className="h-auto sm:h-[28px] flex items-center">
                                <p className="text-[16px] sm:text-[18px] font-medium text-[#101828]">Transactions ({filteredTransactions.length})</p>
                            </div>
                            <div className="flex h-auto sm:h-[20px] items-center">
                                <p className="text-[12px] sm:text-[14px] text-[#667085]">View and manage all transactions here</p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center bg-[#FFFFFF] border-[0.5px] border-[#F2F2F2] text-black px-3 sm:px-4 py-2 shadow-sm rounded-sm w-full sm:w-auto">
                            <Image src={searchImg} alt="Search Icon" width={18} height={18} className="h-[18px] w-[18px] sm:h-[20px] sm:w-[20px]" />
                            <input 
                                placeholder="Search transactions..." 
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full sm:w-[175px] text-[#707070] text-[13px] sm:text-[14px] focus:outline-none" 
                            />
                        </div>
                    </div>

                    {/* Desktop Table Header */}
                    <div className="hidden lg:flex w-full h-[44px] bg-[#F9FAFB] border-b-[0.5px] border-[#EAECF0]">
                        <div className="h-full w-[20%] gap-[4px] flex justify-center items-center font-medium text-[#667085] text-[12px]">
                            <p>Transaction type</p>
                            <Image src={arrowDown} alt={'image'} />
                        </div>
                        <div className="h-full w-[25%] gap-[4px] flex px-[20px] items-center font-medium text-[#667085] text-[12px]">
                            <p>User</p>
                            <Image src={arrowDown} alt={'image'} />
                        </div>
                        <div className="h-full w-[20%] gap-[4px] flex px-[20px] items-center font-medium text-[#667085] text-[12px]">
                            <p>Amount (NGN)</p>
                            <Image src={arrowDown} alt={'image'} />
                        </div>
                        <div className="h-full w-[15%] gap-[4px] flex px-[20px] items-center font-medium text-[#667085] text-[12px]">
                            <p>Date and Time</p>
                            <Image src={arrowDown} alt={'image'} />
                        </div>
                        <div className="flex w-[19%] items-center px-[24px] font-medium text-[#667085] text-[12px]">
                            Status
                        </div>
                        <div className="w-[3%]"></div>
                    </div>

                    <div className="flex flex-col">
                        {loading.transactions ? (
                            [1, 2, 3, 4, 5].map((i) => (
                                <div key={i}>
                                    {/* Desktop Loading */}
                                    <div className={`hidden lg:flex h-[72px] ${i !== 5 ? 'border-b border-[#EAECF0]' : ''} animate-pulse`}>
                                        {[20, 25, 20, 15, 19, 3].map((width, idx) => (
                                            <div key={idx} className={`flex items-center pl-[15px] w-[${width}%]`}>
                                                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Mobile Loading */}
                                    <div className={`lg:hidden p-[15px] ${i !== 5 ? 'border-b border-[#EAECF0]' : ''} animate-pulse`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="h-3 w-3/4 bg-gray-200 rounded mb-2"></div>
                                                <div className="h-3 w-1/2 bg-gray-200 rounded mb-1"></div>
                                                <div className="h-2 w-2/3 bg-gray-200 rounded"></div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                                                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="h-3 w-16 bg-gray-200 rounded"></div>
                                            <div className="text-right">
                                                <div className="h-3 w-12 bg-gray-200 rounded mb-1"></div>
                                                <div className="h-2 w-10 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : error.transactions ? (
                            <div className="text-red-500 p-4">{error.transactions}</div>
                        ) : filteredTransactions.length > 0 ? (
                            currentTransactions.map((transaction, index) => (
                                <AdsTableRow
                                    key={transaction.id}
                                    transaction={transaction}
                                    isLast={index === currentTransactions.length - 1}
                                    onTransactionUpdate={fetchTransactions}
                                />
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                {searchTerm ? 'No transactions found matching your search' : 'No transactions found'}
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {filteredTransactions.length > transactionsPerPage && (
                        <div className="flex items-center justify-between px-[15px] sm:px-[24px] py-[15px] sm:py-[20px] border-t border-[#EAECF0]">
                            <div className="flex items-center gap-2 text-sm text-[#667085]">
                                <span>
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-[#D0D5DD] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-1 text-sm rounded-md ${
                                                currentPage === page
                                                    ? 'bg-[#022B23] text-white'
                                                    : 'border border-[#D0D5DD] hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-[#D0D5DD] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Ads;