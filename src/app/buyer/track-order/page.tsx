'use client'
import MarketPlaceHeader from "@/components/marketPlaceHeader";
import Image from "next/image";
import marketIcon from "../../../../public/assets/images/market element.png";
import React, {useState} from "react";

import limeArrow from '@/../public/assets/images/green arrow.png'
import BackButton from "@/components/BackButton";



interface InputFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    optional?: boolean;
}
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

const TrackOrder = () => {
    const [selectedMarket, setSelectedMarket] = useState("Wurukum");
    const [formData, setFormData] = useState({
        trackingNumber: ""
    });
    const [showStatus, setShowStatus] = useState(false);

    const handleChange = (field: keyof typeof formData) => (value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleContinue = () => {
        if (formData.trackingNumber.trim()) {
            setShowStatus(true);
            // Here you would typically make an API call to fetch the order status
            // based on the tracking number
        }
    };

    return (
        <>
            <MarketPlaceHeader />
            <div className="h-[114px] w-full border-b-[0.5px] border-[#EDEDED]">
                <div className="h-[66px] w-full flex justify-between items-center px-25 border-t-[0.5px] border-[#ededed]">
                    <div className="flex gap-[20px]">
                        {/*/!*<Dropdown options={[]} selectedOption={undefined} onSelect={function(option: unknown): void {*!/*/}
                        {/*    throw new Error("Function not implemented.");*/}
                        {/*} } placeholder={""}/>*/}
                    </div>

                    <div className="flex ml-[10px] gap-[2px] p-[2px] h-[52px] items-center justify-between border border-[#ededed] rounded-[4px]">
                        <div className="bg-[#F9F9F9] text-black px-[8px] rounded-[4px] flex items-center justify-center h-[48px]">
                            <select className="bg-[#F9F9F9] text-[#1E1E1E] text-[14px] rounded-sm text-center w-full focus:outline-none">
                                <option>Benue State</option>
                                <option>Enugu State</option>
                                <option>Lagos State</option>
                            </select>
                        </div>

                        <div className="relative">
                            <div className="flex items-center bg-[#F9F9F9] px-[8px] h-[48px] rounded-[4px]">
                                <Image src={marketIcon} alt="Market Icon" width={20} height={20} />
                                <select
                                    className="bg-[#F9F9F9] text-[#1E1E1E] text-[14px] items-center pr-1 focus:outline-none"
                                    onChange={(e) => setSelectedMarket(e.target.value)}
                                    value={selectedMarket}
                                >
                                    <option>Wurukum market</option>
                                    <option>Gboko Market</option>
                                    <option>Otukpo Market</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-[48px] px-25 gap-[8px] items-center flex">
                    <BackButton variant="default" text="Go back" />
                    <p className="text-[14px] text-[#3F3E3E]">Home // <span className="font-medium text-[#022B23]">Track order</span></p>
                </div>
            </div>
            <div className="pt-[96px] h-[915px] px-25 flex gap-[246px]">
                <div className="w-[400px] flex flex-col h-[267px] gap-[80px]">
                    <div className="w-full flex flex-col h-[135px] gap-[32px]">
                        <div className="flex flex-col gap-[4px] h-[45px] w-[242px]">
                            <p className="text-[#022B23] text-[20px] font-medium">Track your order here</p>
                            <p className="text-[#707070] text-[14px] font-medium">Please provide your tracking ID here</p>
                        </div>
                        <InputField
                            id="trackingNumber"
                            label="Tracking number"
                            value={formData.trackingNumber}
                            onChange={handleChange("trackingNumber")}
                            placeholder="Tracking number"
                        />
                    </div>
                    <button
                        onClick={handleContinue}
                        className="h-[52px] text-[#C6EB5F] text-[14px] font-semibold rounded-[14px] bg-[#022B23] flex items-center justify-center gap-[9px] w-full"
                    >
                        <p>Continue</p>
                        <Image src={limeArrow} alt={'image'}/>
                    </button>
                </div>
                {showStatus && (
                    <div className="w-[238px] flex flex-col h-[301px] justify-between">
                        <div className="flex items-center gap-[20px] w-full">
                            <span className={`w-[32px] h-[32px] rounded-full bg-[#022B23]`}></span>
                            <div className={`flex flex-col`}>
                                <p className="text-[#022B23] text-[20px] font-medium">Order confirmed</p>
                                <p className="text-[#707070] text-[14px] font-medium">Wednesday, 13th May 2025</p>
                            </div>
                        </div>
                        <span className={`w-[2px] h-[59px] rounded-[100px] bg-[#E4E4E4]`}></span>
                        <div className="flex items-center gap-[20px] w-full">
                            <span className={`w-[32px] h-[32px] rounded-full bg-[#022B23]`}></span>
                            <div className={`flex flex-col`}>
                                <p className="text-[#022B23] text-[20px] font-medium">In-transit</p>
                                <p className="text-[#707070] text-[14px] font-medium">Wednesday, 13th May 2025</p>
                            </div>
                        </div>
                        <span className={`w-[2px] h-[59px] rounded-[100px] bg-[#E4E4E4]`}></span>
                        <div className="flex items-center gap-[20px] w-full">
                            <span className={`w-[32px] h-[32px] rounded-full bg-[#707070]`}></span>
                            <div className={`flex flex-col`}>
                                <p className="text-[#022B23] text-[20px] font-medium">Delivered</p>
                                <p className="text-[#707070] text-[14px] font-medium">Wednesday, 13th May 2025</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
export default TrackOrder;