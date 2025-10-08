'use client';
import Image from "next/image";
import arrowBack from '@/../public/assets/images/arrow-right.svg';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import arrowRight from '@/../public/assets/images/green arrow.png';
import OnboardMarketModal from "@/components/onboardMarket";
import OnboardMarketSuccessModal from "@/components/onboardMarketSuccessModal";
import axios from 'axios';

interface Location {
    id: number;
    name: string;
    stateId?: number;
    localGovernmentId?: number;
}

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

const LocationDropdown = ({
                              options,
                              selectedOption,
                              onSelect,
                              placeholder,
                              isLoading = false,
                              disabled = false,
                          }: {
    options: Location[];
    selectedOption: Location | null;
    onSelect: (option: Location) => void;
    placeholder: string;
    isLoading?: boolean;
    disabled?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative w-[400px]">
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`border-[1.5px] rounded-[14px] h-[58px] flex justify-between px-[18px] border-[#D1D1D1] items-center ${
                    disabled ? "cursor-not-allowed bg-[#F5F5F5]" : "cursor-pointer"
                }`}
            >
                <p className={`${selectedOption ? "text-[#121212]" : "text-[#BDBDBD]"} text-[16px] font-normal`}>
                    {isLoading ? "Loading..." : selectedOption ? selectedOption.name : placeholder}
                </p>
                <ChevronDown
                    size={24}
                    className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    color="#BDBDBD"
                />
            </div>

            {isOpen && !disabled && (
                <div className="absolute left-0 w-full bg-white text-black rounded-md shadow-lg z-10 border border-[#ededed] max-h-60 overflow-y-auto">
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

const OnboardMarket = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        location: "",
        marketName: ""
    });
    const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // State for locations
    const [states, setStates] = useState<Location[]>([]);
    const [allLgas, setAllLgas] = useState<Location[]>([]);
    const [allWards, setAllWards] = useState<Location[]>([]);
    const [lgas, setLgas] = useState<Location[]>([]);
    const [wards, setWards] = useState<Location[]>([]);
    const [selectedState, setSelectedState] = useState<Location | null>(null);
    const [selectedLga, setSelectedLga] = useState<Location | null>(null);
    const [selectedWard, setSelectedWard] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState({
        states: true,
        lgas: false,
        wards: false
    });

    // Fetch states on component mount
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/states/all`);
                setStates(response.data);
            } catch (error) {
                console.error("Error fetching states:", error);
            } finally {
                setIsLoading(prev => ({...prev, states: false}));
            }
        };

        fetchStates();
    }, []);

    // Fetch ALL LGAs on component mount
    useEffect(() => {
        const fetchAllLGAs = async () => {
            setIsLoading(prev => ({...prev, lgas: true}));
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/local-governments/all`);
                setAllLgas(response.data);
            } catch (error) {
                console.error("Error fetching all LGAs:", error);
            } finally {
                setIsLoading(prev => ({...prev, lgas: false}));
            }
        };

        fetchAllLGAs();
    }, []);

    // Fetch ALL wards on component mount
    useEffect(() => {
        const fetchAllWards = async () => {
            setIsLoading(prev => ({...prev, wards: true}));
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/council-wards/all`);
                setAllWards(response.data);
            } catch (error) {
                console.error("Error fetching all wards:", error);
            } finally {
                setIsLoading(prev => ({...prev, wards: false}));
            }
        };

        fetchAllWards();
    }, []);

    // Filter LGAs when state is selected
    useEffect(() => {
        if (!selectedState) {
            setLgas([]);
            setSelectedLga(null);
            return;
        }

        const filteredLgas = allLgas.filter(lga => lga.stateId === selectedState.id);
        setLgas(filteredLgas);
        setSelectedLga(null);
    }, [selectedState, allLgas]);

    // Filter wards when LGA is selected
    useEffect(() => {
        if (!selectedLga) {
            setWards([]);
            setSelectedWard(null);
            return;
        }

        const filteredWards = allWards.filter(ward => ward.localGovernmentId === selectedLga.id);
        setWards(filteredWards);
        setSelectedWard(null);
    }, [selectedLga, allWards]);

    const handleChange = (field: keyof typeof formData) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleOpenMarketModal = () => {
        if (!selectedState || !selectedLga || !selectedWard || !formData.marketName) {
            alert("Please fill all required fields");
            return;
        }
        setIsMarketModalOpen(true);
    };

    const handleSuccess = () => {
        setIsSuccessModalOpen(true);
        // Reset form after successful submission
        setSelectedState(null);
        setSelectedLga(null);
        setSelectedWard(null);
        setFormData({
            location: "",
            marketName: ""
        });
    };

    const resetForm = () => {
        setSelectedState(null);
        setSelectedLga(null);
        setSelectedWard(null);
        setFormData({
            location: "",
            marketName: ""
        });
    };

    return (
        <>
            <div className="">
                <div className="text-[#707070] text-[14px] px-[20px] font-medium gap-[8px] flex items-center h-[56px] w-full border-b-[0.5px] border-[#ededed]">
                    <Image
                        src={arrowBack}
                        alt="Back arrow"
                        width={24}
                        height={24}
                        className="cursor-pointer"
                        onClick={() => router.push("/admin/dashboard/markets")}
                    />
                    <p
                        className="cursor-pointer"
                        onClick={() => router.push("/admin/dashboard/markets")}
                    >
                        Back to market management
                    </p>
                </div>
                <div className="text-[#022B23] text-[14px] px-[20px] font-medium gap-[8px] flex items-center h-[49px] w-full border-b-[0.5px] border-[#ededed]">
                    <p>Onboard new market</p>
                </div>
                <div className="pt-[69px] pl-[174px] flex gap-[158px]">
                    <div className="flex flex-col gap-[7px] w-[268px]">
                        <p className="text-[#022B23] text-[14px] font-medium">Market onboarding</p>
                        <p className="text-[#707070] leading-tight text-[14px] font-medium">
                            Onboard a new new market
                            <br/>within the platform.
                        </p>
                    </div>
                    <div className="flex flex-col w-[400px] h-[438px] gap-[38px]">
                        <div className="flex flex-col gap-[14px]">
                            <LocationDropdown
                                options={states}
                                selectedOption={selectedState}
                                onSelect={setSelectedState}
                                placeholder="State"
                                isLoading={isLoading.states}
                            />
                            <LocationDropdown
                                options={lgas}
                                selectedOption={selectedLga}
                                onSelect={setSelectedLga}
                                placeholder="Local Government"
                                isLoading={isLoading.lgas}
                                disabled={!selectedState}
                            />
                            <LocationDropdown
                                options={wards}
                                selectedOption={selectedWard}
                                onSelect={setSelectedWard}
                                placeholder="Local council area"
                                isLoading={isLoading.wards}
                                disabled={!selectedLga}
                            />
                            <InputField
                                id="location"
                                label="Location"
                                value={formData.location}
                                onChange={handleChange('location')}
                                placeholder="Location"
                            />
                            <InputField
                                id="marketName"
                                label="Market name"
                                value={formData.marketName}
                                onChange={handleChange('marketName')}
                                placeholder="Market name"
                            />
                        </div>
                        <div
                            onClick={handleOpenMarketModal}
                            className="flex h-[52px] cursor-pointer text-[14px] rounded-[12px] font-semibold text-[#C6EB5F] bg-[#022B23] w-full items-center justify-center gap-[9px]"
                        >
                            <p>Continue</p>
                            <Image src={arrowRight} alt="Continue arrow"/>
                        </div>
                    </div>
                </div>

                <OnboardMarketModal
                    isOpen={isMarketModalOpen}
                    onClose={() => setIsMarketModalOpen(false)}
                    onSuccess={handleSuccess}
                    marketData={{
                        name: formData.marketName,
                        address: formData.location,
                        stateId: selectedState?.id || 0,
                        localGovernmentId: selectedLga?.id || 0,
                        councilId: selectedWard?.id || 0
                    }}
                />

                <OnboardMarketSuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => {
                        setIsSuccessModalOpen(false);
                        resetForm();
                    }}
                />
            </div>
        </>
    );
};

export default OnboardMarket;