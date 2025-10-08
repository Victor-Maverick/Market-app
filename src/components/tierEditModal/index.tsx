'use client'
import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import limeArrow from "../../../public/assets/images/green arrow.png";
import useResponsive from "@/hooks/useResponsive";

interface InputFieldProps {
    id: string;
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    optional?: boolean;
    type?: string;
}

const InputField = ({
                        id,
                        label,
                        value,
                        onChange,
                        placeholder,
                        optional = false,
                        type = "text",
                    }: InputFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative w-full flex flex-col">
            <label
                htmlFor={id}
                className={`absolute left-3 sm:left-4 transition-all ${
                    isFocused || value
                        ? "text-[#6D6D6D] text-[11px] sm:text-[12px] font-medium top-[4px] sm:top-[6px]"
                        : "hidden"
                }`}
            >
                {label} {optional && <span className="text-[#B0B0B0]">(optional)</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={!isFocused && !value ? placeholder : ""}
                className={`px-3 sm:px-4 h-[50px] sm:h-[58px] w-full border-[1.5px] border-[#D1D1D1] rounded-[12px] sm:rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] ${
                    isFocused || value
                        ? "pt-[12px] sm:pt-[14px] pb-[3px] sm:pb-[4px] text-[#121212] text-[13px] sm:text-[14px] font-medium"
                        : "text-[#BDBDBD] text-[14px] sm:text-[16px] font-medium"
                }`}
            />
        </div>
    );
};

interface TierEditModalProps {
    tier: {
        id: number;
        name: string;
        color: string;
        amount: string;
    };
    onClose: () => void;
}

const TierEditModal = ({ tier, onClose }: TierEditModalProps) => {
    const { isMobile } = useResponsive();
    const [formData, setFormData] = useState({
        tier: tier.name,
        price: parseFloat(tier.amount),
        featuredNumber: 0,
        promotedNumber: 0,
        floatedNumber: 0,
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch current tier data to populate form
    useState(() => {
        const fetchTierData = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/tier/id?tierId=${tier.id}`);
                const tierData = response.data;
                setFormData({
                    tier: tierData.tier,
                    price: tierData.price,
                    featuredNumber: tierData.featuredNumber || 0,
                    promotedNumber: tierData.promotedNumber || 0,
                    floatedNumber: tierData.floatedNumber || 0,
                });
            } catch (error) {
                console.error('Error fetching tier data:', error);
            }
        };
        fetchTierData();
    });

    const handleChange = (field: keyof typeof formData) => (value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: field === "tier" ? value : parseFloat(value) || 0,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.put<string>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/update-tier?tierId=${tier.id}`,
                {
                    tier: formData.tier,
                    price: formData.price,
                    featuredNumber: formData.featuredNumber,
                    promotedNumber: formData.promotedNumber,
                    floatedNumber: formData.floatedNumber,
                }
            );

            console.log("Tier updated:", response.data);
            // Refresh the page to show updated data
            window.location.reload();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update tier");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#808080]/20 p-4">
            <div className={`bg-white ${isMobile ? 'w-full max-w-[400px] h-auto max-h-[90vh] overflow-y-auto' : 'w-[597px] h-[620px]'} flex flex-col gap-[15px] sm:gap-[20px] p-[30px] sm:p-[50px] rounded-lg`}>
                <div className="gap-[-10px] flex flex-col">
                    <h3 className="text-[14px] sm:text-[16px] font-semibold mb-2 sm:mb-4">Edit {tier.name}</h3>
                    <p className="text-[12px] sm:text-sm mb-2">Edit the pricing and details for {tier.name.toLowerCase()}</p>
                    <p className="text-[11px] sm:text-[12px] text-[#666] mb-4">
                        Note: Changes will apply to all shops using this tier
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-[8px] sm:gap-[10px]">
                    <div className="w-full">
                        <InputField
                            id="tier"
                            label="Tier Name"
                            value={formData.tier}
                            onChange={handleChange("tier")}
                            placeholder="Tier name"
                        />
                    </div>
                    <div className="w-full">
                        <InputField
                            id="price"
                            label="Price (NGN)"
                            value={formData.price}
                            onChange={handleChange("price")}
                            placeholder="Price"
                            type="number"
                        />
                    </div>
                    <div className="w-full">
                        <InputField
                            id="featuredNumber"
                            label="Featured Products Limit"
                            value={formData.featuredNumber}
                            onChange={handleChange("featuredNumber")}
                            placeholder="Number of featured products allowed"
                            type="number"
                        />
                    </div>
                    <div className="w-full">
                        <InputField
                            id="promotedNumber"
                            label="Promoted Products Limit"
                            value={formData.promotedNumber}
                            onChange={handleChange("promotedNumber")}
                            placeholder="Number of promoted products allowed"
                            type="number"
                        />
                    </div>
                    <div className="w-full">
                        <InputField
                            id="floatedNumber"
                            label="Floated Products Limit"
                            value={formData.floatedNumber}
                            onChange={handleChange("floatedNumber")}
                            placeholder="Number of floated products allowed"
                            type="number"
                        />
                    </div>
                    {error && <p className="text-red-500 text-[12px] sm:text-[14px]">{error}</p>}
                    <div className="flex gap-2 sm:gap-3 mt-[15px] sm:mt-[20px]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-[45px] sm:h-[52px] border border-[#D1D1D1] rounded-[10px] sm:rounded-[12px] text-[#666] text-[13px] sm:text-[14px] font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex gap-[6px] sm:gap-[9px] justify-center items-center bg-[#022B23] rounded-[10px] sm:rounded-[12px] h-[45px] sm:h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors disabled:opacity-50"
                        >
                            <span className="text-[#C6EB5F] font-semibold text-[13px] sm:text-[14px]">
                                {loading ? "Updating..." : "Update and save"}
                            </span>
                            {!loading && <Image src={limeArrow} alt="Continue arrow" width={isMobile ? 16 : 18} height={isMobile ? 16 : 18} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TierEditModal;