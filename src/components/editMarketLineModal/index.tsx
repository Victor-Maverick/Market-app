import { useState } from "react";
import Image from "next/image";
import limeArrow from "../../../public/assets/images/green arrow.png";

interface InputFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    optional?: boolean;
}

const Toast = ({
                   type,
                   message,
                   subMessage,
               }: {
    type: "success" | "error";
    message: string;
    subMessage: string;
    onClose: () => void;
}) => {
    return (
        <div className={`fixed top-6 right-6 w-[243px] bg-white ${type === "success" ? 'h-auto' : 'h-[138px]'} rounded-md shadow-lg z-50 border border-[#ededed]`}>
            <div className="flex w-full gap-[16px] px-[16px] py-[12px]">
                <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full ${
                        type === "success" ? "bg-green-100" : "bg-red-100"
                    }`}
                >
                    <div
                        className={`w-3 h-3 rounded-full ${
                            type === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                    ></div>
                </div>
                <div className="flex-1">
                    <p className="text-[#001234] text-[12px] font-medium">{message}</p>
                    <p className="text-[11px] text-[#707070] font-medium">{subMessage}</p>
                    {type === "error" && (
                        <p className="mt-[30px]">Try again</p>
                    )}
                </div>
            </div>
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

interface EditMarketLineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: (newName: string, id: number) => Promise<void>; // Updated to be async
    name?: string;
    id?: number;
}

const EditMarketLineModal = ({
                                 isOpen,
                                 onClose,
                                 onContinue,
                                 name,
                                 id,
                             }: EditMarketLineModalProps) => {
    const [formData, setFormData] = useState({
        name: name || ""
    });
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field: keyof typeof formData) => (value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setToastType("error");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 2000);
            return;
        }

        setIsLoading(true);

        try {
            // Call the onContinue prop which should handle the API call
            if (id) {
                await onContinue(formData.name, id);
            }

            setToastType("success");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                setFormData({ name: "" });
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Error updating section:", error);
            setToastType("error");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 2000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseToast = () => {
        setShowToast(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#808080]/20">
                <div
                    className={`bg-white px-10 py-25 w-[722px] justify-center gap-[30px] h-[461px] flex flex-col items-center transition-all ${
                        showToast ? " blur-[2px] " : ""
                    }`}
                >
                    <div className="w-[542px] flex flex-col gap-[64px] text-left">
                        <div className="w-[268px] flex font-medium flex-col gap-[14px]">
                            <p className="text-[#022B23] text-[16px]">Edit {name}</p>
                        </div>

                        <div className="flex flex-col w-[528px] gap-[40px]">
                            <div className="flex gap-[12px] w-full">
                                <div className="w-[65%]">
                                    <InputField
                                        id="name"
                                        label="Line name"
                                        value={formData.name}
                                        onChange={handleChange("name")}
                                        placeholder="Line name"
                                    />
                                </div>
                            </div>
                            <div
                                onClick={handleSubmit}
                                className={`flex w-[513px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors ${
                                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                <p className="text-[#C6EB5F] font-semibold text-[14px]">
                                    {isLoading ? "Saving..." : "Update and save"}
                                </p>
                                {!isLoading && (
                                    <Image
                                        src={limeArrow}
                                        alt="Continue arrow"
                                        width={18}
                                        height={18}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showToast && (
                <Toast
                    type={toastType}
                    message={
                        toastType === "success"
                            ? "Changes saved successfully"
                            : "Error saving changes"
                    }
                    subMessage={
                        toastType === "success"
                            ? "Your changes have been updated"
                            : "Failed to update section. Please try again."
                    }
                    onClose={handleCloseToast}
                />
            )}
        </>
    );
};

export default EditMarketLineModal;