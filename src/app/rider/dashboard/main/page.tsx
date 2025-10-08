'use client'
import iPhone from "../../../../../public/assets/images/blue14.png";
import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image, { StaticImageData } from "next/image";
import DashboardHeader from "@/components/dashboardHeader";
import orderImg from "../../../../../public/assets/images/archive.svg";
import blackArrowImg from "../../../../../public/assets/images/arrow-up.svg";
import deliveredImg from "../../../../../public/assets/images/dropbox.svg";
import arrowDown from "../../../../../public/assets/images/arrow-down.svg";
import RiderDashboardOptions from "@/components/riderDashboardOptions";

const products = [
    { id: "1", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Pending", pickUpAddress: "NO 22. Railway estate, Logo 1, Makurdi", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200},
    { id: "2", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Pending", pickUpAddress: "NO 22. Railway estate, Logo 1, Makurdi", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200},
    { id: "3", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Pending", pickUpAddress: "NO 22. Railway estate, Logo 1, Makurdi", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200},
    { id: "4", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Delivered",pickUpAddress: "NO 22. Railway estate, Logo 1, Makurdi", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200},
    { id: "5", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Pending", pickUpAddress: "NO 22. Railway estate, Logo 1, Makurdi", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200},
    { id: "6", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Delivered", pickUpAddress: "NO 22. Railway estate, Logo 1, Makurdi", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200},
    { id: "7", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Pending", pickUpAddress: "NO 22. Railway estate, Logo 1, Makurdi", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200},
    { id: "8", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Delivered", pickUpAddress: "NO 22. Railway estate, Logo 1, Makurdi", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200},
    { id: "9", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Pending", pickUpAddress: "NO 22. Railway estate, Logo 1, Makurdi", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200},
    { id: "10", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Delivered", pickUpAddress: "NO 22. Railway estate, Logo 1, Makurdi", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200}
]

const ProductActionsDropdown = ({ children }: { productId: string; children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsOpen(!isOpen)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                ref={triggerRef}
                onClick={handleToggle}
                className="cursor-pointer flex flex-col gap-[3px] items-center justify-center"
            >
                {children}
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 h-[114px] bg-white rounded-[8px] shadow-lg z-50 border border-[#ededed] w-[134px]">
                    <ul className="py-1">
                        <li className="px-[8px] py-[4px] h-[38px] text-[12px] text-[#8C8C8C] cursor-pointer">View order</li>
                        <li className="px-[8px] rounded-bl-[8px] rounded-br-[8px] py-[4px] h-[38px] text-[12px] bg-[#FFFAF9] border-t-[0.5px] border-[#F2F2F2] cursor-pointer text-[#FF5050]">
                            decline
                        </li>
                    </ul>
                </div>
            )}
        </div>
    )
}

interface Product {
    id: string;
    image: StaticImageData;
    name: string;
    productId: string;
    status: "Delivered" | "Pending" | string;
    customerId: string;
    pickUpAddress: string;
    deliveryAddress: string;
    unitPrice: number;
    fee: number;
}

interface ProductTableRowProps {
    product: Product;
    isLast: boolean;
}

const ProductTableRow = ({ product, isLast }: ProductTableRowProps) => {
    const router = useRouter();

    const handleOrderClick = () => {
        const productData = encodeURIComponent(JSON.stringify(product));
        router.push(`/rider/dashboard/main/order/${product.id}?data=${productData}`);
    };

    return (
        <div
            onClick={handleOrderClick}
            className={`flex h-[72px] cursor-pointer hover:bg-gray-50 ${
                !isLast ? "border-b border-[#EAECF0]" : ""
            }`}
        >
            <div className="flex items-center w-[25%] pr-[24px] gap-3">
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
                    <p className="text-[14px] font-medium text-[#101828]">
                        {product.name}
                    </p>
                    <p className="text-[12px] text-[#667085]">ID: #{product.productId}</p>
                </div>
            </div>

            <div className="flex items-center w-[9%] px-[16px]">
                <div
                    className={`w-[55px] h-[22px] rounded-[8px] flex items-center justify-center ${
                        product.status === "Delivered"
                            ? "bg-[#ECFDF3] text-[#027A48]"
                            : "bg-[#FEF3F2] text-[#FF5050]"
                    }`}
                >
                    <p className="text-[12px] font-medium">{product.status}</p>
                </div>
            </div>

            <div className="flex items-center w-[10%] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    {product.customerId}
                </p>
            </div>

            <div className="flex flex-col gap-[4px] justify-center w-[17%] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    Pickup
                </p>
                <p className="text-[12px] w-[176px] leading-tight text-[#667085]">
                    {product.pickUpAddress}
                </p>
            </div>

            <div className="flex flex-col gap-[4px] justify-center w-[17%] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    Drop off
                </p>
                <p className="text-[12px] leading-tight text-[#667085]">
                    {product.deliveryAddress}
                </p>
            </div>

            <div className="flex items-center w-[11%] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    NGN{product.unitPrice.toLocaleString()}.00
                </p>
            </div>

            <div className="flex items-center w-[10%] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    NGN{product.fee.toLocaleString()}.00
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
    );
};

const DashboardContent = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const initialTab = searchParams.get('tab') as 'new-orders' | 'pending' | 'delivered' | 'disputes' || 'new-orders'
    const [activeTab, setActiveTab] = useState(initialTab)
    const [currentPage, setCurrentPage] = useState(1)
    const productsPerPage = 5

    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab)
        setCurrentPage(1)
        router.replace(`/rider/dashboard/main?tab=${tab}`, { scroll: false })
    }

    const filteredProducts = products.filter(product => {
        if (activeTab === 'new-orders') return product.status === 'Pending'
        if (activeTab === 'pending') return product.status === 'Pending'
        if (activeTab === 'delivered') return product.status === 'Delivered'
        return true
    })

    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

    const pendingCount = products.filter(p => p.status === 'Pending').length
    const deliveredCount = products.filter(p => p.status === 'Delivered').length

    return (
        <>
            <div className="flex border-b border-[#ededed] mb-6 px-[100px]">
                <div className="w-[328px] h-[52px] gap-[24px] flex items-end">
                    <p
                        className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${activeTab === 'new-orders' ? 'font-medium border-b-2 border-[#C6EB5F]' : 'text-gray-500'}`}
                        onClick={() => handleTabChange('new-orders')}
                    >
                        New assigned orders
                    </p>
                    <p
                        className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${activeTab === 'delivered' ? 'font-medium border-b-2 border-[#C6EB5F]' : 'text-gray-500'}`}
                        onClick={() => handleTabChange('delivered')}
                    >
                        Delivered
                    </p>
                    <p
                        className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${activeTab === 'disputes' ? 'font-medium border-b-2 border-[#C6EB5F]' : 'text-gray-500'}`}
                        onClick={() => handleTabChange('disputes')}
                    >
                        Disputes
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg mx-[100px] mb-8">
                {activeTab === 'new-orders' && (
                    <div>
                        <div className="flex flex-col gap-[12px]">
                            <p className="text-[#022B23] text-[16px] font-medium">New orders ({pendingCount})</p>
                            <div className="flex justify-between h-[100px] w-[512px]">
                                <div className="h-full flex flex-col gap-[20px] bg-[#FFFAEB] p-[12px] w-[246px] rounded-[14px] border-[0.5px] border-[#1E1E1E]">
                                    <div className="flex gap-[8px] items-center">
                                        <Image src={orderImg} alt={'New orders icon'} width={18} height={18} />
                                        <p className="text-[#1E1E1E] font-medium text-[12px]">New orders</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[#18181B] text-[16px] font-medium">{pendingCount}</p>
                                        <div className="flex gap-[4px] items-center">
                                            <Image src={blackArrowImg} alt={'Increase icon'}/>
                                            <p className="font-medium text-[#1E1E1E] text-[12px]">6%</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-full bg-[#FFFFFF] flex-col flex gap-[20px] p-[12px] rounded-[14px] w-[246px] border-[0.5px] border-[#E4E4E7]">
                                    <div className="flex gap-[8px] items-center">
                                        <Image src={deliveredImg} alt={'Delivered icon'} width={18} height={18} />
                                        <p className="text-[#1E1E1E] font-medium text-[12px]">Delivered</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[#18181B] text-[16px] font-medium">{deliveredCount}</p>
                                        <div className="flex gap-[4px] items-center">
                                            <Image src={blackArrowImg} alt={'Increase icon'}/>
                                            <p className="font-medium text-[#1E1E1E] text-[12px]">6%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col mt-[60px] w-full rounded-[24px] border-[1px] border-[#EAECF0]">
                            <div className="my-[20px] mx-[20px] flex flex-col">
                                <p className="text-[#101828] font-medium">Pending Orders ({pendingCount})</p>
                                <p className="text-[#667085] text-[14px]">View and manage pending orders</p>
                            </div>

                            <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                                <div className="flex items-center px-[20px] w-[25%] py-[12px] gap-[4px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Products</p>
                                    <Image src={arrowDown} alt="Sort" width={12} height={12} />
                                </div>
                                <div className="flex items-center px-[20px] w-[7%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Status</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[10%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Customer</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[17%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Pickup address</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[17%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Drop-off address</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[11%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Price</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[10%] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Fee</p>
                                </div>
                                <div className="flex items-center w-[3%] py-[12px]"></div>
                            </div>

                            <div className="flex flex-col">
                                {currentProducts.map((product, index) => (
                                    <ProductTableRow
                                        key={product.id}
                                        product={product}
                                        isLast={index === currentProducts.length - 1}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {/*{activeTab === 'pending' && <NewProductView />}*/}
                {activeTab === 'delivered' && (
                    <div className="flex flex-col mt-[60px] rounded-[24px] border-[1px] border-[#EAECF0]">
                        <div className="my-[20px] mx-[20px] flex flex-col">
                            <p className="text-[#101828] font-medium">Delivered Orders ({deliveredCount})</p>
                            <p className="text-[#667085] text-[14px]">View delivered orders</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

const DashBoard = () => {
    return (
        <>
            <DashboardHeader />
            <RiderDashboardOptions />
            <Suspense fallback={<div>Loading...</div>}>
                <DashboardContent />
            </Suspense>
        </>
    )
}

export default DashBoard