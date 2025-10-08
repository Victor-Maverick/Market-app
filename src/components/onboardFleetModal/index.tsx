'use client';
import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import limeArrow from "@/../public/assets/images/green arrow.png";
import { NewVehicleData } from "@/types/vehicle";


const vehicleTypes = [
    { label: "Bike" as const },
    { label: "Truck" as const },
];

interface OnboardFleetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (vehicles: NewVehicleData[]) => Promise<void>;
}



const InputField = ({
                        id,
                        size,
                        label,
                        value,
                        onChange,
                        placeholder,
                        optional = false,
                    }: {
    id: string;
    size: number;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    optional?: boolean;
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div style={{ width: size }} className="relative flex flex-col">
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
                type={id === "fleetNumber" ? "number" : "text"}
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

const Dropdown = ({ onChange }: { onChange: (value: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<{ label: string } | null>(null);

    return (
        <div className="relative w-[98px]">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="border-[1.5px] rounded-[14px] h-[58px] flex justify-between px-[18px] border-[#D1D1D1] items-center cursor-pointer"
            >
                <p
                    className={`${
                        selectedOption ? "text-[#121212]" : "text-[#BDBDBD]"
                    } text-[16px] font-normal`}
                >
                    {selectedOption ? selectedOption.label : "Type"}
                </p>
                <ChevronDown
                    size={24}
                    className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    color="#BDBDBD"
                />
            </div>
            {isOpen && (
                <div className="absolute left-0 w-full bg-white text-black rounded-md shadow-lg z-10 border border-[#ededed]">
                    <ul className="py-1">
                        {vehicleTypes.map((option, index) => (
                            <li
                                key={index}
                                className="px-4 py-2 text-black hover:bg-[#ECFDF6] cursor-pointer"
                                onClick={() => {
                                    setSelectedOption(option);
                                    onChange(option.label);
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

export const OnboardFleetModal = ({ isOpen, onClose, onSubmit }: OnboardFleetModalProps) => {
    const [fleetNumber, setFleetNumber] = useState("");
    const [vehicles, setVehicles] = useState<NewVehicleData[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setFleetNumber("");
            setVehicles([]);
            setError("");
        }
    }, [isOpen]);

    useEffect(() => {
        const num = parseInt(fleetNumber);
        if (isNaN(num) || num <= 0 || num > 50) {
            setVehicles([]);
            return;
        }

        setVehicles((prevVehicles) =>
            Array.from({ length: num }, (_, index) => ({
                type: prevVehicles[index]?.type || "",
                plateNumber: prevVehicles[index]?.plateNumber || "",
                engineNumber: prevVehicles[index]?.engineNumber || "",
            }))
        );
    }, [fleetNumber]);

    const handleChange = (index: number, field: keyof NewVehicleData, value: string) => {
        setVehicles((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSubmit = async () => {
        const num = parseInt(fleetNumber);
        if (isNaN(num) || num <= 0) {
            setError("Please enter a valid fleet number");
            return;
        }

        const validVehicles = vehicles.filter(
            (v) => v.type && v.plateNumber && v.engineNumber
        );

        if (validVehicles.length !== num) {
            setError("Please fill all vehicle details");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await onSubmit(validVehicles);
            onClose();
        } catch (err) {
            setError("Failed to onboard fleet. Please try again.");
            console.error("Submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white px-10 py-6 w-[950px] max-h-[80vh] flex flex-col items-center gap-6 overflow-hidden rounded-lg">
                <div className="w-[547px] flex-shrink-0 mx-auto">
                    <h2 className="text-[16px] font-medium text-[#022B23] pl-4">Onboard Fleet</h2>
                    <p className="text-[14px] font-medium leading-tight text-[#707070] pl-4">
                        Onboard your fleet and riders to help <br />
                        you manage them easily
                    </p>
                </div>

                <InputField
                    placeholder="Number of fleet"
                    value={fleetNumber}
                    onChange={setFleetNumber}
                    id="fleetNumber"
                    label="Number of fleet"
                    size={547}
                />

                {error && (
                    <div className="text-red-500 text-sm w-[547px] text-center">
                        {error}
                    </div>
                )}

                {vehicles.length > 0 && (
                    <div className="flex flex-col gap-[12px] w-[547px] max-h-[calc(80vh-200px)] overflow-y-auto pb-6 mx-auto">
                        {vehicles.map((vehicle, index) => (
                            <div
                                key={index}
                                className="flex w-full justify-between items-center flex-shrink-0"
                            >
                                <InputField
                                    placeholder="Vehicle engine number"
                                    value={vehicle.engineNumber}
                                    onChange={(value) => handleChange(index, "engineNumber", value)}
                                    id={`engine-${index}`}
                                    label="Vehicle engine number"
                                    size={256}
                                />
                                <InputField
                                    placeholder="Plate Number"
                                    value={vehicle.plateNumber}
                                    onChange={(value) => handleChange(index, "plateNumber", value)}
                                    id={`plate-${index}`}
                                    label="Plate Number"
                                    size={152}
                                />
                                <Dropdown
                                    onChange={(value) => handleChange(index, "type", value)}
                                />
                            </div>
                        ))}
                        <button
                            className="flex w-[513px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] min-h-[52px] flex-shrink-0 hover:bg-[#033a30] transition-colors mt-4 mx-auto disabled:opacity-50"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            <p className="text-[#C6EB5F] font-semibold text-[14px]">
                                {isSubmitting ? "Processing..." : "Continue to onboard fleet"}
                            </p>
                            {!isSubmitting && <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};