'use client';
import {useState, useRef, ChangeEvent, useEffect, useCallback} from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from 'axios';
import uploadIcon from "../../../public/assets/images/uploadIcon.png";
import galleryImg from '../../../public/assets/images/galleryImg.svg';
import limeArrow from "../../../public/assets/images/green arrow.png";
import biArrows from "../../../public/assets/images/biArrows.svg";
import arrowUp from "../../../public/assets/images/arrow-up.svg";
import flagImg from '../../../public/assets/images/flag-2.svg';
import dropBoxImg from '../../../public/assets/images/dropbox.svg';
import archiveImg from '../../../public/assets/images/archive.svg';
import arrowDown from '../../../public/assets/images/arrow-down.svg';
import iPhone from '../../../public/assets/images/blue14.png';
import arrowBack from '../../../public/assets/images/arrow-right.svg';
import arrowRight from '../../../public/assets/images/grey right arrow.png';
import displayImg from '../../../public/assets/images/iphone14Img.svg'
import {ProductAddedModal} from "@/components/productAddedModal";
import {useSession} from "next-auth/react";

type Category = {
    id: string;
    name: string;
};

type SubCategory = {
    id: string;
    name: string;
};

type ProductFormData = {
    productName: string;
    price: string;
    description: string;
    quantity: string;
    categoryId?: string;
    categoryName?: string;
    subCategoryId?: string;
    subCategoryName?: string;
};
type ProductOne = {
    id: number;
    name: string;
    mainImageUrl: string;
    price: number;
    quantity: number;
    quantitySold: number;
};

type InputFieldProps = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    optional?: boolean;
    className?: string;
    type?: string;
};

type Product = {
    id: number;
    mainImageUrl: string;
    name: string;
    review: number;
    status: string;
    quantitySold: number;
    price: number;
    salesAmount: string;
    quantity: number;
    remainingStock: string;
};

const ProductActionsDropdown = ({
                                    productId,
                                    children,
                                    onEdit,
                                    onDelete,
                                }: {
    productId: number;
    children: React.ReactNode;
    onEdit: (productId: number) => void;
    onDelete: (productId: number) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={handleToggle}
                className="cursor-pointer flex flex-col gap-[3px] items-center justify-center"
            >
                {children}
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg z-50 border border-[#ededed] w-[125px]">
                    <ul className="py-1">
                        <li
                            className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                            onClick={() => {
                                onEdit(productId);
                                setIsOpen(false);
                            }}
                        >
                            Edit
                        </li>
                        <li className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer">Promote</li>
                        <li
                            className="px-4 py-2 text-[12px] hover:bg-[#FFFAF9] cursor-pointer text-[#FF5050]"
                            onClick={() => {
                                onDelete(productId);
                                setIsOpen(false);
                            }}
                        >
                            Remove product
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

type EditProductModalProps = {
    isOpen: boolean;
    onClose: () => void;
    product: ProductOne | null;
    onSave: (productId: number, price: number, quantity: number) => Promise<void>;
};

const EditProductModal = ({ isOpen, onClose, product, onSave }: EditProductModalProps) => {
    const [price, setPrice] = useState(product?.price.toString() || '');
    const [quantity, setQuantity] = useState(product?.quantity.toString() || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (product) {
            setPrice(product.price.toString());
            setQuantity(product.quantity.toString());
        }
    }, [product]);

    const handleSave = async () => {
        if (!product) return;

        try {
            setIsSaving(true);
            await onSave(product.id, Number(price), Number(quantity));
            onClose();
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white rounded-[4px] p-6 w-[90%] max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[#022B23] text-[18px] font-medium">Edit Product</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-[#6D6D6D] text-[12px] font-medium mb-1">Price (NGN)</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 h-[44px] border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-[#6D6D6D] text-[12px] font-medium mb-1">Quantity to add to stock or reduce stock(-ve or +ve)</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-4 h-[44px] border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none"
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-[#D1D1D1] rounded-[2px] text-[#022B23]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`px-4 py-2 bg-[#022B23] cursor-pointer text-white rounded-[4px] ${isSaving ? 'opacity-50' : ''}`}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

type ConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: ConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white rounded-[4px] p-6 w-[90%] max-w-md">
                <div className="mb-4">
                    <h2 className="text-[#022B23] text-[18px] font-medium">{title}</h2>
                    <p className="text-[#6D6D6D] mt-2">{message}</p>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border cursor-pointer border-[#D1D1D1] rounded-[4px] text-[#022B23]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-[#FF5050] cursor-pointer text-white rounded-[4px]"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProductTableRow = ({
                             product,
                             isLast,
                             onEdit,
                             onDelete
                         }: {
    product: ProductOne;
    isLast: boolean;
    onEdit: (productId: number) => void;
    onDelete: (productId: number) => void;
}) => {
    return (
        <>
        <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}>
            <div className="flex items-center w-[284px] pr-[24px] gap-3">
                <div className="bg-[#f9f9f9] h-full w-[70px] overflow-hidden mt-[2px]">
                    <Image
                        src={product.mainImageUrl}
                        alt={product.name}
                        width={70}
                        height={72}
                        className="object-cover h-full"
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-[14px] font-medium text-[#101828]">{product.name}</p>
                    {/*<p className="text-[12px] text-[#667085]">Review: {product.review}</p>*/}
                </div>
            </div>

            <div className="flex items-center w-[90px] px-[24px]">
                {/*<div className={`w-[55px] h-[22px] rounded-[8px] flex items-center justify-center ${*/}
                {/*    product.status === 'Active'*/}
                {/*        ? 'bg-[#ECFDF3] text-[#027A48]'*/}
                {/*        : 'bg-[#FEF3F2] text-[#FF5050]'*/}
                {/*}`}>*/}
                {/*    <p className="text-[12px] font-medium">{product.status}</p>*/}
                {/*</div>*/}
            </div>

            <div className="flex flex-col justify-center w-[149px] px-[15px]">
                <p className="text-[14px] text-[#101828]">Sales</p>
                <p className="text-[14px] font-medium text-[#101828]">{product.quantitySold}</p>
            </div>

            <div className="flex items-center w-[170px] px-[24px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    NGN {product.price.toLocaleString()}.00
                </p>
            </div>

            <div className="flex flex-col justify-center w-[173px] px-[24px]">
                <p className="text-[14px] text-[#101828]">Sales</p>
                <p className="text-[14px] font-medium text-[#101828]">
                    NGN {product.price * product.quantitySold}.00
                </p>
            </div>

            <div className="flex items-center w-[115px] px-[24px]">
                <p className="text-[14px] font-medium text-[#101828]">{product.quantity}</p>
            </div>

            <div className="flex items-center w-[200px] px-[24px] gap-2">
                <div className="flex-1 h-[6px] bg-[#EAECF0] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#C6EB5F] rounded-full"
                        style={{
                            width: `${(Number(product.quantity-product.quantitySold) / Number(product.quantity)) * 100}%`
                        }}
                    />
                </div>
                <p className="text-[14px] font-medium text-[#101828] min-w-[40px]">
                    {product.quantity-product.quantitySold}
                </p>
            </div>

            <div className="flex items-center justify-center w-[40px]">
                <ProductActionsDropdown
                    productId={product.id}
                    onEdit={onEdit}
                    onDelete={onDelete}
                >
                    <>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    </>
                </ProductActionsDropdown>
            </div>
        </div>

        </>
    );
};


const CategoryDropDown = ({
                              categories,
                              selected,
                              onSelect,
                              className = "",
                              loading = false
                          }: {
    categories: Category[];
    selected: string;
    onSelect: (categoryId: string, categoryName: string) => void;
    className?: string;
    loading?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`relative ${className}`}>
            <div
                onClick={() => !loading && setIsOpen(!isOpen)}
                className={`border-[1.5px] rounded-[14px] h-[44px] flex justify-between px-[18px] border-[#D1D1D1] items-center ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
                <p className="text-[#BDBDBD] text-[16px] font-medium">
                    {loading ? 'Loading categories...' : selected}
                </p>
                <ChevronDown
                    size={18}
                    className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    color="#D1D1D1"
                />
            </div>

            {isOpen && !loading && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10 border border-[#ededed] max-h-60 overflow-y-auto">
                    <ul className="py-1">
                        {categories.map((category) => (
                            <li
                                key={category.id}
                                className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                                onClick={() => {
                                    onSelect(category.id, category.name);
                                    setIsOpen(false);
                                }}
                            >
                                {category.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const SubCategoryDropDown = ({
                                 subcategories,
                                 selected,
                                 onSelect,
                                 className = "",
                                 loading = false,
                                 disabled = false
                             }: {
    subcategories: SubCategory[];
    selected: string;
    onSelect: (subCategoryId: string, subCategoryName: string) => void;
    className?: string;
    loading?: boolean;
    disabled?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`relative ${className}`}>
            <div
                onClick={() => !loading && !disabled && setIsOpen(!isOpen)}
                className={`border-[1.5px] rounded-[14px] h-[44px] flex justify-between px-[18px] border-[#D1D1D1] items-center ${
                    loading ? 'cursor-not-allowed opacity-50' :
                        disabled ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer'
                }`}
            >
                <p className={`text-[16px] font-medium ${
                    selected === "SubCategory" ? "text-[#BDBDBD]" : "text-[#121212]"
                }`}>
                    {loading ? 'Loading subcategories...' : selected}
                </p>
                <ChevronDown
                    size={18}
                    className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    color={disabled ? "#BDBDBD" : "#D1D1D1"}
                />
            </div>

            {isOpen && !loading && !disabled && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10 border border-[#ededed] max-h-60 overflow-y-auto">
                    <ul className="py-1">
                        {subcategories.map((subcategory) => (
                            <li
                                key={subcategory.id}
                                className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
                                onClick={() => {
                                    onSelect(subcategory.id, subcategory.name);
                                    setIsOpen(false);
                                }}
                            >
                                {subcategory.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// const DropDown = ({
//                       options,
//                       selected,
//                       onSelect,
//                       className = ""
//                   }: {
//     options: string[];
//     selected: string;
//     onSelect: (option: string) => void;
//     className?: string;
// }) => {
//     const [isOpen, setIsOpen] = useState(false);
//
//     return (
//         <div className={`relative ${className}`}>
//             <div
//                 onClick={() => setIsOpen(!isOpen)}
//                 className="border-[1.5px] rounded-[14px] h-[44px] flex justify-between px-[18px] border-[#D1D1D1] items-center cursor-pointer"
//             >
//                 <p className="text-[#BDBDBD] text-[16px] font-medium">{selected}</p>
//                 <ChevronDown
//                     size={18}
//                     className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
//                     color="#D1D1D1"
//                 />
//             </div>
//
//             {isOpen && (
//                 <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg z-10 border border-[#ededed]">
//                     <ul className="py-1">
//                         {options.map((option, index) => (
//                             <li
//                                 key={index}
//                                 className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer"
//                                 onClick={() => {
//                                     onSelect(option);
//                                     setIsOpen(false);
//                                 }}
//                             >
//                                 {option}
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
//         </div>
//     );
// };

const InputField = ({
                        id,
                        label,
                        value,
                        onChange,
                        placeholder,
                        optional = false,
                        className = "",
                        type = "text",
                    }: InputFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`relative w-full flex flex-col ${className}`}>
            <label
                htmlFor={id}
                className={`absolute left-4 transition-all ${
                    isFocused || value
                        ? "text-[#6D6D6D] text-[12px] font-medium top-[6px]"
                        : "hidden"
                }`}
            >
                {label} {optional && <span className="text-[#B0B0B0">(optional)</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={!isFocused && !value ? placeholder : ""}
                className={`px-4 h-[58px] w-full border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] ${
                    isFocused || value
                        ? "pt-[14px] pb-[4px] text-[#121212] text-[14px]"
                        : "text-[#BDBDBD] text-[16px] font-medium"
                }`}
            />
        </div>
    );
};

const PreviewView = ({
                         formData,
                         uploadedImagePreview,
                         sideImagePreviews,
                         onBack,
                         onPublish,
                         isPublishing
                     }: {
    formData: ProductFormData;
    uploadedImagePreview: string | null;
    sideImagePreviews: string[];
    onBack: () => void;
    onPublish: () => void;
    isPublishing: boolean;
}) => {
    // Remove the local modal state and handler since we'll manage it from parent
    const handlePublish = () => {
        onPublish();
    };

    return (
        <>
            <div className="flex justify-between">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
                        <Image src={arrowBack} alt="Back" width={20} height={20} />
                        <p className="text-[#022B23] text-[14px] font-medium">Back to edit</p>
                    </div>

                    <div className="flex flex-col gap-[2px] h-[44px]">
                        <p className="text-[16px] font-medium text-[#022B23]">Preview and publish to shop</p>
                        <p className="text-[#707070] font-medium text-[14px]">View product detail before you publish</p>
                    </div>

                    <div className="w-[500px] flex flex-col h-[393px] gap-[24px]">
                        <div className="flex flex-col gap-[8px]">
                            <div className="w-full bg-[#F7F7F7] py-[8px] flex flex-col gap-[2px] h-[58px] rounded-[14px] border-[0.5px] border-[#E4E4E4] pl-[18px]">
                                <p className="text-[#6D6D6D] text-[12px] font-medium">Product name</p>
                                <p className="text-[#121212] text-[14px] font-medium">{formData.productName}</p>
                            </div>
                            <div className="w-full bg-[#F7F7F7] p-[18px] flex flex-col gap-[2px] h-[179px] rounded-[14px] border-[0.5px] border-[#E4E4E4] pl-[18px]">
                                <p className="text-[#6D6D6D] text-[12px] font-medium">Description</p>
                                <p className="text-[#121212] text-[14px] font-medium">{formData.description}</p>
                            </div>
                            <div className="w-full bg-[#F7F7F7] py-[8px] flex flex-col gap-[2px] h-[58px] rounded-[14px] border-[0.5px] border-[#E4E4E4] pl-[18px]">
                                <p className="text-[#6D6D6D] text-[12px] font-medium">Price</p>
                                <p className="text-[#121212] text-[14px] font-medium">NGN {Number(formData.price).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="w-full bg-[#F7F7F7] py-[8px] flex flex-col gap-[2px] h-[58px] rounded-[14px] border-[0.5px] border-[#E4E4E4] pl-[18px]">
                            <p className="text-[#6D6D6D] text-[12px] font-medium">Quantity</p>
                            <p className="text-[#121212] text-[14px] font-medium">{formData.quantity}</p>
                        </div>
                        <div className="w-full bg-[#F7F7F7] py-[8px] flex flex-col gap-[2px] h-[58px] rounded-[14px] border-[0.5px] border-[#E4E4E4] pl-[18px]">
                            <p className="text-[#6D6D6D] text-[12px] font-medium">Category</p>
                            <p className="text-[#121212] text-[14px] font-medium">{formData.categoryName || 'No category selected'}</p>
                        </div>
                    </div>

                    <div
                        className={`flex mt-[100px] mb-[20px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handlePublish}
                    >
                        <p className="text-[#C6EB5F] font-semibold text-[14px]">
                            {isPublishing ? 'Publishing...' : 'Publish product to store'}
                        </p>
                        {!isPublishing && <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />}
                    </div>
                </div>

                <div className="flex w-[500px] text-[#022B23] gap-[24px] text-[14px] font-medium flex-col pt-[109px]">
                    <div className="flex flex-col gap-[2px]">
                        <p>Display image</p>
                        <div className="w-full rounded-[24px] flex justify-center items-end bg-[#F9F9F9] h-[404px] mt-[5px]">
                            {uploadedImagePreview ? (
                                <Image
                                    src={uploadedImagePreview}
                                    alt="Product display"
                                    width={500}
                                    height={404}
                                    className="object-contain w-full h-full"
                                />
                            ) : (
                                <Image src={displayImg} alt="Default product" width={360} height={360} />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-[2px]">
                        <p>Other images</p>
                        <div className="w-full flex justify-between items-end h-[113px]">
                            {sideImagePreviews.length > 0 ? (
                                sideImagePreviews.map((img, index) => (
                                    <div key={index} className="w-[113px] h-full bg-[#F9F9F9] rounded-[8px] overflow-hidden">
                                        <Image
                                            src={img}
                                            alt={`Product image ${index + 1}`}
                                            width={113}
                                            height={113}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="w-full h-[113px] flex items-center justify-center text-[#BDBDBD]">
                                    No additional images
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};
const TextAreaField = ({
                           id,
                           label,
                           value,
                           onChange,
                       }: Omit<InputFieldProps, "optional" | "type">) => {
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
                {label}
            </label>
            <div className="relative">
                <textarea
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`px-4 h-[120px] w-full border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] resize-none ${
                        isFocused || value
                            ? "pt-[24px] pb-[4px] text-[#121212] text-[14px] font-medium"
                            : "text-[#BDBDBD] text-[16px] font-medium"
                    }`}
                />
                {!isFocused && !value && (
                    <div className="absolute top-[14px] left-4 right-4 pointer-events-none">
                        <p className="text-[#BDBDBD] text-[16px] font-medium leading-tight">Product description</p>
                        <p className="text-[#BDBDBD] text-[12px] font-normal leading-tight">(2000 words)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const NewProductView = ({shopId}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeView, setActiveView] = useState<'New-item' | 'Products-management'>(
        searchParams.get('tab') === 'product' ? 'Products-management' : 'New-item'
    );
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [formData, setFormData] = useState<ProductFormData>({
        productName: "",
        price: "",
        description: "",
        quantity: "",
        categoryId: "",
        categoryName: "",
        subCategoryId: "",
        subCategoryName: ""
    });
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
    const [sideImages, setSideImages] = useState<File[]>([]);
    const [sideImagePreviews, setSideImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sideImageInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5;
    // const timeFilters = ["Last 24 Hrs", "Last 7 days", "Last 30 days", "Last 90 days"];
    const mockProducts = [
        { id: 1, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", totalStock: "200", remainingStock: "128" },
        { id: 2, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Disabled", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", totalStock: "200", remainingStock: "128" },
        { id: 3, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", totalStock: "200", remainingStock: "128" },
        { id: 4, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", totalStock: "200", remainingStock: "128" },
        { id: 5, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", totalStock: "200", remainingStock: "128" },
        { id: 6, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", totalStock: "200", remainingStock: "128" },
        { id: 7, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", totalStock: "200", remainingStock: "128" },
        { id: 8, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", totalStock: "200", remainingStock: "128" },
        { id: 9, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", totalStock: "200", remainingStock: "128" },
        { id: 10, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", totalStock: "200", remainingStock: "128" }
    ];

    const totalPages = Math.ceil(mockProducts.length / productsPerPage);
    // const indexOfLastProduct = currentPage * productsPerPage;

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/all`);
                if (response.data && Array.isArray(response.data)) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const [editingProduct, setEditingProduct] = useState<ProductOne | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // Add these handler functions
    const handleEditProduct = (productId: number) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setEditingProduct(product);
            setIsEditModalOpen(true);
        }
    };

    const handleDeleteProduct = (productId: number) => {
        setProductToDelete(productId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/delete/${productToDelete}`);
            // Refresh products
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/getByUser?email=${userEmail}`
            );
            setProducts(response.data);
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleSaveProduct = async (productId: number, price: number, quantity: number) => {
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productId}/totalStock`,
                { quantity }
            );

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/update-price?productId=${productId}&price=${price}`
            );

            // Refresh products list
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/getByUser?email=${userEmail}`
            );
            setProducts(response.data);
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    };

    const fetchSubcategories = async (categoryName: string) => {
        if (!categoryName) return;
        setLoadingSubcategories(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/getAllCategorySub`,
                {
                    params: {
                        categoryName: categoryName
                    }
                }
            );
            if (response.data && Array.isArray(response.data)) {
                setSubcategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            alert('Failed to load subcategories. Please try again.');
        } finally {
            setLoadingSubcategories(false);
        }
    };

    const [products, setProducts] = useState<Product[]>([]);
    const [loading,setLoading] = useState(false)
    const { data: session } = useSession();
    const userEmail = session?.user?.email;
    useEffect(() => {
        if (!userEmail) return;
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/getByUser?email=${userEmail}`
                );
                setProducts(response.data);
            } catch (err) {
                console.error("Error fetching mockProducts:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [userEmail]);

    const handleChange = (field: keyof ProductFormData) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleCategorySelect = (categoryId: string, categoryName: string) => {
        // Validate the category ID is a valid number
        if (isNaN(Number(categoryId))) {
            alert('Invalid category selected');
            return;
        }

        // Reset subcategory when category changes
        setFormData(prev => ({
            ...prev,
            categoryId,
            categoryName,
            subCategoryId: "",
            subCategoryName: ""
        }));
        setSubcategories([]); // Clear previous subcategories
        fetchSubcategories(categoryName);
    };

    const [completedTransactions, setCompletedTransactions] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [totalStock, setTotalStock] = useState(0);
    const [bestSelling, setBestSelling] = useState<Product>()

    const fetchShopData = useCallback(async () => {
        if (session?.user?.email) {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/getbyEmail?email=${session.user.email}`);
                console.log("Shop: ", response.data);
                const data = response.data;

                // Fetch transaction count and total sales after shop data is loaded
                if (data.id) {
                    const [countResponse, amountResponse, stockResponse, productResponse] = await Promise.all([
                        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/getShopTransactionCount?shopId=${data.id}`),
                        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/getShopTransactionAmount?shopId=${data.id}`),
                        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/getShopStockCount?shopId=${data.id}`),
                        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/getBestSelling?shopId=${data.id}`),
                    ]);

                    setCompletedTransactions(countResponse.data);
                    setTotalSales(amountResponse.data);
                    setTotalStock(stockResponse.data);
                    setBestSelling(productResponse.data)
                }
            } catch (error) {
                console.error('Error fetching shop data:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [session]);

    useEffect(() => {
        fetchShopData();
    }, [fetchShopData]);

    const handleSubcategorySelect = (subCategoryId: string, subCategoryName: string) => {
        setFormData(prev => ({
            ...prev,
            subCategoryId,
            subCategoryName
        }));
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedImage(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setUploadedImagePreview(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSideImageUpload = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newSideImages = [...sideImages];
            const newPreviews = [...sideImagePreviews];
            // Ensure we don't exceed 4 side images
            if (newSideImages.length >= 4) return;
            newSideImages[index] = file;
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    newPreviews[index] = event.target.result as string;
                    setSideImagePreviews(newPreviews);
                }
            };
            reader.readAsDataURL(file);
            setSideImages(newSideImages);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const triggerSideImageInput = (index: number) => {
        sideImageInputRefs.current[index]?.click();
    };

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setUploadedImage(null);
        setUploadedImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };


    const removeSideImage = (index: number) => (e: React.MouseEvent) => {
        e.stopPropagation();
        const newSideImages = [...sideImages];
        const newPreviews = [...sideImagePreviews];

        newSideImages.splice(index, 1);
        newPreviews.splice(index, 1);

        setSideImages(newSideImages);
        setSideImagePreviews(newPreviews);

        if (sideImageInputRefs.current[index]) {
            sideImageInputRefs.current[index]!.value = "";
        }
    };

    const handlePreview = () => {
        // Validate required fields
        if (!formData.productName || !formData.price || !formData.description ||
            !formData.quantity || !formData.categoryId || !formData.subCategoryId) {
            alert('Please fill in all required fields');
            return;
        }

        if (!uploadedImage) {
            alert('Please upload a main product image');
            return;
        }

        setViewMode('preview');
    };

    const handleBackToEdit = () => {
        setViewMode('edit');
    };

    // Add this state variable with your other useState declarations
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Update the handlePublish function
    const handlePublish = async () => {
        setIsPublishing(true);

        try {
            const formDataToSend = new FormData();
            // Add form fields
            formDataToSend.append('name', formData.productName);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('quantity', formData.quantity);
            formDataToSend.append('categoryId', formData.categoryId || '');
            formDataToSend.append('subCategoryId', formData.subCategoryId || '');
            formDataToSend.append('shopId', shopId);

            // Add main image
            if (uploadedImage) {
                formDataToSend.append('mainImageUrl', uploadedImage);
            }

            // Add side images
            sideImages.forEach((image, index) => {
                if (image) {
                    formDataToSend.append(`sideImage${index + 1}Url`, image);
                }
            });

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/add`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Product published successfully:', response.data);
            setIsModalOpen(true);

            // Reset form after successful publish
            setFormData({
                productName: "",
                price: "",
                description: "",
                quantity: "",
                categoryId: "",
                categoryName: "",
                subCategoryId: "",
                subCategoryName: ""
            });
            setUploadedImage(null);
            setSideImages([]);
            setSideImagePreviews([]);
            setViewMode('edit');

        } catch (error) {
            console.error('Error publishing product:', error);
            alert('Failed to publish product. Please try again.');
        } finally {
            setIsPublishing(false);
        }
    };

    if (viewMode === 'preview') {
        return (
            <>
                <PreviewView
                    formData={formData}
                    uploadedImagePreview={uploadedImagePreview}
                    sideImagePreviews={sideImagePreviews}
                    onBack={handleBackToEdit}
                    onPublish={handlePublish}
                    isPublishing={isPublishing}
                />
            </>

    );
    }

    const renderNewItemView = () => {
        return (
            <div className="flex justify-between px-55">
                <div className="flex flex-col">
                    <p className="text-[#022B23] text-[14px] font-medium">New product</p>
                    <p className="text-[#707070] text-[14px] font-medium">List a new product on your shop now</p>
                </div>
                <div className="flex w-[400px] flex-col">
                    <div className="flex flex-col gap-[12px]">
                        <InputField
                            id="productName"
                            label="Product name"
                            value={formData.productName}
                            onChange={handleChange('productName')}
                            placeholder="Product name"
                        />
                        <CategoryDropDown
                            categories={categories}
                            selected={formData.categoryName || "Category"}
                            onSelect={handleCategorySelect}
                            loading={loadingCategories}
                        />

                        <SubCategoryDropDown
                            subcategories={subcategories}
                            selected={formData.subCategoryName || "SubCategory"}
                            onSelect={handleSubcategorySelect}
                            loading={loadingSubcategories}
                            disabled={!formData.categoryId} // Disable if no category selected
                        />
                        <InputField
                            id="price"
                            label="Price (NGN 0.00)"
                            value={formData.price}
                            onChange={handleChange('price')}
                            placeholder="Price (NGN 0.00)"
                            type="number"
                        />
                        <TextAreaField
                            id="description"
                            label="Product description (2000 words)"
                            value={formData.description}
                            onChange={handleChange('description')}
                        />
                        <div className="mt-[38px]">
                            <p className="mb-[5px] text-[12px] font-medium text-[#6D6D6D]">
                                Product image display<span className="text-[#B0B0B0]"> (Mandatory) <span className="text-[#FF5050] font-medium text-[12px]">*</span></span>
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
                                {uploadedImagePreview ? (
                                    <>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Image
                                                src={uploadedImagePreview}
                                                alt="Uploaded product"
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
                                            <span className="underline">Upload</span> your product image
                                            <br />(1MB max)
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-[10px]">
                            <label className="text-[#6D6D6D] text-[12px] font-medium">
                                Other images: <span className="text-[#B0B0B0]">(Max 4) <span className="text-[#FF5050] font-medium text-[12px]">*</span></span>
                            </label>
                            <div className="flex gap-2">
                                {[0, 1, 2, 3].map((index) => (
                                    <div key={index} className="relative">
                                        <input
                                            type="file"
                                            ref={(el) => {
                                                sideImageInputRefs.current[index] = el;
                                            }}
                                            onChange={handleSideImageUpload(index)}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <div
                                            className="border-[1.5px] border-[#1E1E1E] bg-[#F6F6F6] border-dashed rounded-[14px] h-[80px] w-[97px] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
                                            onClick={() => triggerSideImageInput(index)}
                                        >
                                            {sideImagePreviews[index] ? (
                                                <>
                                                    <Image
                                                        src={sideImagePreviews[index]}
                                                        alt={`Side image ${index + 1}`}
                                                        width={97}
                                                        height={80}
                                                        className="object-cover w-full h-full"
                                                    />
                                                    <button
                                                        onClick={removeSideImage(index)}
                                                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <Image src={galleryImg} alt={'image'} width={20} height={20} />
                                                    <span className="text-[#1E1E1E] text-[12px] font-medium underline">Add</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <InputField
                                id="quantity"
                                label="Quantity"
                                value={formData.quantity}
                                onChange={handleChange('quantity')}
                                placeholder="Quantity (0)"
                                type="number"
                            />
                        </div>
                        <div
                            className="flex mt-[30px] mb-[20px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors"
                            onClick={handlePreview}
                        >
                            <p className="text-[#C6EB5F] font-semibold text-[14px]">Preview and publish</p>
                            <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderProductsManagementView = () => (
        <div className="flex flex-col gap-[50px]">
            <div className="flex flex-col gap-[12px]">
                <p className="text-[#022B23] text-[16px] font-medium">Product metrics</p>
                <div className="flex items-center gap-[20px] h-[100px]">
                    <div className="w-[246px] hover:shadow-xl h-full border-[0.5px] rounded-[14px] bg-[#ECFDF6] border-[#52A43E]">
                        <div className="flex items-center gap-[8px] text-[12px] text-[#52A43E] font-medium p-[15px]">
                            <Image src={biArrows} alt="total sales" width={18} height={18} className="h-[18px] w-[18px]" />
                            <p>Total sales (741)</p>
                        </div>
                        <div className="flex justify-between px-[15px]">
                            <p className="text-[#18181B] font-medium text-[16px]">N {totalSales.toLocaleString()}.00</p>
                            <div className="flex items-center gap-[4px]">
                                <Image src={arrowUp} alt={'image'} width={10} height={10}/>
                                {/*<p className="text-[#22C55E] text-[12px]">2%</p>*/}
                            </div>
                        </div>
                    </div>

                    <div className="w-[246px] hover:shadow-2xl h-full border-[0.5px] rounded-[14px] bg-[#FFFFFF] border-[#ededed]">
                        <div className="flex items-center gap-[8px] text-[12px] text-[#707070] font-medium p-[15px]">
                            <Image src={flagImg} alt="completed transactions" width={18} height={18} className="h-[18px] w-[18px]" />
                            <p>All products (in stock)</p>
                        </div>
                        <div className="flex justify-between px-[15px]">
                            <p className="text-[#18181B] font-medium text-[16px]">{totalStock}</p>
                            {/*<div className="flex items-center gap-[4px]">*/}
                            {/*    <Image src={arrowUp} alt={'image'} width={10} height={10}/>*/}
                            {/*    <p className="text-[#22C55E] text-[12px]">2%</p>*/}
                            {/*</div>*/}
                        </div>
                    </div>

                    <div className="w-[246px] hover:shadow-2xl h-full border-[0.5px] rounded-[14px] bg-[#FFFFFF] border-[#ededed]">
                        <div className="flex items-center gap-[8px] text-[12px] text-[#707070] font-medium p-[15px]">
                            <Image src={dropBoxImg} alt="pending orders" width={18} height={18} className="h-[18px] w-[18px]" />
                            <p>Top selling product</p>
                        </div>
                        <div className="flex justify-between px-[15px]">
                            <p className="text-[#18181B] font-medium text-[16px]">
                                {bestSelling?.name || 'No best selling product'}
                            </p>
                            <div className="flex items-center gap-[4px]">
                                <Image src={arrowUp} alt={'image'} width={10} height={10}/>
                                <p className="text-[#22C55E] text-[12px]">2%</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-[246px] hover:shadow-2xl h-full border-[0.5px] rounded-[14px] bg-[#FFFFFF] border-[#ededed]">
                        <div className="flex items-center gap-[8px] text-[12px] text-[#707070] font-medium p-[15px]">
                            <Image src={archiveImg} alt="pending orders" width={18} height={18} className="h-[18px] w-[18px]" />
                            <p>Products sold</p>
                        </div>
                        <div className="flex justify-between px-[15px]">
                            <p className="text-[#18181B] font-medium text-[16px]">{completedTransactions}</p>
                            <div className="flex items-center gap-[4px]">
                                <Image src={arrowUp} alt={'image'} width={10} height={10}/>
                                <p className="text-[#22C55E] text-[12px]">2%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col rounded-[24px] border-[1px] border-[#EAECF0]">
                <div className="my-[20px] mx-[25px] flex flex-col">
                    <p className="text-[#101828] font-medium">Inventory ({products.length})</p>
                    <p className="text-[#667085] text-[14px]">View and manage your products</p>
                </div>
                <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                    <div className="flex items-center px-[24px] w-[284px] py-[12px] gap-[4px]">
                        <p className="text-[#667085] font-medium text-[12px]">Products</p>
                        <Image src={arrowDown} alt="Sort" width={12} height={12} />
                    </div>
                    <div className="flex items-center px-[24px] w-[90px] py-[12px]">
                        {/*<p className="text-[#667085] font-medium text-[12px]">Status</p>*/}
                    </div>
                    <div className="flex items-center px-[15px] w-[149px] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Performance (Qty)</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[170px] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Unit price (NGN)</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[173px] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Sales amount (NGN)</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[115px] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Total stock</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[200px] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Remaining stock</p>
                    </div>
                    <div className="flex items-center w-[40px] py-[12px]"></div>
                </div>
                {loading ? (
                    <div className="p-4">Loading products...</div>
                ) : (
                    <div className="flex flex-col">
                        {products.map((product, index) => (
                            <ProductTableRow
                                key={product.id}
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    mainImageUrl: product.mainImageUrl,
                                    price: Number(product.price),
                                    quantity: Number(product.quantity),
                                    quantitySold: product.quantitySold
                                }}
                                isLast={index === products.length - 1}
                                onEdit={handleEditProduct}
                                onDelete={handleDeleteProduct}
                            />
                        ))}
                    </div>
                )}

            </div>
            <div className="flex justify-between items-center">
                <div
                    className={`flex items-center gap-[8px] h-[20px] cursor-pointer ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={goToPrevPage}
                >
                    <Image src={arrowBack} alt={'image'} width={18} height={18}/>
                    <p className="text-[14px] text-[#667085] font-medium">Previous</p>
                </div>

                <div className="flex items-center gap-[8px]">
                    {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                        if (currentPage <= 3) {
                            return i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            return totalPages - 2 + i;
                        } else {
                            return currentPage - 1 + i;
                        }
                    }).map((pageNumber) => (
                        <div
                            key={pageNumber}
                            className={`flex items-center justify-center w-[24px] h-[24px] rounded-[4px] cursor-pointer ${
                                pageNumber === currentPage
                                    ? 'bg-[#ECFDF6] text-[022B23]'
                                    : 'text-[#667085] hover:bg-gray-100'
                            }`}
                            onClick={() => goToPage(pageNumber)}
                        >
                            <p className="text-[12px] font-medium">{pageNumber}</p>
                        </div>
                    ))}

                    {totalPages > 3 && currentPage < totalPages - 2 && (
                        <span className="text-[#667085]">...</span>
                    )}

                    {totalPages > 3 && currentPage < totalPages - 2 && (
                        <div
                            className={`flex items-center justify-center w-[24px] h-[24px] rounded-[4px] cursor-pointer ${
                                totalPages === currentPage
                                    ? 'bg-[#ECFDF6] text-[#022B23]'
                                    : 'text-[#667085] hover:bg-gray-100'
                            }`}
                            onClick={() => goToPage(totalPages)}
                        >
                            <p className="text-[12px] font-medium">{totalPages}</p>
                        </div>
                    )}
                </div>

                <div
                    className={`flex items-center gap-[8px] h-[20px] cursor-pointer ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={goToNextPage}
                >
                    <p className="text-[14px] text-[#667085] font-medium">Next</p>
                    <Image src={arrowRight} alt={'image'} width={18} height={18}/>
                </div>
            </div>
        </div>
    );
    return (
        <div className="flex flex-col gap-[32px] py-[10px]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-[#8C8C8C] text-[10px] h-[38px] border-[0.5px] border-[#ededed] rounded-[8px]">
                    <div
                        className={`flex items-center justify-center w-[98px] h-full cursor-pointer ${
                            activeView === 'New-item'
                                ? 'border-r-[1px] border-[#ededed] rounded-tl-[8px] rounded-bl-[8px] bg-[#F8FAFB] text-[#8C8C8C]'
                                : ''
                        }`}
                        onClick={() => {
                            setActiveView('New-item');
                            setViewMode('edit');
                            router.push('/vendor/dashboard/shop');
                        }}
                    >
                        <p>New Item</p>
                    </div>
                    <div
                        className={`flex items-center justify-center w-[147px] h-full cursor-pointer ${
                            activeView === 'Products-management'
                                ? 'border-l-[1px] border-[#ededed] rounded-tr-[8px] rounded-br-[8px] bg-[#F8FAFB] text-[#8C8C8C]'
                                : ''
                        }`}
                        onClick={() => {
                            setActiveView('Products-management');
                            router.push('/vendor/dashboard/shop?tab=product');
                        }}
                    >
                        <p>Products management</p>
                    </div>
                </div>
                {activeView === 'Products-management'}
            </div>
            <div className="">
                {activeView === 'New-item' ? renderNewItemView() : renderProductsManagementView()}
            </div>
            <ProductAddedModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                productImage={uploadedImagePreview}
                onGoToProducts={() => {
                    setIsModalOpen(false);
                    setActiveView('Products-management');
                    router.push('/vendor/dashboard/shop?tab=product');
                }}

            />

            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                product={editingProduct}
                onSave={handleSaveProduct}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
            />
        </div>
    );
};
export default NewProductView;