'use client'

import { useState } from "react";
import DashboardHeader from "@/components/dashboardHeader";
import DashboardSubHeader from "@/components/dashboardSubHeader";
import dashImg from "../../../../../../public/assets/images/Logistics-rafiki.svg";
import Image from "next/image";
import arrow from "../../../../../../public/assets/images/arrow-right.svg";
import limeArrow from "../../../../../../public/assets/images/green arrow.png";
import InputField from "../../../../../components/InputField";
import {FleetOnboardModal} from "@/components/fleetOnboardModal";

type FormData = {
    fleetNumber: string;
    ownerName: string;
};

export default function FleetOnboarding() {
    const [formData, setFormData] = useState<FormData>({
        fleetNumber: "",
        ownerName: ""
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (field: keyof FormData) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitVehicles = () => {
        // Handle the submitted vehicles data
        console.log("Submitted vehicles:");
        // You can add your submission logic here
    };

    const handleOpenModal = () => {
        const count = parseInt(formData.fleetNumber);
        if (count > 0) {
            setIsModalOpen(true);
        } else {
            alert("Please enter a valid fleet number (positive integer)");
        }
    };

    return (
        <>
            <DashboardHeader />
            <DashboardSubHeader
                welcomeText="Manage your logistics company"
                description="Get started by setting up your company"
                image={dashImg}
                textColor="#DD6A02"
                background="#FFFAEB"
            />
            <div className="h-[44px] gap-[8px] border-b-[0.5px] px-25 border-[#ededed] flex items-center">
                <Image src={arrow} alt="arrow image" className="cursor-pointer" />
                <p className="text-[14px] font-normal text-[#707070]">
                    <span className="cursor-pointer text-[#022B23]">Logistics company //</span>
                    <span className="cursor-pointer text-[#022B23]"> License //</span>
                    <span className="cursor-pointer text-[#022B23]"> Fleet onboarding // </span>
                    <span className="cursor-pointer">Bank Details //</span>
                    <span className="cursor-pointer"> Completed</span>
                </p>
            </div>
            <div className="flex ml-[366px] w-auto mt-16 gap-25">
                <div className="flex flex-col gap-[14px] w-[268px] leading-tight">
                    <p className="text-[#022B23] text-[16px] font-medium">Logistics company information</p>
                    <p className="text-[#707070] text-[14px] font-medium">
                        Provide information about your<br/> company to complete setup
                    </p>
                </div>
                <div className="flex flex-col w-[400px]">
                    <div className="w-full flex flex-col mb-[10px] h-[58px] px-[18px] py-[8px] rounded-[14px] border-[2px] border-[#022B23]">
                        <p className="text-[#6D6D6D] font-medium text-[12px]">Company name</p>
                        <p className="text-[#121212] text-[14px] font-medium">Arabian Logistics</p>
                    </div>

                    <InputField
                        id="fleetNumber"
                        label="Fleet number"
                        value={formData.fleetNumber}
                        onChange={handleChange('fleetNumber')}
                        placeholder="Fleet number"
                        type="number"
                    />

                    <InputField
                        id="ownerName"
                        label="Owner name"
                        value={formData.ownerName}
                        onChange={handleChange('ownerName')}
                        placeholder="Owner name"
                    />

                    <div
                        className="flex mt-[30px] mb-[20px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors"
                        onClick={handleOpenModal}
                    >
                        <p className="text-[#C6EB5F] font-semibold text-[14px]">Continue to onboard fleet</p>
                        <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />
                    </div>
                </div>
            </div>

            <FleetOnboardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                fleetCount={parseInt(formData.fleetNumber) || 0}
                onSubmit={handleSubmitVehicles}
            />
        </>
    );
}