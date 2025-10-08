'use client'
import DashboardHeader from "@/components/dashboardHeader";
import DashboardSubHeader from "@/components/dashboardSubHeader";
import dashImg from "../../../../public/assets/images/Logistics-rafiki.svg";
import Image from "next/image";
import arrow from "../../../../public/assets/images/arrow-right.svg";
import greenTick from "../../../../public/assets/images/green tick.png";
import limeArrow from "../../../../public/assets/images/green arrow.png";
import {useState} from "react";
import {ChevronDown} from "lucide-react";
import {useRouter} from "next/navigation";

const banks = [
    { label: "UNITED BANK 0F AFRICA" },
    { label: "FIRST BANK OF NIGERIA" },
    { label: "FIDELITY BANK" },
    { label: "GT BANK" },
    { label: "ZENITH BANK" },
];
const DropDown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<{ label: string } | null>(null);

    return (
        <div className="relative ">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="border-[1.5px] rounded-[14px] h-[58px] flex justify-between px-[18px] border-[#D1D1D1] items-center cursor-pointer"
            >
                <p className={`${selectedOption ? "text-[#121212]" : "text-[#BDBDBD]"} text-[16px] font-medium`}>
                    {selectedOption ? selectedOption.label : "Bank name"}
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
                        {banks.map((option, index) => (
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

const BankDetails = () => {
    const [formData, setFormData] = useState({
        accountNumber: "",


    });
    const router = useRouter();
    const handleChange = (field: keyof typeof formData) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleContinue = () => {
        router.push('/logistics/completed');
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
                    <span className="cursor-pointer text-[#022B23]">Bank Details //</span>
                    <span className="cursor-pointer"> Completed</span>
                </p>
            </div>
            <div className="flex ml-[366px] w-auto mt-16 gap-25">
                <div className="flex flex-col w-[268px] h-[67px] gap-[10px]">
                    <p className="text-[#022B23] text-[16px] font-medium">Bank details</p>
                    <p className="text-[#707070] font-medium text-[14px]">
                        Provide your bank details so we can use<br/> it to process your payout
                    </p>
                </div>
                <div className="flex flex-col w-[400px] h-auto gap-[38px]">
                    <div className="flex flex-col gap-[10px]">
                        <DropDown/>
                        <InputField
                            id="accountNumber"
                            label="Account number"
                            value={formData.accountNumber}
                            onChange={handleChange('accountNumber')}
                            placeholder="Account number"
                        />
                        <div className="flex-col flex ">
                            <div className="h-[40px] flex justify-between font-medium text-[#121212] w-full rounded-[8px]  items-center px-[18px] text-[14px] bg-[#ECFDF6]">
                                <p>Terngu paul</p>
                                <Image src={greenTick} alt={'image'}/>
                            </div>
                        </div>


                    </div>
                    <div
                        className="flex mb-[20px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors"
                        onClick={handleContinue}
                    >
                        <p className="text-[#C6EB5F] font-semibold text-[14px]">Complete KYC & setup shop</p>
                        <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />
                    </div>
                </div>
            </div>
        </>
    )
}
export default BankDetails;