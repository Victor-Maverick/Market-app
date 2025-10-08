'use client'
import { useState, useEffect } from "react";
import Image from "next/image";
import limeArrow from "../../../public/assets/images/green arrow.png";
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import {toast, ToastContainer} from "react-toastify";

interface Bank {
    name: string;
    code: string;
}

interface BankListResponse {
    status: boolean;
    message: string;
    data: Bank[];
}

interface ShopAccountDetails {
    bankName: string;
    accountNumber: string;
}

interface PayoutRequestModalProps {
    isPayoutRequestModalOpen: boolean;
    onClosePayoutRequestModal: () => void;
    onRequestSuccess: () => void;
    shopId: number;
    amount: number;
    accountDetails: ShopAccountDetails | null;
    onUpdateAccount: (details: ShopAccountDetails) => Promise<boolean>;
}

type InputFieldProps = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    optional?: boolean;
};

const InputField = ({
                        id,
                        label,
                        value,
                        onChange,
                        placeholder,
                        optional = false,
                    }: InputFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative w-full flex flex-col">
            <label
                htmlFor={id}
                className={`absolute left-4 transition-all ${
                    isFocused || value
                        ? "text-[#6D6D6D] text-[12px] font-medium top-[6px]"
                        : "hidden"
                }`}
            >
                {label} {optional && <span className="text-[#B0B0B0]">(optional)</span>}
            </label>
            <input
                id={id}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={!isFocused && !value ? placeholder : ""}
                className={`px-4 h-[58px] w-full border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] ${
                    isFocused || value
                        ? "pt-[14px] pb-[4px] text-[#121212] text-[14px] font-medium"
                        : "text-[#BDBDBD] text-[16px] font-medium"
                }`}
            />
        </div>
    );
};

const PayoutRequestModal = ({
                                isPayoutRequestModalOpen,
                                onClosePayoutRequestModal,
                                onRequestSuccess,
                                shopId,
                                amount,
                                accountDetails,
                                onUpdateAccount,
                            }: PayoutRequestModalProps) => {
    const [formData, setFormData] = useState({
        amount: "",
        bankName: accountDetails?.bankName || "",
        accountNumber: accountDetails?.accountNumber || "",
        bankCode: ""
    });
    const [banks, setBanks] = useState<Bank[]>([]);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (accountDetails) {
            setFormData({
                amount: "",
                bankName: accountDetails.bankName,
                accountNumber: accountDetails.accountNumber,
                bankCode: ""
            });
        }
    }, [accountDetails]);

    useEffect(() => {
        if (isPayoutRequestModalOpen) {
            fetchBanks();
        }
    }, [isPayoutRequestModalOpen]);

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

    const handleChange = (field: keyof typeof formData) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleEditDetails = () => {
        setIsEditing(true);
    };

    const handleSaveDetails = async () => {
        if (!formData.bankName || !formData.accountNumber) {
            setError("Bank name and account number are required");
            return;
        }

        try {
            setIsSubmitting(true);
            const success = await onUpdateAccount({
                bankName: formData.bankName,
                accountNumber: formData.accountNumber
            });

            if (success) {
                setIsEditing(false);
                setError("");
                toast.success("Account details updated successfully");
            } else {
                setError("Failed to update account details");
                toast.error("Failed to update account details");
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setError(err.message || "An error occurred while updating account details");
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            toast.error(err.message || "An error occurred while updating account details");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContinue = async () => {
        if (!formData.amount || isNaN(Number(formData.amount))) {
            setError("Please enter a valid amount");
            return;
        }

        if (Number(formData.amount) > amount) {
            setError("Amount cannot exceed available balance");
            return;
        }

        if (!formData.bankName || !formData.accountNumber) {
            setError("Bank details are required");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payout/request`, {
                shopId,
                amount: Number(formData.amount),
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                bankCode: formData.bankCode
            });

            if (response.data) {
                toast.success(response.data); // This will display "Payout requested successfully"
                onRequestSuccess();
            } else {
                setError("Failed to request payout");
                toast.error("Failed to request payout");
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const errorMessage = err.response?.data || "An error occurred while requesting payout";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
            onClosePayoutRequestModal()
        }
    };

    if (!isPayoutRequestModalOpen) return null;

    return (
        <>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white px-10 py-20 w-[950px] max-h-[90vh] flex flex-col items-center gap-6 overflow-hidden">
                <div className="w-[530px] h-[447px] gap-[28px] flex flex-col flex-shrink-0 mx-auto">
                    <div>
                        <h2 className="text-[16px] font-medium text-[#022B23]">Payout request</h2>
                        <p className="text-[14px] font-medium leading-tight text-[#707070]">
                            Request for pay-out from your available <br />balance
                        </p>
                    </div>
                    <InputField
                        id="amount"
                        label="Amount to request"
                        value={formData.amount}
                        onChange={handleChange('amount')}
                        placeholder={`Available: N ${amount.toLocaleString()}.00`}
                    />
                    <div className="w-full h-[178px] flex flex-col gap-[10px] border border-[#ededed] rounded-[24px] px-[24px] py-[16px]">
                        <div className="flex flex-col gap-[14px]">
                            <p className="text-[16px] font-medium text-[#000000]">Bank details</p>
                            {isEditing ? (
                                <>
                                    <div className="relative w-full flex flex-col">
                                        <label className="text-[#6D6D6D] text-[12px] font-medium mb-1">
                                            Bank Name
                                        </label>
                                        <select
                                            value={selectedBank?.code || ''}
                                            onChange={(e) => {
                                                const bank = banks.find(b => b.code === e.target.value);
                                                setSelectedBank(bank || null);
                                                setFormData(prev => ({ 
                                                    ...prev, 
                                                    bankName: bank?.name || '',
                                                    bankCode: bank?.code || ''
                                                }));
                                            }}
                                            className="px-4 h-[58px] w-full border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] text-[#121212] text-[14px] font-medium"
                                        >
                                            <option value="">Select a bank</option>
                                            {banks.map((bank) => (
                                                <option key={bank.code} value={bank.code}>
                                                    {bank.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputField
                                        id="accountNumber"
                                        label="Account Number"
                                        value={formData.accountNumber}
                                        onChange={handleChange('accountNumber')}
                                        placeholder="Enter account number"
                                    />
                                </>
                            ) : (
                                <>
                                    <p className="text-[14px] text-[#707070]">BANK NAME: {formData.bankName}</p>
                                    <p className="text-[14px] text-[#707070]">ACCOUNT NUMBER: {formData.accountNumber}</p>
                                </>
                            )}
                        </div>
                        {isEditing ? (
                            <button
                                onClick={handleSaveDetails}
                                disabled={isSubmitting}
                                className="w-[80px] hover:shadow-sm cursor-pointer rounded-[8px] px-[8px] py-[6px] text-[#022B23] font-medium text-[12px] h-[32px] border border-[#E4E4E4] flex items-center justify-center"
                            >
                                {isSubmitting ? "Saving..." : "Save"}
                            </button>
                        ) : (
                            <button
                                onClick={handleEditDetails}
                                className="w-[80px] hover:shadow-sm cursor-pointer rounded-[8px] px-[8px] py-[6px] text-[#022B23] font-medium text-[12px] h-[32px] border border-[#E4E4E4]"
                            >
                                Edit details
                            </button>
                        )}
                    </div>
                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}
                    <div
                        className="flex mb-[20px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors"
                        onClick={handleContinue}
                    >
                        <p className="text-[#C6EB5F] font-semibold text-[14px]">
                            {isSubmitting ? "Processing..." : "Request pay-out"}
                        </p>
                        {!isSubmitting && <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />}
                    </div>
                </div>
            </div>
        </div>
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
                theme="light"
            />
            </>
    );
};

export default PayoutRequestModal;