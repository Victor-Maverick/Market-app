'use client'
import DashboardSubHeader from "@/components/dashboardSubHeader";
import DashboardHeader from "@/components/dashboardHeader";
import DashboardOptions from "@/components/dashboardOptions";
import Image from 'next/image'
import arrow from '../../../../../public/assets/images/arrow-right.svg'
import {ChevronDown} from "lucide-react";
import {useRouter} from "next/navigation";
import limeArrow from "../../../../../public/assets/images/green arrow.png";
import dashSlideImg from "../../../../../public/assets/images/dashSlideImg.png";
import { useState, useEffect } from "react";
import { fetchLocalGovernments } from "@/utils/api";
import { formatNIN, validateNIN } from "@/utils/validationUtils";



type LocalGovernment = {
    id: number;
    name: string;
    stateId: number;
};

const DropDown = ({
                      options,
                      selectedOption,
                      onSelect,
                      placeholder,
                  }: {
    options: LocalGovernment[];
    selectedOption: LocalGovernment | null;
    onSelect: (option: LocalGovernment) => void;
    placeholder: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="border-[1.5px] rounded-[14px] h-[58px] flex justify-between px-[18px] border-[#D1D1D1] items-center cursor-pointer"
            >
                <p className={`${selectedOption ? "text-[#121212]" : "text-[#BDBDBD]"} text-[16px] font-medium`}>
                    {selectedOption ? selectedOption.name : placeholder}
                </p>
                <ChevronDown
                    size={24}
                    className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    color="#D1D1D1"
                />
            </div>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-full bg-white text-black rounded-md shadow-lg z-10 border border-[#ededed]">
                    <ul className="py-1">
                        {options.map((option) => (
                            <li
                                key={option.id}
                                className="px-4 py-2 text-black hover:bg-[#ECFDF6] cursor-pointer"
                                onClick={() => {
                                    onSelect(option);
                                    setIsOpen(false);
                                }}
                            >
                                {option.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const InputField = ({
                        id,
                        label,
                        value,
                        onChange,
                        placeholder,
                        optional = false,
                    }: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    optional?: boolean;
}) => {
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

const Setup2 = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        homeAddress: "",
        street: "",
        NIN: "",
        phone: "",
    });


    const [filteredLgas, setFilteredLgas] = useState<LocalGovernment[]>([]);
    const [selectedLga, setSelectedLga] = useState<LocalGovernment | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const lgas = await fetchLocalGovernments();
                console.log("Lgas: ",lgas)
                // Filter for Benue state (stateId = 7)
                const benueLgas = lgas.filter((lga: { stateId: number; }) => lga.stateId === 7);
                setFilteredLgas(benueLgas);
            } catch (error) {
                console.error("Error fetching local governments:", error);
            }
        };

        fetchData();
    }, []);

    const handleChange = (field: keyof typeof formData) => (value: string) => {
        if (field === 'NIN') {
            // Format NIN as user types
            const formattedValue = formatNIN(value);
            setFormData(prev => ({ ...prev, [field]: formattedValue }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleBack = () => {
        router.push('/vendor/setup-shop/shop-info');
    };

    const handleContinue = () => {
        if (!formData.homeAddress || !formData.street || !formData.NIN || !selectedLga) {
            alert("Please fill in all required fields");
            return;
        }

        // Validate NIN format
        if (!validateNIN(formData.NIN)) {
            alert("Please enter a valid NIN in the format: 0012 345 6789");
            return;
        }

        // Save personal info to localStorage or context
        const personalInfo = {
            ...formData,
            lgaId: selectedLga.id,
        };
        localStorage.setItem('personalInfo', JSON.stringify(personalInfo));

        router.push('/vendor/setup-shop/bank-info');
    };

    return (
        <>
            <DashboardHeader />
            <DashboardOptions />
            <DashboardSubHeader
                welcomeText={"Hey, welcome"}
                description={"Get started by setting up your shop"}
                background={'#ECFDF6'}
                image={dashSlideImg}
                textColor={'#05966F'}
            />
            <div className="h-[44px] gap-[8px] border-b-[0.5px] px-25 border-[#ededed] flex items-center">
                <Image src={arrow} alt={'arrow image'} className="cursor-pointer" onClick={handleBack}/>
                <p className="cursor-pointer text-[14px] font-normal">
                    <span onClick={handleBack}>Shop information //</span><span className="cursor-pointer font-medium">Vendor information</span>
                </p>
            </div>
            <div className="flex ml-[366px] w-auto mt-16 gap-25">
                <div className="flex flex-col w-[268px] h-[67px] gap-[10px]">
                    <p className="text-[#022B23] text-[16px] font-medium">Vendor information</p>
                    <p className="text-[#707070] font-medium text-[14px]">
                        Information about yourself
                    </p>
                </div>
                <div className="flex flex-col w-[400px] h-auto gap-[40px]">
                    <div className="flex-col flex gap-[10px]">
                        <div className="h-[58px] font-medium text-[#121212] w-full rounded-[14px] border-[1.5px] border-[#D1FAE7] flex items-center px-[18px] text-[14px] bg-[#ECFDF6]">
                            {/*<p>{firstName} {lastName}</p>*/}
                        </div>
                        <div className="h-[58px] font-medium text-[#121212] w-full rounded-[14px] border-[1.5px] border-[#D1FAE7] flex items-center px-[18px] text-[14px] bg-[#ECFDF6]">
                            <p>Benue state</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[10px]">
                        <DropDown
                            options={filteredLgas}
                            selectedOption={selectedLga}
                            onSelect={setSelectedLga}
                            placeholder="L.G.A of residence"
                        />
                        <InputField
                            id="homeAddress"
                            label="Home address"
                            value={formData.homeAddress}
                            onChange={handleChange('homeAddress')}
                            placeholder="Home address"
                        />
                        <InputField
                            id="phone"
                            label="Phone Number"
                            value={formData.phone}
                            onChange={handleChange('phone')}
                            placeholder="Phone Number"
                        />
                        <InputField
                            id="street"
                            label="Street"
                            value={formData.street}
                            onChange={handleChange('street')}
                            placeholder="Street"
                        />
                        <InputField
                            id="NIN"
                            label="NIN (0012 345 6789)"
                            value={formData.NIN}
                            onChange={handleChange('NIN')}
                            placeholder="0012 345 6789"
                        />
                    </div>
                    <div
                        className="flex mb-[20px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors"
                        onClick={handleContinue}
                    >
                        <p className="text-[#C6EB5F] font-semibold text-[14px]">Continue to Bank information</p>
                        <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Setup2;