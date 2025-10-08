import Image from "next/image";
import limeArrow from "../../../public/assets/images/green arrow.png";
import {ChangeEvent, useRef, useState} from "react";
import uploadIcon from "../../../public/assets/images/uploadIcon.png";

interface AddLogMemberModalProps {
    isAddLogMemberModalOpen: boolean;
    onCloseAddLogMemberModal: () => void;
    onRequestSuccess: () => void; // New prop for success flow
}
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
                className={`px-4 h-[58px] mb-[-15px] w-full border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] ${
                    isFocused || value
                        ? "pt-[14px] pb-[4px] text-[#121212] text-[14px] font-medium"
                        : "text-[#BDBDBD] text-[16px] font-medium"
                }`}
            />
        </div>
    );
};

const AddLogMemberModal = ({
                               isAddLogMemberModalOpen,
                               onRequestSuccess
                           }: AddLogMemberModalProps)=>{
    const [formData, setFormData] = useState({
        email: "",
        fullName: ""
    });

    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size exceeds 2MB limit");
                return;
            }

            if (!file.type.match('image.*')) {
                alert("Please select an image file");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setUploadedImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setUploadedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    const handleChange = (field: keyof typeof formData) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleContinue = () => {
        onRequestSuccess(); // Call parent's success handler
    };

    if (!isAddLogMemberModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white px-10 py-20 w-[950px] max-h-[90vh] flex flex-col items-center gap-6 overflow-hidden">
                <div className="w-[530px] h-[447px] gap-[28px] flex flex-col flex-shrink-0 mx-auto">
                    <div>
                        <h2 className="text-[16px] font-medium text-[#022B23]">New team member</h2>
                        <p className="text-[14px] font-medium leading-tight text-[#707070]">
                            Add new team member to your <br/>company
                        </p>
                    </div>
                    <InputField
                        id="email"
                        label="Email"
                        value={formData.email}
                        onChange={handleChange('email')}
                        placeholder="Email"
                    />
                    <InputField
                        id="fullName"
                        label="Full name"
                        value={formData.fullName}
                        onChange={handleChange('fullName')}
                        placeholder="Full name"
                    />

                    <div className="">
                        <p className="mb-[5px] text-[12px] font-medium text-[#6D6D6D]">
                            Upload business logo<span className="text-[#B0B0B0]">(optional)</span>
                        </p>
                        <div
                            className="flex flex-col gap-[8px] text-center items-center w-full h-[102px] rounded-[14px] bg-[#ECFDF6] justify-center border border-dashed border-[#022B23] cursor-pointer relative overflow-hidden"
                            onClick={triggerFileInput}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />

                            {uploadedImage ? (
                                <>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Image
                                            src={uploadedImage}
                                            alt="Uploaded logo"
                                            width={96}
                                            height={96}
                                            className="rounded-lg object-cover w-[96px] h-[96px]"
                                        />
                                    </div>
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Image src={uploadIcon} alt="Upload icon" width={24} height={24} />
                                    <p className="text-[12px] font-medium text-[#022B23]">
                                        <span className="underline">Upload</span> your company logo
                                        <br />(2MB max)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div
                        className="flex mb-[20px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors"
                        onClick={handleContinue}
                    >
                        <p className="text-[#C6EB5F] font-semibold text-[14px]">Add new member</p>
                        <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddLogMemberModal;