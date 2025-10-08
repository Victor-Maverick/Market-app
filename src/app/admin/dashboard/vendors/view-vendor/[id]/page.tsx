'use client'
import Image from "next/image";
import arrowBack from "../../../../../../../public/assets/images/arrow-right.svg";
import { useRouter, useParams } from "next/navigation";
import arrowDown from "../../../../../../../public/assets/images/arrow-down.svg";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface ShopData {
    id: number;
    name: string;
    address: string;
    logoUrl: string;
    phone: string;
    shopNumber: string;
    homeAddress: string;
    streetName: string;
    cacNumber: string;
    taxIdNumber: string;
    nin: string;
    bankName: string;
    accountNumber: string;
    market: string;
    marketSection: string;
    firstName: string;
    lastName: string;
    status: string;
    totalPayoutAmount: number;
    promotedStatus: string;
    promotedTierId: number;
    featuredNumber: number;
    promotedNumber: number;
    floatedNumber: number;
}

interface ProductResponse {
    id: number;
    name: string;
    price: number;
    salesPrice: number;
    description: string;
    quantity: number;
    mainImageUrl: string;
    sideImage1Url: string;
    sideImage2Url: string;
    sideImage3Url: string;
    sideImage4Url: string;
    category: string;
    subCategory: string;
    market: string;
    marketSection: string;
    shopNumber: string;
    shopName: string;
    shopId: number;
    shopAddress: string;
    quantitySold: number;
    vendorName: string;
    vendorEmail: string;
    city: string;
}

const ProductActionsDropdown = ({ product }: { product: ProductResponse }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleViewProduct = () => {
        setIsOpen(false);
        setIsViewModalOpen(true);
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
        <>
            <div className="relative" ref={dropdownRef}>
                <div
                    onClick={handleToggle}
                    className="cursor-pointer flex flex-col gap-[3px] items-center justify-center"
                >
                    <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                </div>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-[8px] shadow-lg z-50 border border-[#ededed] w-[100px]">
                        <ul>
                            <li
                                onClick={handleViewProduct}
                                className="px-[8px] py-[4px] h-[38px] text-[12px] hover:bg-[#f9f9f9] text-[#1E1E1E] cursor-pointer rounded-[8px]"
                            >
                                View
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {/* Product View Modal */}
            {isViewModalOpen && (
                <div className="fixed inset-0 z-50 bg-[#808080]/20 flex items-center justify-center ">
                    <div className="bg-white rounded-[12px] p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[18px] font-semibold text-[#101828]">Product Details</h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-[#667085] hover:text-[#101828] text-[20px]"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="w-full h-[200px] bg-gray-100 rounded-[8px] overflow-hidden mb-4">
                                    <Image
                                        src={product.mainImageUrl || "/placeholder.svg"}
                                        alt={product.name}
                                        width={300}
                                        height={200}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[product.sideImage1Url, product.sideImage2Url, product.sideImage3Url, product.sideImage4Url].map((img, idx) => (
                                        img && (
                                            <div key={idx} className="w-full h-[60px] bg-gray-100 rounded-[4px] overflow-hidden">
                                                <Image
                                                    src={img}
                                                    alt={`${product.name} ${idx + 1}`}
                                                    width={60}
                                                    height={60}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[16px] font-semibold text-[#101828] mb-2">{product.name}</h4>
                                    <p className="text-[14px] text-[#667085]">{product.description}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[12px] font-medium text-[#667085] mb-1">Price</label>
                                        <p className="text-[14px] text-[#101828]">₦{product.price.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-medium text-[#667085] mb-1">Sales Price</label>
                                        <p className="text-[14px] text-[#101828]">₦{product.salesPrice.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-medium text-[#667085] mb-1">Stock</label>
                                        <p className="text-[14px] text-[#101828]">{product.quantity}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-medium text-[#667085] mb-1">Sold</label>
                                        <p className="text-[14px] text-[#101828]">{product.quantitySold}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-medium text-[#667085] mb-1">Category</label>
                                        <p className="text-[14px] text-[#101828]">{product.category}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-medium text-[#667085] mb-1">Sub Category</label>
                                        <p className="text-[14px] text-[#101828]">{product.subCategory}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const ProductTableRow = ({
    product,
    isLast
}: {
    product: ProductResponse;
    isLast: boolean;
}) => {
    const salesAmount = product.salesPrice * product.quantitySold;

    return (
        <div className={`flex  h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}>
            <div className="flex items-center w-[40%] pr-[24px] gap-3">
                <div className="bg-[#f9f9f9] h-full w-[70px] overflow-hidden mt-[2px]">
                    <Image
                        src={product.mainImageUrl || "/placeholder.svg"}
                        alt={product.name}
                        width={70}
                        height={70}
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-[14px] font-medium text-[#101828]">{product.name}</p>
                    <p className="text-[12px] text-[#667085]">Category: {product.category}</p>
                </div>
            </div>

            <div className="flex items-center w-[10%] px-[24px]">
                <p className="text-[14px] text-[#101828]">{product.quantity}</p>
            </div>

            <div className="flex flex-col justify-center w-[11%] px-[15px]">
                <p className="text-[14px] text-[#101828]">Sales</p>
                <p className="text-[14px] font-medium text-[#101828]">{product.quantitySold}</p>
            </div>

            <div className="flex items-center w-[15%] px-[24px]">
                <p className="text-[14px] font-medium text-[#101828]">
                    NGN{product.price.toLocaleString()}.00
                </p>
            </div>

            <div className="flex flex-col justify-center w-[20%] px-[24px]">
                <p className="text-[14px] text-[#101828]">Sales</p>
                <p className="text-[14px] font-medium text-[#101828]">
                    NGN{salesAmount.toLocaleString()}.00
                </p>
            </div>

            <div className="flex items-center justify-center w-[40px]">
                <ProductActionsDropdown product={product} />
            </div>
        </div>
    );
};

const ViewVendor = () => {
    const router = useRouter();
    const params = useParams();
    const shopId = params.id as string;
    
    const [shopData, setShopData] = useState<ShopData | null>(null);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5;

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                setLoading(true);
                
                // Fetch shop details and products in parallel
                const [shopResponse, productsResponse] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/${shopId}`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/getByShop`, {
                        params: { shopId: parseInt(shopId) }
                    })
                ]);

                setShopData(shopResponse.data);
                setProducts(productsResponse.data);
            } catch (error) {
                console.error('Error fetching shop data:', error);
                toast.error('Failed to load vendor details');
            } finally {
                setLoading(false);
            }
        };

        if (shopId) {
            fetchShopData();
        }
    }, [shopId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading vendor details...</div>
            </div>
        );
    }

    if (!shopData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="text-lg text-red-600 mb-4">Vendor not found</div>
                <button 
                    onClick={() => router.push("/admin/dashboard/vendors")}
                    className="bg-[#022B23] text-white px-4 py-2 rounded-lg"
                >
                    Back to Vendors
                </button>
            </div>
        );
    }

    // Calculate pagination
    const totalPages = Math.ceil(products.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = products.slice(startIndex, endIndex);

    // Calculate totals
    const totalProductsSold = products.reduce((sum, product) => sum + product.quantitySold, 0);
    const totalTransactions = products.reduce((sum, product) => sum + (product.salesPrice * product.quantitySold), 0);

    return (
        <>
            <div className="text-[#707070] text-[14px] px-[20px] font-medium gap-[8px] flex items-center h-[56px] w-full border-b-[0.5px] border-[#ededed]">
                <Image 
                    src={arrowBack} 
                    alt={'back'} 
                    width={24} 
                    height={24} 
                    className="cursor-pointer" 
                    onClick={() => router.push("/admin/dashboard/vendors")}
                />
                <p className="cursor-pointer" onClick={() => router.push("/admin/dashboard/vendors")}>
                    Back to vendors
                </p>
            </div>
            
            <div className="text-[#022B23] text-[14px] px-[20px] font-medium gap-[8px] flex items-center h-[49px] w-full border-b-[0.5px] border-[#ededed]">
                <p>{shopData.firstName} {shopData.lastName}</p>
            </div>
            
            <div className="p-[20px]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-[4px]">
                        <div className="flex gap-[8px] items-center">
                            <h2 className="text-[18px] font-semibold text-[#022B23]">
                                {shopData.firstName} {shopData.lastName}
                            </h2>
                            <span className="text-[12px] font-medium w-[87px] rounded-[8px] h-[25px] bg-[#F9FAFB] flex items-center justify-center text-[#667085]">
                                ID: {shopData.id.toString().padStart(7, '0')}
                            </span>
                        </div>
                        <p className="text-[14px] text-[#707070] font-medium">View and manage vendor</p>
                    </div>
                    <span className={`border w-[72px] h-[32px] flex justify-center items-center text-[12px] rounded-[6px] ${
                        shopData.status === 'VERIFIED' 
                            ? 'text-[#93C51D] border-[#93C51D] bg-[#F9FDE8]'
                            : 'text-[#FF5050] border-[#FF5050] bg-[#FEF3F2]'
                    }`}>
                        {shopData.status === 'VERIFIED' ? 'Approved' : 'Pending'}
                    </span>
                </div>
                
                <div className="flex flex-col h-auto w-full gap-[44px] mt-[25px]">
                    <div className="flex flex-col gap-[20px]">
                        {/* First row */}
                        <div className="flex w-full gap-[20px] mt-[20px] h-[86px] justify-between">
                            <div className="flex flex-col w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                    <p className="text-[#707070] text-[12px]">Shop name</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">{shopData.name}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                    <p className="text-[#707070] text-[12px]">Market</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">{shopData.market}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                    <p className="text-[#707070] text-[12px]">Section</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">{shopData.marketSection}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                    <p className="text-[#707070] text-[12px]">Address</p>
                                </div>
                                <div className="h-[52px] w-[239px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[12px] text-[#022B23] font-medium">{shopData.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Second row */}
                        <div className="flex w-full gap-[20px] h-[86px]">
                            <div className="flex flex-col w-[33.33%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#F7F7F7]">
                                    <p className="text-[#707070] text-[12px]">Products sold</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">{totalProductsSold}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col w-[33.33%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-black">
                                    <p className="text-[#ffffff] text-[12px]">Total transactions</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">N{totalTransactions.toLocaleString()}.00</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col w-[33.33%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-black">
                                    <p className="text-[#ffffff] text-[12px]">Pay-outs processed</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">N{shopData.totalPayoutAmount.toLocaleString()}.00</p>
                                </div>
                            </div>
                        </div>

                        {/* Third row */}
                        <div className="flex w-full gap-[20px] h-[86px]">
                            <div className="flex flex-col w-[240px] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#000000]">
                                    <p className="text-[#ffffff] text-[12px]">Balance</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">N{shopData.totalPayoutAmount.toLocaleString()}.00</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col w-[240px] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#DD6A02]">
                                    <p className="text-[#000000] font-medium text-[12px]">NIN</p>
                                </div>
                                <div className="h-[52px] flex items-center p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">{shopData.nin}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col w-[240px] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px]">
                                <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[34px] bg-[#DD6A02]">
                                    <p className="text-[#000000] font-medium text-[12px]">TIN</p>
                                </div>
                                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                                    <p className="text-[20px] text-[#022B23] font-medium">{shopData.taxIdNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="flex flex-col mb-[50px] mt-[30px] rounded-[24px] border-[1px] border-[#EAECF0]">
                    <div className="my-[20px] mx-[25px] flex flex-col">
                        <p className="text-[#101828] font-medium">Inventory ({products.length})</p>
                        <p className="text-[#667085] text-[14px]">View and manage products</p>
                    </div>

                    <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                        <div className="flex items-center px-[24px] w-[40%] py-[12px] gap-[4px]">
                            <p className="text-[#667085] font-medium text-[12px]">Products</p>
                            <Image src={arrowDown} alt="Sort" width={12} height={12} />
                        </div>
                        <div className="flex items-center px-[24px] w-[10%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Stock</p>
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
                        {currentProducts.length === 0 ? (
                            <div className="flex items-center justify-center h-[200px]">
                                <p className="text-[#667085]">No products found</p>
                            </div>
                        ) : (
                            currentProducts.map((product, index) => (
                                <ProductTableRow
                                    key={product.id}
                                    product={product}
                                    isLast={index === currentProducts.length - 1}
                                />
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 py-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ViewVendor;