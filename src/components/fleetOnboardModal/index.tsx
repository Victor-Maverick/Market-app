
import { useEffect, useState } from "react";
import Image from "next/image";
import limeArrow from "@/../public/assets/images/green arrow.png";
import {ChevronDown} from "lucide-react";

interface Vehicle {
    type: string;
    plateNumber: string;
    engineNumber: string;
}

const vehicleTypes = [
    { label: "Bike" },
    { label: "Truck" },
    { label: "Car" }
];

interface FleetOnboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    fleetCount: number;
    onSubmit: (vehicles: Vehicle[]) => void;
}

type InputFieldProps = {
    id: string;
    size: number;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    optional?: boolean;
};

const InputField = ({
                        id,
                        size,
                        label,
                        value,
                        onChange,
                        placeholder,
                        optional = false,
                    }: InputFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div style={{width:size}} className="relative flex flex-col">
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
                className={`px-4 w-full h-[58px] border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] ${
                    isFocused || value
                        ? "pt-[14px] pb-[4px] text-[#121212] text-[12px] font-medium"
                        : "text-[#BDBDBD] text-[14px] font-medium"
                }`}
            />
        </div>
    );
};

const Dropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<{ label: string } | null>(null);

    return (
        <div className="relative w-[98px]">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="border-[1.5px] rounded-[14px] h-[58px] flex justify-between px-[18px] border-[#D1D1D1] items-center cursor-pointer"
            >
                <p className={`${selectedOption ? "text-[#121212]" : "text-[#BDBDBD]"} text-[16px] font-normal`}>
                    {selectedOption ? selectedOption.label : "Type"}
                </p>
                <ChevronDown
                    size={24}
                    className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    color="#BDBDBD"
                />
            </div>

            {isOpen && (
                <div className="absolute left-0  w-full bg-white text-black rounded-md shadow-lg z-10 border border-[#ededed]">
                    <ul className="py-1">
                        {vehicleTypes.map((option, index) => (
                            <li
                                key={index}
                                className="px-4 py-2 text-black hover:bg-[#ECFDF6] cursor-pointer"
                                onClick={() => {
                                    setSelectedOption(option);
                                    setIsOpen(false);
                                }}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export const FleetOnboardModal = ({
                                      isOpen,
                                      onClose,
                                      fleetCount,
                                      onSubmit,
                                  }: FleetOnboardModalProps) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    useEffect(() => {
        if (isOpen && fleetCount > 0) {
            setVehicles(
                Array.from({ length: fleetCount }, () => ({
                    type: "",
                    plateNumber: "",
                    engineNumber: "",
                }))
            );
        }
    }, [fleetCount, isOpen]);

    const handleChange = (index: number, field: keyof Vehicle, value: string) => {
        const updatedVehicles = [...vehicles];
        updatedVehicles[index][field] = value;
        setVehicles(updatedVehicles);
    };

    const handleSubmit = () => {
        onSubmit(vehicles);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white px-10 py-25 w-[950px] gap-[30px]  max-h-[100vh]  flex flex-col items-center">
                <div className="w-[547px] text-left">
                    <h2 className="text-[16px] font-medium text-[#022B23]">Onboard Fleet</h2>
                    <p className="text-[14px] font-medium leading-tight text-[#707070]">
                        Onboard your fleet and riders to help <br />
                        you manage them easily
                    </p>
                </div>

                <div className="flex flex-col items-center gap-[12px]">
                    {vehicles.map((vehicle, index) => (
                        <div
                            key={index}
                            className="flex  w-[547px] justify-between items-center"
                        >
                            <InputField
                                placeholder="Vehicle engine number"
                                value={vehicle.engineNumber}
                                onChange={(value) => handleChange(index, "engineNumber", value)}
                                id={`engine-${index}`}
                                label="Vehicle engine number" size={256}                            />
                            <InputField
                                placeholder="Plate Number"
                                value={vehicle.plateNumber}
                                onChange={(value) => handleChange(index, "plateNumber", value)}
                                id={`plate-${index}`}
                                label="Plate Number" size={152}
                            />
                            <Dropdown/>
                        </div>
                    ))}
                </div>

                <div
                    className="flex w-[513px]  gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors"
                    onClick={handleSubmit}
                >
                    <p className="text-[#C6EB5F] font-semibold text-[14px]">
                        Continue to onboard fleet
                    </p>
                    <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />
                </div>
            </div>
        </div>
    );
};
