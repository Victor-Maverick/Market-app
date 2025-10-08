'use client';
import Image from "next/image";
import arrowRight from '@/../public/assets/images/green arrow.png';
import { useState } from "react";
import axios from 'axios';

interface OnboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    marketData: {
        name: string;
        address: string;
        stateId: number;
        localGovernmentId: number;
        councilId: number;
    };
}

const OnboardMarketModal = ({ isOpen, onClose, onSuccess, marketData }: OnboardModalProps) => {
    const [lines, setLines] = useState('');
    const [shops, setShops] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!lines || !shops) {
            setError("Please enter both lines and shops count");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                marketName: marketData.name,
                location: marketData.address,
                stateId: marketData.stateId,
                localGovernmentId: marketData.localGovernmentId,
                councilId: marketData.councilId,
                lines: Number(lines),
                shopNumber: Number(shops),
            };

            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/markets/add`, payload);

            if (response.status === 200) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error("Error onboarding market:", err);
            setError("Failed to onboard market. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white rounded-[14px] p-6 w-[400px]">
                <h2 className="text-[#022B23] text-[18px] font-semibold mb-6">Market Details</h2>

                {error && (
                    <div className="mb-4 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <div className="relative w-full flex flex-col">
                            <label
                                htmlFor="lines"
                                className={`absolute left-4 text-[#6D6D6D] text-[12px] font-medium top-[6px]`}
                            >
                                Number of Lines
                            </label>
                            <input
                                id="lines"
                                type="number"
                                min="1"
                                value={lines}
                                onChange={(e) => setLines(e.target.value)}
                                className="px-4 h-[58px] w-full border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] pt-[14px] pb-[4px] text-[#121212] text-[14px] font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="relative w-full flex flex-col">
                            <label
                                htmlFor="shops"
                                className={`absolute left-4 text-[#6D6D6D] text-[12px] font-medium top-[6px]`}
                            >
                                Number of Shops
                            </label>
                            <input
                                id="shops"
                                type="number"
                                min="1"
                                value={shops}
                                onChange={(e) => setShops(e.target.value)}
                                className="px-4 h-[58px] w-full border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] pt-[14px] pb-[4px] text-[#121212] text-[14px] font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-[#022B23] border border-[#022B23] rounded-[12px] text-[14px] font-semibold"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex h-[52px] cursor-pointer text-[14px] rounded-[12px] font-semibold text-[#C6EB5F] bg-[#022B23] px-4 items-center justify-center gap-[9px]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : (
                                <>
                                    <span>Continue</span>
                                    <Image src={arrowRight} alt="Continue arrow" width={20} height={20} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default OnboardMarketModal;