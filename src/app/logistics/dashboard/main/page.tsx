'use client'
import {Suspense, useEffect, useRef} from 'react'
import LogisticsCompanyGuard from "@/components/LogisticsCompanyGuard"
import DashboardHeader from "@/components/dashboardHeader"
import LogisticsDashboardOptions from "@/components/logisticsDashboardOptions"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import orderImg from '../../../../../public/assets/images/archive.svg'
import blackArrowImg from '../../../../../public/assets/images/arrow-up.svg'
import deliveredImg from '../../../../../public/assets/images/dropbox.svg'
import pendingImg from '../../../../../public/assets/images/flag-2.svg'
import Image, {StaticImageData} from "next/image"
import iPhone from "../../../../../public/assets/images/blue14.png"
import arrowDown from "../../../../../public/assets/images/arrow-down.svg"
import { SkeletonLoader } from "@/components/LoadingSkeletons";

const products = [
    { id: "1", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Pending", deliveryMethod: "Shop pick-up", unitPrice: 840000, deliveryAddress: "", fee: 1200},
    { id: "2", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Pending", deliveryMethod: "Home delivery", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200},
    { id: "3", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Pending", deliveryMethod: "Shop pick-up", unitPrice: 840000, deliveryAddress: "", fee: 1200},
    { id: "4", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Delivered", deliveryMethod: "Home delivery", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200},
    { id: "5", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Pending", deliveryMethod: "Shop pick-up", unitPrice: 840000, deliveryAddress: "", fee: 1200},
    { id: "6", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Delivered", deliveryMethod: "Home delivery", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200},
    { id: "7", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Pending", deliveryMethod: "Shop pick-up", unitPrice: 840000, deliveryAddress: "", fee: 1200},
    { id: "8", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Delivered", deliveryMethod: "Home delivery", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200},
    { id: "9", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Pending", deliveryMethod: "Shop pick-up", unitPrice: 840000, deliveryAddress: "", fee: 1200},
    { id: "10", productId: "1234567887654", image: iPhone, name: "iPhone 14 pro max", customerId: "Jude Tersoo", status: "Delivered", deliveryMethod: "Home delivery", unitPrice: 840000, deliveryAddress: "NO 22. Railway estate, Logo 1, Makurdi", fee: 1200}
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
                        <li className="px-[8px] py-[4px] h-[38px] text-[12px] text-[#8C8C8C] cursor-pointer">Accept order</li>
                        <li className="px-[8px] py-[4px] h-[38px] border-t-[0.5px] border-[#F2F2F2] text-[12px] bg-[#FFFAEB] cursor-pointer">Schedule delivery</li>
                        <li className="px-[8px] rounded-bl-[8px] rounded-br-[8px] py-[4px] h-[38px] text-[12px] bg-[#FFFAF9] border-t-[0.5px] border-[#F2F2F2] cursor-pointer text-[#FF5050]">
                            Reject order
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
    deliveryMethod: string;
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
        // Convert the product to a URL-safe string
        const productData = encodeURIComponent(JSON.stringify(product));
        router.push(`/logistics/dashboard/main/order/${product.id}?data=${productData}`);
    };

    return (
        <div
            onClick={handleOrderClick}
            className={`flex h-[72px] cursor-pointer hover:bg-gray-50 ${
                !isLast ? "border-b border-[#EAECF0]" : ""
            }`}
        >
            <div className="flex items-center w-[284px] pr-[24px] gap-3">
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

            <div className="flex items-center w-[109px] px-[16px]">
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

            <div className="flex items-center w-[144px] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    {product.customerId}
                </p>
            </div>

            <div className="flex flex-col gap-[4px] justify-center w-[290px] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    {product.deliveryMethod}
                </p>
                <p className="text-[12px] w-[176px] leading-tight text-[#667085]">
                    {product.deliveryAddress}
                </p>
            </div>

            <div className="flex items-center w-[171px] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    NGN{product.unitPrice.toLocaleString()}.00
                </p>
            </div>

            <div className="flex items-center w-[130px] px-[16px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    NGN{product.fee.toLocaleString()}.00
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
    );
};

function DashboardContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const initialTab = searchParams.get('tab') as 'new-orders' | 'pending' | 'delivered' | 'disputes' || 'new-orders'
    const [activeTab, setActiveTab] = useState(initialTab)
    const [currentPage, setCurrentPage] = useState(1)
    const productsPerPage = 5

    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab)
        setCurrentPage(1)
        router.replace(`/logistics/dashboard/main?tab=${tab}`, { scroll: false })
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
        <LogisticsCompanyGuard>
            <DashboardHeader />
            <LogisticsDashboardOptions />
            <div className="mt-16 md:mt-0">
                <div className="flex border-b border-[#ededed] mb-6 px-4 md:px-[100px] overflow-x-auto">
                    <div className="flex gap-4 md:gap-[24px] items-end min-w-max">
                        <p
                            className={`py-2 text-[#11151F] cursor-pointer text-[12px] md:text-[14px] whitespace-nowrap ${activeTab === 'new-orders' ? 'font-medium border-b-2 border-[#C6EB5F]' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('new-orders')}
                        >
                            New orders
                        </p>
                        <p
                            className={`py-2 text-[#11151F] cursor-pointer text-[12px] md:text-[14px] whitespace-nowrap ${activeTab === 'pending' ? 'font-medium border-b-2 border-[#C6EB5F]' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('pending')}
                        >
                            Pending
                        </p>
                        <p
                            className={`py-2 text-[#11151F] cursor-pointer text-[12px] md:text-[14px] whitespace-nowrap ${activeTab === 'delivered' ? 'font-medium border-b-2 border-[#C6EB5F]' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('delivered')}
                        >
                            Delivered
                        </p>
                        <p
                            className={`py-2 text-[#11151F] cursor-pointer text-[12px] md:text-[14px] whitespace-nowrap ${activeTab === 'disputes' ? 'font-medium border-b-2 border-[#C6EB5F]' : 'text-gray-500'}`}
                            onClick={() => handleTabChange('disputes')}
                        >
                            Disputes
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg mx-4 md:mx-[100px] mb-8">
                {activeTab === 'new-orders' && (
                    <div>
                        <div className="flex flex-col gap-[12px]">
                            <p className="text-[#022B23] text-[14px] md:text-[16px] font-medium">New orders ({pendingCount})</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                <div className="flex flex-col gap-[20px] bg-[#FFFAEB] p-[12px] rounded-[14px] border-[0.5px] border-[#1E1E1E] min-h-[100px]">
                                    <div className="flex gap-[8px] items-center">
                                        <Image src={orderImg} alt={'image'} width={18} height={18} />
                                        <p className="text-[#1E1E1E] font-medium text-[12px]">New orders</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[#18181B] text-[16px] font-medium">{pendingCount}</p>
                                        <div className="flex gap-[4px] items-center">
                                            <Image src={blackArrowImg} alt={'imag'}/>
                                            <p className="font-medium text-[#1E1E1E] text-[12px]">6%</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#FFFFFF] flex-col flex gap-[20px] p-[12px] rounded-[14px] border-[0.5px] border-[#E4E4E7] min-h-[100px]">
                                    <div className="flex gap-[8px] items-center">
                                        <Image src={pendingImg} alt={'image'} width={18} height={18} />
                                        <p className="text-[#1E1E1E] font-medium text-[12px]">Pending</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[#18181B] text-[16px] font-medium">{pendingCount}</p>
                                        <div className="flex gap-[4px] items-center">
                                            <Image src={blackArrowImg} alt={'imag'}/>
                                            <p className="font-medium text-[#1E1E1E] text-[12px]">6%</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#FFFFFF] flex-col flex gap-[20px] p-[12px] rounded-[14px] border-[0.5px] border-[#E4E4E7] min-h-[100px]">
                                    <div className="flex gap-[8px] items-center">
                                        <Image src={deliveredImg} alt={'image'} width={18} height={18} />
                                        <p className="text-[#1E1E1E] font-medium text-[12px]">Delivered</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[#18181B] text-[16px] font-medium">{deliveredCount}</p>
                                        <div className="flex gap-[4px] items-center">
                                            <Image src={blackArrowImg} alt={'imag'}/>
                                            <p className="font-medium text-[#1E1E1E] text-[12px]">6%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col mt-[60px] rounded-[24px] border-[1px] border-[#EAECF0]">
                            <div className="my-[20px] mx-[20px] flex flex-col">
                                <p className="text-[#101828] font-medium">Pending Orders ({pendingCount})</p>
                                <p className="text-[#667085] text-[14px]">View and manage pending orders</p>
                            </div>

                            <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                                <div className="flex items-center px-[20px] w-[284px] py-[12px] gap-[4px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Products</p>
                                    <Image src={arrowDown} alt="Sort" width={12} height={12} />
                                </div>
                                <div className="flex items-center px-[20px] w-[109px] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Status</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[144px] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Customer</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[290px] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Delivery method</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[171px] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Price</p>
                                </div>
                                <div className="flex items-center px-[20px] w-[115px] py-[12px]">
                                    <p className="text-[#667085] font-medium text-[12px]">Fee</p>
                                </div>
                                <div className="flex items-center w-[40px] py-[12px]"></div>
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
        </LogisticsCompanyGuard>
    )
}

export default function Dashboard() {
    return (
        <Suspense fallback={
            <div className="p-6">
                <SkeletonLoader type="card" count={4} />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    )
}