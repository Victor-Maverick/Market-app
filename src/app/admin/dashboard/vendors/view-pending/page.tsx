'use client'
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import iPhone from "../../../../../../public/assets/images/blue14.png";
import Image, {StaticImageData} from "next/image";
import arrowBack from "../../../../../../public/assets/images/arrow-right.svg";
import arrowDown from "../../../../../../public/assets/images/arrow-down.svg";

const products = [
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

type Product = {
    id: number;
    image: StaticImageData;
    name: string;
    review: number;
    status: string;
    salesQty: number;
    unitPrice: string;
    salesAmount: string;
    totalStock: string;
    remainingStock: string;
};

const ProductActionsDropdown = ({

                                    children
                                }: {
    productId: number;
    children: React.ReactNode;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

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

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const handleOpenDeleteModal = () => {
        setIsOpen(false);
        setIsDeleteModalOpen(true);
    };
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };
    const handleDelete = () => {
        // Implement delete logic here
        setIsDeleteModalOpen(false);
    };

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <div
                    ref={triggerRef}
                    onClick={handleToggle}
                    className="cursor-pointer flex flex-col gap-[3px] items-center justify-center"
                >
                    {children}
                </div>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg z-50 border border-[#ededed] w-[125px]">
                        <ul className="py-1">
                            <li onClick={handleOpenDeleteModal} className="px-4 py-2 text-[12px] hover:bg-[##FFFAF9] cursor-pointer text-[#FF5050]">
                                Remove product
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onDelete={handleDelete}
            />
        </>

    );
};

const ProductTableRow = ({
                             product,
                             isLast
                         }: {
    product: Product;
    isLast: boolean
}) => {
    return (
        <>
            <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}>
                <div className="flex items-center w-[40%] pr-[24px] gap-3">
                    <div className="bg-[#f9f9f9] h-full w-[70px] overflow-hidden mt-[2px]">
                        <Image
                            src={product.image}
                            alt={product.name}
                            width={70}
                            height={70}
                            className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[14px] font-medium text-[#101828]">{product.name}</p>
                        <p className="text-[12px] text-[#667085]">Review: {product.review}</p>
                    </div>
                </div>

                <div className="flex items-center w-[10%] px-[24px]">
                    <div className={`w-[55px] h-[22px] rounded-[8px] flex items-center justify-center ${
                        product.status === 'Active'
                            ? 'bg-[#ECFDF3] text-[#027A48]'
                            : 'bg-[#FEF3F2] text-[#FF5050]'
                    }`}>
                        <p className="text-[12px] font-medium">{product.status}</p>
                    </div>
                </div>

                <div className="flex flex-col justify-center w-[11%] px-[15px]">
                    <p className="text-[14px] text-[#101828]">Sales</p>
                    <p className="text-[14px] font-medium text-[#101828]">{product.salesQty}</p>
                </div>

                <div className="flex items-center w-[15%] px-[24px]">
                    <p className="text-[14px] font-medium text-[#101828]">
                        NGN{Number(product.unitPrice).toLocaleString()}.00
                    </p>
                </div>

                <div className="flex flex-col justify-center w-[20%] px-[24px]">
                    <p className="text-[14px] text-[#101828]">Sales</p>
                    <p className="text-[14px] font-medium text-[#101828]">
                        NGN{Number(product.salesAmount).toLocaleString()}.00
                    </p>
                </div>

                <div className="flex items-center justify-center w-[40px]">
                    <ProductActionsDropdown productId={product.id}>
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



const ViewPending = ()=>{
    const router = useRouter();

    return(
        <>
            <div className="text-[#707070] text-[14px] px-[20px] font-medium gap-[8px] flex items-center h-[56px] w-full border-b-[0.5px] border-[#ededed]">
                <Image src={arrowBack} alt={'image'} width={24} height={24} className="cursor-pointer" onClick={()=>{router.push("/admin/dashboard/markets/view-market")}}/>
                <p className="cursor-pointer" onClick={()=>{router.push("/admin/dashboard/vendors")}}>Back to vendor</p>
            </div>
            <div className="text-[#022B23] text-[14px] px-[20px] font-medium gap-[8px] flex items-center h-[49px] w-full border-b-[0.5px] border-[#ededed]">
                <p>Tersoo Jude</p>
            </div>
            <div className="p-[20px] ">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-[4px]">
                        <div className="flex gap-[8px] items-center">
                            <h2 className="text-[18px] font-semibold text-[#022B23]">Jude Tersoo</h2>
                            <span className="text-[12px] font-medium w-[87px]  rounded-[8px] h-[25px] bg-[#F9FAFB] flex items-center justify-center text-[#667085]">ID: 0012345</span>
                        </div>
                        <p className="text-[14px] text-[#707070] font-medium">View and manage vendor</p>
                    </div>
                    <span className="text-[#F99007] border-[#F99007] border bg-[#FFFAEB] w-[116px] h-[32px] flex justify-center items-center text-[12px] rounded-[6px]">Pending approval</span>
                </div>
                <div className="flex flex-col h-[390px] w-full gap-[44px] mt-[25px]">
                    <div className="flex flex-col gap-[20px]">
                        <div className="flex flex-col gap-[20px] w-full ">
                            <div className="flex w-full  gap-[20px] mt-[20px]  h-[86px] justify-between">
                                <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                        <p className="text-[#707070] text-[12px]">Shop name</p>
                                    </div>
                                    <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                        <p className="text-[20px] text-[#022B23] font-medium">Abba technologies</p>
                                    </div>
                                </div>
                                <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                        <p className="text-[#707070] text-[12px]">Market</p>
                                    </div>
                                    <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                        <p className="text-[20px] text-[#022B23] font-medium">Modern market</p>
                                    </div>
                                </div>
                                <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                        <p className="text-[#707070] text-[12px]">Line</p>
                                    </div>
                                    <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                        <p className="text-[20px] text-[#022B23] font-medium">Lagos line</p>
                                    </div>
                                </div>
                                <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                        <p className="text-[#707070] text-[12px]">Shop name</p>
                                    </div>
                                    <div className="h-[52px] w-[239px] flex justify-center flex-col p-[14px]">
                                        <p className="text-[12px] text-[#022B23] font-medium">No. 24, Vandeikya Street, High Level,
                                            Makurdi</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full  gap-[20px] h-[86px] justify-between">
                            <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                    <p className="text-[#707070] text-[12px]">Products sold</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">82</p>
                                </div>
                            </div>
                            <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#FFEEBE]">
                                    <p className="text-[#707070] font-medium text-[12px]">Review and rating</p>
                                </div>
                                <div className="h-[52px] flex justify-between items-center p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">4.3</p>
                                    <span className="rounded-[8px] flex justify-center items-center text-[12px] font-medium text-[#52A43E] h-[25px] w-[47px] bg-[#E3FFF0] border border-[#52A43E]">Good</span>
                                </div>
                            </div>
                            <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-black">
                                    <p className="text-[#ffffff] text-[12px]">Total transactions</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">N3,026,791.00</p>
                                </div>
                            </div>
                            <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-black">
                                    <p className="text-[#ffffff] text-[12px]">Pay-outs processed</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">N3,026,791.00</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full  gap-[20px] h-[86px] ">
                            <div className="flex flex-col  w-[240px] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#000000]">
                                    <p className="text-[#ffffff] text-[12px]">Balance</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">N826,791.00</p>
                                </div>
                            </div>
                            <div className="flex flex-col  w-[240px] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#DD6A02]">
                                    <p className="text-[#000000] font-medium text-[12px]">NIN</p>
                                </div>
                                <div className="h-[52px] flex  items-center p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">643189046125</p>
                                </div>
                            </div>
                            <div className="flex flex-col  w-[240px] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#DD6A02]">
                                    <p className="text-[#000000] font-medium text-[12px]">TIN</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">4326852AB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-[330px] flex gap-[6px]">
                    <div className="flex w-[155px] text-[#022B23] font-medium justify-center h-[48px] rounded-[12px] border border-[#022B23] items-center">
                        Accept vendor
                    </div>
                    <div className="flex w-[169px] text-[#FF5050] font-medium justify-center h-[48px] rounded-[12px] border border-[#FF5050] items-center">
                        Reject application
                    </div>
                </div>

                <div className="flex flex-col mt-[30px] rounded-[24px] border-[1px] border-[#EAECF0]">
                    <div className="my-[20px] mx-[25px] flex flex-col">
                        <p className="text-[#101828] font-medium">Inventory (500)</p>
                        <p className="text-[#667085] text-[14px]">View and manage your products</p>
                    </div>

                    <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                        <div className="flex items-center px-[24px] w-[40%] py-[12px] gap-[4px]">
                            <p className="text-[#667085] font-medium text-[12px]">Products</p>
                            <Image src={arrowDown} alt="Sort" width={12} height={12} />
                        </div>
                        <div className="flex items-center px-[24px] w-[10%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Status</p>
                        </div>
                        <div className="flex items-center px-[15px] w-[11%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Performance (Qty)</p>
                        </div>
                        <div className="flex items-center px-[24px] w-[15%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Unit price (NGN)</p>
                        </div>
                        <div className="flex items-center px-[24px] w-[20%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Sales amount (NGN)</p>
                        </div>

                        <div className="flex items-center w-[4%] py-[12px]"></div>
                    </div>

                    <div className="flex flex-col">
                        {products.map((product, index) => (
                            <ProductTableRow
                                key={product.id}
                                product={product}
                                isLast={index === products.length - 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
export default ViewPending