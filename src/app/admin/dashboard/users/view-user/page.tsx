'use client'
import iPhone from "../../../../../../public/assets/images/blue14.png";
import Image, { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import arrowBack from "../../../../../../public/assets/images/arrow-right.svg";
import arrowDown from "../../../../../../public/assets/images/arrow-down.svg";
import searchImg from "../../../../../../public/assets/images/search-normal.png";


const products = [
    { id: 1, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", customerName: "Jude Tersoo", fee: 1200, deliveryAddress: "NO 22. Railway estate, Logo 1,Makurdi" },
    { id: 2, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Disabled", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", customerName: "Jude Tersoo", fee: 1200, deliveryAddress: "NO 22. Railway estate, Logo 1,Makurdi" },
    { id: 3, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", customerName: "Jude Tersoo", fee: 1200, deliveryAddress: "NO 22. Railway estate, Logo 1,Makurdi" },
    { id: 4, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", customerName: "Jude Tersoo", fee: 1200, deliveryAddress: "NO 22. Railway estate, Logo 1,Makurdi" },
    { id: 5, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", customerName: "Jude Tersoo", fee: 1200, deliveryAddress: "NO 22. Railway estate, Logo 1,Makurdi" },
    { id: 6, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", customerName: "Jude Tersoo", fee: 1200, deliveryAddress: "NO 22. Railway estate, Logo 1,Makurdi" },
    { id: 7, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", customerName: "Jude Tersoo", fee: 1200, deliveryAddress: "NO 22. Railway estate, Logo 1,Makurdi" },
    { id: 8, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", customerName: "Jude Tersoo", fee: 1200, deliveryAddress: "NO 22. Railway estate, Logo 1,Makurdi" },
    { id: 9, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", customerName: "Jude Tersoo", fee: 1200, deliveryAddress: "NO 22. Railway estate, Logo 1,Makurdi" },
    { id: 10, image: iPhone, name: "iPhone 14 pro max", review: 4.2, status: "Active", salesQty: 72, unitPrice: "840000", salesAmount: "302013000", customerName: "Jude Tersoo", fee: 1200, deliveryAddress: "NO 22. Railway estate, Logo 1,Makurdi" }
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
    deliveryAddress: string;
    customerName: string;
    fee: number;
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
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleModalClick = () => {
        setIsModalOpen(true);
        setIsOpen(false); // Close the dropdown when opening modal
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
    }

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
                            <li onClick={handleModalClick} className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer">View details</li>
                        </ul>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <DisputeDetailsModal onClose={handleCloseModal} />
            )}
        </>
    );
};

const DisputeDetailsModal = ({
    onClose,
}: {
    onClose: () => void;
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative z-10 bg-white w-[1100px] h-[95vh] mx-4 px-[60px] py-[30px] shadow-lg">
                <div className="w-full flex flex-col  h-[64px] pb-[12px] border-b-[0.5px] border-[#D9D9D9]">
                    <div className="flex justify-between">
                        <p className="text-[#022B23] text-[16px] font-medium">View order details</p>
                        <span className="w-[77px] h-[32px] text-[#DD6A02] text-[12px] font-medium flex justify-center items-center bg-[#FFFAEB] rounded-[8px] border border-[#DD6A02]">
                            Pending
                        </span>
                    </div>
                    <p className="text-[14px] font-medium text-[#707070]">View details of products</p>
                </div>
                <div className="flex w-full gap-[4px]">
                    <div className="w-[53%] h-[343px] flex flex-col border-r-[0.5px] border-[#E4E4E4] pb-[2px] pt-[24px] pr-[32px] gap-[36px]">
                        <div className="flex flex-col  ">
                            <p className="text-[16px] font-semibold text-[#022B23]">#ORDR-1234</p>
                            <p className="font-medium text-[14px] text-[#707070]">Vendor: <span className="text-[#000000] underline">Abba Technologies</span></p>
                        </div>
                        <div className="flex flex-col h-[123px] w-full">
                            <p className="text-[#022B23] text-[14px] font-medium">Vendor details</p>
                            <div className="flex flex-col h-[92px] w-full ">
                                <div className="flex justify-between items-center w-full">
                                    <p className="text-[#707070] text-[14px] font-medium">Business name</p>
                                    <p className="text-[#1E1E1E] text-[14px] font-medium">Abba Tecnologies</p>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <p className="text-[#707070] text-[14px] font-medium">Market </p>
                                    <p className="text-[#1E1E1E] text-[14px] font-medium">Modern market</p>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <p className="text-[#707070] text-[14px] font-medium">Shop line</p>
                                    <p className="text-[#1E1E1E] text-[14px] font-medium">Lagos line</p>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <p className="text-[#707070] text-[14px] font-medium">Shop number</p>
                                    <p className="text-[#1E1E1E] text-[14px] font-medium">2C</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-[90%] justify-between items-center pr-[15px] h-[72px] flex border-[0.5px] rounded-[14px]  border-[#ededed]">
                            <div className="gap-[10px] flex items-center">
                                <div className="bg-[#f9f9f9] w-[70px] h-full rounded-tl-[14px] rounded-bl-[14px]">
                                    <Image src={iPhone} alt={'image'} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[#101828] text-[14px] font-medium">iPhone 14 pro max</p>
                                    <p className="text-[#667085] text-[14px] ">ID: #1234567887654</p>
                                </div>
                            </div>
                            <p className="text-[14px] text-[#667085]">Quantity: 1</p>
                        </div>
                    </div>
                    <div className="w-[47%] ml-[20px] flex flex-col h-[415px] pb-[2px] pt-[24px] pr-[32px] gap-[30px]">
                        <p className="text-[#022B23] font-semibold text-[16px]">Product details</p>
                        <div className="flex flex-col gap-[8px] pb-[25px] border-b-[0.5px] border-[#ededed]">
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Order date</p>
                                <p className="text-[#000000] text-[14px] font-medium">4th April, 2025</p>
                            </div>
                            <div className="flex justify-between ">
                                <p className="text-[#707070] text-[14px] font-medium">Order time</p>
                                <p className="text-[#000000] text-[14px] font-medium">02:32:00 PM</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Order amount</p>
                                <p className="text-[#000000] text-[14px] font-medium">NGN 1200</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Delivery method</p>
                                <p className="text-[#000000] text-[14px] font-medium">Home delivery</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Delivery address</p>
                                <p className="text-[#000000] text-[14px] font-medium">Home delivery</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[8px] pb-[25px] border-b-[0.5px] border-[#ededed]">
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Customer name</p>
                                <p className="text-[#000000] text-[14px] font-medium">Jude Tersoo</p>
                            </div>
                            <div className="flex justify-between ">
                                <p className="text-[#707070] text-[14px] font-medium">Email</p>
                                <p className="text-[#000000] text-[14px] font-medium">jtersoo@gmail.com</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[#707070] text-[14px] font-medium">Phone</p>
                                <p className="text-[#000000] text-[14px] font-medium">+234 801 2345 678</p>
                            </div>

                        </div>
                        <div className=" h-[52px]  flex justify-end">
                            <div className="flex text-[#707070] text-[16px] font-semibold items-center justify-center w-[116px] h-full border-[0.5px] border-[#707070] rounded-[12px]">
                                Close
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
                <div className="flex items-center w-[30%] pr-[24px] gap-3">
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
                    <div className={`w-[55px] h-[22px] rounded-[8px] flex items-center justify-center ${product.status === 'Active'
                        ? 'bg-[#ECFDF3] text-[#027A48]'
                        : 'bg-[#FEF3F2] text-[#FF5050]'
                        }`}>
                        <p className="text-[12px] font-medium">{product.status}</p>
                    </div>
                </div>

                <div className="flex items-center w-[12%] justify-center">
                    <p className="text-[14px] font-medium text-[#101828]">
                        {product.customerName}
                    </p>
                </div>
                <div className="flex flex-col justify-center w-[20%] px-[15px]">
                    <p className="text-[14px] text-[#101828]">Drop off</p>
                    <p className="text-[12px]  text-[#667085]">{product.deliveryAddress}</p>
                </div>

                <div className="flex items-center w-[15%] px-[24px]">
                    <p className="text-[14px] font-medium text-[#101828]">
                        NGN{Number(product.unitPrice).toLocaleString()}.00
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center w-[10%] ">
                    <p className="text-[14px] font-medium text-[#101828]">
                        NGN{Number(product.fee).toLocaleString()}.00
                    </p>
                </div>

                <div className="flex items-center justify-center w-[3%]">
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


const ViewUser = () => {
    const router = useRouter();

    return (
        <>
            <div className="text-[#707070] text-[14px] px-[20px] font-medium gap-[8px] flex items-center h-[56px] w-full border-b-[0.5px] border-[#ededed]">
                <Image src={arrowBack} alt={'image'} width={24} height={24} className="cursor-pointer" onClick={() => { router.push("/admin/dashboard/markets/view-market") }} />
                <p className="cursor-pointer" onClick={() => { router.push("/admin/dashboard/users") }}>Back to users</p>
            </div>
            <div className="text-[#022B23] text-[14px] px-[20px] font-medium gap-[8px] flex items-center h-[49px] w-full border-b-[0.5px] border-[#ededed]">
                <p>Tersoo Peter</p>
            </div>
            <div className="p-[20px] ">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-[4px]">
                        <div className="flex gap-[8px] items-center">
                            <h2 className="text-[18px] font-semibold text-[#022B23]">Tersoo Peter</h2>
                            <span className="text-[12px] font-medium w-[87px]  rounded-[8px] h-[25px] bg-[#F9FAFB] flex items-center justify-center text-[#667085]">ID: 0012345</span>
                        </div>
                        <p className="text-[14px] text-[#707070] font-medium">View and manage user</p>
                    </div>
                    <span className="text-[#93C51D] border-[#93C51D] border bg-[#F9FDE8] w-[72px] h-[32px] flex justify-center items-center text-[12px] rounded-[6px]">Active</span>
                </div>
                <div className="flex flex-col h-auto w-full gap-[44px] mt-[25px]">
                    <div className="flex flex-col gap-[20px]">
                        <div className="flex flex-col gap-[20px] w-full ">
                            <div className="flex w-full  gap-[20px] mt-[20px]  h-[86px] justify-between">
                                <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                        <p className="text-[#707070] text-[12px]">First name</p>
                                    </div>
                                    <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                        <p className="text-[20px] text-[#022B23] font-medium">Tersoo</p>
                                    </div>
                                </div>
                                <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                        <p className="text-[#707070] text-[12px]">Last name</p>
                                    </div>
                                    <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                        <p className="text-[20px] text-[#022B23] font-medium">Peter</p>
                                    </div>
                                </div>
                                <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                        <p className="text-[#707070] text-[12px]">Email</p>
                                    </div>
                                    <div className="h-[52px] w-[239px] flex justify-center flex-col p-[14px]">
                                        <p className="text-[18px] text-[#022B23] font-medium">tersoopeter@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                        <p className="text-[#707070] text-[12px]">Phone number</p>
                                    </div>
                                    <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                        <p className="text-[20px] text-[#022B23] font-medium">+234 801 2234 567</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full  gap-[20px] h-[86px] justify-between">
                            <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                    <p className="text-[#707070] text-[12px]">Location</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">Makurdi, Benue</p>
                                </div>
                            </div>
                            <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                    <p className="text-[#707070] text-[12px]">Vendor address</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[12px] text-[#022B23] font-medium">No. 24, Vandeikya Street, High Level,
                                        Makurdi</p>
                                </div>
                            </div>
                            <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                    <p className="text-[#707070] text-[12px]">Total order</p>
                                </div>
                                <div className="h-[52px] w-[239px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">8</p>
                                </div>
                            </div>
                            <div className="flex flex-col  w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] ">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#000000]">
                                    <p className="text-[#ffffff] text-[12px]">Total transactions</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">N826,791.00</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div className="flex w-[282px] gap-[6px] mt-[44px] h-[48px]">
                    <div className="flex w-[156px] text-[#022B23] font-medium justify-center h-[48px] rounded-[12px] border border-[#022B23] items-center">
                        Disable user
                    </div>
                    <div className="flex w-[120px] text-[#FF5050] font-medium justify-center h-[48px] rounded-[12px] border border-[#FF5050] items-center">
                        Delete user
                    </div>
                </div>

                <div className="flex flex-col mt-[50px] rounded-[24px] border-[1px] border-[#EAECF0]">
                    <div className="flex items-center justify-between pr-[20px]">
                        <div className="my-[20px] mx-[25px] flex flex-col">
                            <p className="text-[#101828] font-medium">Orders done</p>
                            <p className="text-[#667085] text-[14px]">View and manage all orders and deliveried</p>
                        </div>

                        <div className="flex gap-2 items-center bg-[#FFFFFF] border-[0.5px] border-[#F2F2F2] text-black px-4 py-2 shadow-sm rounded-sm">
                            <Image src={searchImg} alt="Search Icon" width={20} height={20} className="h-[20px] w-[20px]" />
                            <input placeholder="Search" className="w-[175px] text-[#707070] text-[14px] focus:outline-none" />
                        </div>
                    </div>

                    <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                        <div className="flex items-center px-[24px] w-[30%] py-[12px] gap-[4px]">
                            <p className="text-[#667085] font-medium text-[12px]">Products</p>
                            <Image src={arrowDown} alt="Sort" width={12} height={12} />
                        </div>
                        <div className="flex items-center w-[10%] justify-center">
                            <p className="text-[#667085] font-medium text-[12px]">Status</p>
                        </div>
                        <div className="flex items-center w-[12%] justify-center">
                            <p className="text-[#667085] font-medium text-[12px]">Customer ID</p>
                        </div>

                        <div className="flex items-center justify-center  w-[20%] ">
                            <p className="text-[#667085] font-medium text-[12px]">Drop-off location</p>
                        </div>
                        <div className="flex items-center px-[24px] w-[15%] justify-centerr">
                            <p className="text-[#667085] font-medium text-[12px]">price</p>
                        </div>
                        <div className="flex items-center px-[24px] w-[10%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Fee</p>
                        </div>

                        <div className="flex items-center w-[3%] py-[12px]"></div>
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

export default ViewUser