"use client"
import React, { useCallback, useEffect, useState, useRef } from "react"
import BannerSection from "@/components/bannerSection"
import Image, { type StaticImageData } from "next/image"
import marketIcon from "@/../public/assets/images/market element.png"
import searchImg from "@/../public/assets/images/search-normal.png"
import axios from "axios"
import Footer from "@/components/footer"
import MarketPlaceHeader from "@/components/marketPlaceHeader"
import categoryImg from "@/../public/assets/images/categoryImg.svg"
import { useRouter } from "next/navigation"
import { fetchMarkets } from "@/utils/api"
import { ChevronDown, Menu, X } from "lucide-react"
import FloatingProduct from "@/components/FloatingProduct"
import { useFloatingProducts } from "@/hooks/useFloatingProducts"
import { ProductGridSkeleton } from "@/components/LoadingSkeletons"

type Market = {
    id: number
    name: string
}

type CategoryResponse = {
    id: number
    name: string
}

type SubCategoryResponse = {
    id: number
    name: string
}

interface Product {
    id: number
    name: string
    description: string
    price: number
    quantity: number
    mainImageUrl: string
    sideImage1Url: string
    sideImage2Url: string
    sideImage3Url: string
    sideImage4Url: string
    shopId: number
    shopName: string
    categoryId: number
    categoryName: string
}

// Updated MarketProductCard to accept height as a number
const MarketProductCard = ({
                               id,
                               name,
                               image,
                               price,
                               height,
                               imageHeight,
                           }: {
    id: number
    name: string
    image: string | StaticImageData
    price: string
    height: number
    imageHeight: number
}) => {
    const router = useRouter()
    const handleOpen = () => {
        router.push(`/marketPlace/productDetails/${id}`)
    }

    return (
        <div
            onClick={handleOpen}
            className="hover:shadow-lg cursor-pointer w-full rounded-[14px] bg-[#FFFFFF] border border-[#ededed] flex flex-col overflow-hidden group transition-all duration-300"
            style={{ height: `${height}px` }}
        >
            <div className="relative w-full overflow-hidden rounded-t-[14px]" style={{ height: `${imageHeight}px` }}>
                <Image
                    src={image || "/placeholder.svg"}
                    alt={name}
                    width={400}
                    height={imageHeight}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between" style={{ height: `${height - imageHeight}px` }}>
                <div className="space-y-1">
                    <p className="font-medium text-[#1E1E1E] text-sm line-clamp-2 leading-tight">{name}</p>
                    <p className="font-bold text-[#1E1E1E] text-base">₦{price}</p>
                </div>
            </div>
        </div>
    )
}

const ProductCard = ({
                         image,
                         price,
                         name,
                         id,
                         isApiProduct = false,
                     }: {
    image: string | StaticImageData
    price: number | string
    name: string
    id: number
    isApiProduct?: boolean
}) => {
    const router = useRouter()
    const handleOpen = () => {
        router.push(`/marketPlace/productDetails/${id}`)
    }

    return (
        <div
            onClick={handleOpen}
            className="hover:shadow-lg cursor-pointer w-full rounded-[14px] bg-[#FFFFFF] border border-[#ededed] flex flex-col overflow-hidden group transition-all duration-300"
            style={{ height: '280px' }}
        >
            <div className="relative w-full overflow-hidden rounded-t-[14px]" style={{ height: '160px' }}>
                {isApiProduct ? (
                    <Image
                        src={image || "/placeholder.svg"}
                        alt={name}
                        width={400}
                        height={160}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <Image
                        src={image || "/placeholder.svg"}
                        alt={"image"}
                        width={400}
                        height={160}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                )}
            </div>
            <div className="flex-1 p-3 flex flex-col justify-between" style={{ height: '120px' }}>
                <div className="space-y-1">
                    <p className="font-medium text-[#1E1E1E] text-sm line-clamp-2 leading-tight">{name}</p>
                    <p className="font-bold text-[#1E1E1E] text-base">₦{price.toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}

const ProductGrid = ({ apiProducts = [] }: { apiProducts?: Product[] }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 w-full gap-2 sm:gap-x-3 gap-y-[10px] px-4 sm:px-6 lg:px-25 py-[10px]">
        {apiProducts.map((product: Product) => (
            <ProductCard
                key={`api-${product.id}`}
                name={product.name}
                image={product.mainImageUrl}
                price={product.price}
                id={product.id}
                isApiProduct={true}
            />
        ))}
    </div>
)

const FlashSale = ({
                       countdown,
                       apiProducts,
                   }: {
    countdown: number
    apiProducts: Product[]
}) => {
    const formatTime = (timeInSeconds: number) => {
        const hours = Math.floor(timeInSeconds / 3600)
        const minutes = Math.floor((timeInSeconds % 3600) / 60)
        const seconds = timeInSeconds % 60
        return `${hours}Hr : ${minutes.toString().padStart(2, "0")}M : ${seconds.toString().padStart(2, "0")}Sec`
    }
    const lowQuantityProducts = apiProducts.filter(product => product.quantity < 5)
    return (
        <div className="flex-col rounded-3xl">
            <div className="bg-[#C6EB5F] h-[60px] sm:h-[80px] flex justify-between px-2 sm:px-4 pt-2">
                <div>
                    <div className="flex gap-[4px] items-center">
                        <p className="font-normal text-[18px] sm:text-[22px]">Flash sale</p>
                        <div className="bg-white items-center justify-center text-black w-[40px] sm:w-[50px] h-[20px] sm:h-[26px] rounded-full text-center">
                            <p className="font-bold text-xs sm:text-sm">{lowQuantityProducts.length}+</p>
                        </div>
                    </div>
                    <p className="font-lighter text-[10px] sm:text-[12px] hidden sm:block">
                        Limited stock items - hurry before they&#39;re gone!
                    </p>
                </div>
                <div className="flex justify-between items-center gap-4 sm:gap-[70px]">
                    <div className="flex-col font-semibold text-xs sm:text-sm">
                        <p>Time Left:</p>
                        <p className="text-[10px] sm:text-sm">{formatTime(countdown)}</p>
                    </div>
                    <button className="bg-white text-[#022B23] w-[70px] sm:w-[91px] h-[35px] sm:h-[47px] rounded-[2px] text-xs sm:text-sm">
                        View all
                    </button>
                </div>
            </div>
            <div className="bg-[#FFFAEB] p-[6px] sm:p-[10px] rounded-b-3xl">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[4px] sm:gap-[6px]">
                    {lowQuantityProducts.slice(0, 10).map((product) => (
                        <MarketProductCard
                            id={product.id}
                            height={280}
                            key={product.id}
                            name={product.name}
                            image={product.mainImageUrl}
                            price={product.price.toString()}
                            imageHeight={160}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

const PromotedSection = ({ promotedProducts }: { promotedProducts: Product[] }) => {
    return (
        <div className="flex-col rounded-3xl mt-[20px] mx-4 sm:mx-6 lg:mx-25">
            <div className="bg-[#FF6B35] h-[60px] sm:h-[80px] flex justify-between px-2 sm:px-4 pt-2">
                <div>
                    <div className="flex gap-[4px] items-center">
                        <p className="font-medium text-white text-[18px] sm:text-[22px]">Sponsored Products</p>
                        <div className="bg-white items-center justify-center text-[#FF6B35] w-[40px] sm:w-[50px] h-[20px] sm:h-[26px] rounded-full text-center">
                            <p className="font-bold text-xs sm:text-sm">{promotedProducts.length}</p>
                        </div>
                    </div>
                    <p className="text-white text-[12px] sm:text-[14px]">
                        Featured products from top vendors
                    </p>
                </div>
                <div className="flex items-center">
                    <button className="bg-white text-[#FF6B35] w-[70px] sm:w-[91px] h-[35px] sm:h-[47px] rounded-[2px] text-xs sm:text-sm font-semibold">
                        View all
                    </button>
                </div>
            </div>
            <div className="bg-[#FFF5F3] p-[6px] sm:p-[10px] rounded-b-3xl border border-[#FF6B35]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[4px] sm:gap-[6px]">
                    {promotedProducts.slice(0, 10).map((product) => (
                        <MarketProductCard
                            id={product.id}
                            height={280}
                            key={product.id}
                            name={product.name}
                            image={product.mainImageUrl}
                            price={product.price.toString()}
                            imageHeight={160}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

const StoreSection = () => {
    const router = useRouter()
    const [promotedStores, setPromotedStores] = useState<{
        id: number
        name: string
        logoUrl: string
    }[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPromotedStores = async () => {
        try {
            setLoading(true)
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/get-promoted`
            )
            if (response.data && Array.isArray(response.data)) {
                const stores = response.data.slice(0, 10).map(shop => ({
                    id: shop.id,
                    name: shop.name,
                    logoUrl: shop.logoUrl
                }))
                setPromotedStores(stores)
            }
        } catch (err) {
            console.error("Error fetching promoted stores:", err)
            setError("Failed to load promoted stores")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPromotedStores()
    }, [])

    const PictureCard = ({ store }: { store: { id: number; name: string; logoUrl: string } }) => {
        return (
            <div
                onClick={() => {
                    router.push(`/marketPlace/store/${store.id}`)
                }}
                className="w-full h-full rounded-[14px] overflow-hidden cursor-pointer flex flex-col group"
            >
                <div className="w-full h-[120px] sm:h-[160px] lg:h-[200px] bg-gray-100 rounded-t-[14px] overflow-hidden flex items-center justify-center p-4">
                    {store.logoUrl ? (
                        <div className="relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px]">
                            <Image
                                src={store.logoUrl}
                                alt={store.name}
                                fill
                                className="object-contain rounded-[8px] group-hover:scale-105 transition-transform duration-200"
                                priority
                            />
                        </div>
                    ) : (
                        <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px] bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-500">
                                {store.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
                <div className="p-2 bg-white rounded-b-[14px] border-t border-gray-200">
                    <p className="text-sm font-medium text-[#1E1E1E] text-center truncate">
                        {store.name}
                    </p>
                </div>
            </div>
        )
    }

    if (!process.env.NEXT_PUBLIC_API_BASE_URL) return null
    if (loading) return null
    if (error) return null
    if (promotedStores.length === 0) return null

    const containerHeight = `min-h-[${Math.ceil(promotedStores.length / 5) * 240}px]`

    return (
        <div className="flex-col rounded-3xl mt-[20px] mx-4 sm:mx-6 lg:mx-25">
            <div className="bg-[#022B23] h-[60px] sm:h-[80px] flex justify-between px-2 sm:px-4 pt-2">
                <div>
                    <p className="font-medium text-[#C6EB5F] text-[18px] sm:text-[22px]">Featured Stores</p>
                    <p className="text-[#C6EB5F] text-[12px] sm:text-[14px]">Check out top promoted stores</p>
                </div>
            </div>
            <div
                className={`bg-[#F9FDE8] mt-[6px] ${containerHeight} border border-[#C6EB5F] p-[6px] sm:p-[10px]`}
                style={{
                    minHeight: `${Math.ceil(promotedStores.length / 5) * 240}px`
                }}
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[4px] sm:gap-[6px]">
                    {promotedStores.map((store) => (
                        <PictureCard key={store.id} store={store} />
                    ))}
                </div>
            </div>
        </div>
    )
}

const Dropdown = <T extends { id: number; name: string }>({
                                                              items,
                                                              selectedItem,
                                                              onSelect,
                                                              placeholder,
                                                          }: {
    items: T[]
    selectedItem: T | null
    onSelect: (item: T) => void
    placeholder: string
}) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="bg-[#F9F9F9] border border-[#EDEDED] rounded-[8px] h-[40px] sm:h-[52px] flex justify-between px-[12px] sm:px-[18px] items-center cursor-pointer"
            >
                <p
                    className={`${selectedItem ? "text-[#121212]" : "text-[#707070]"} text-[12px] sm:text-[14px] font-normal truncate`}
                >
                    {selectedItem ? selectedItem.name : placeholder}
                </p>
                <ChevronDown
                    size={14}
                    className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""} sm:w-4 sm:h-4`}
                    color="#707070"
                />
            </div>
            {isOpen && (
                <div className="absolute left-0 mt-2 w-full bg-white text-black rounded-md shadow-lg z-10 border border-[#ededed] max-h-[200px] overflow-y-auto">
                    <ul className="py-1">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className="px-4 py-2 text-black hover:bg-[#ECFDF6] cursor-pointer text-sm"
                                onClick={() => {
                                    onSelect(item)
                                    setIsOpen(false)
                                }}
                            >
                                {item.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

const MobileCategoryModal = ({
                                 isOpen,
                                 onClose,
                                 categories,
                                 selectedCategory,
                                 onCategorySelect,
                                 onAllCategoriesSelect,
                             }: {
    isOpen: boolean
    onClose: () => void
    categories: CategoryResponse[]
    selectedCategory: CategoryResponse | null
    onCategorySelect: (category: CategoryResponse) => void
    onAllCategoriesSelect: () => void
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
            <div className="bg-white h-full w-full max-w-sm">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">Categories</h2>
                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="overflow-y-auto h-full pb-20">
                    <ul>
                        <li
                            className={`flex items-center px-4 py-3 text-[#1E1E1E] border-b cursor-pointer ${
                                !selectedCategory ? "bg-[#ECFDF6]" : ""
                            }`}
                            onClick={() => {
                                onAllCategoriesSelect()
                                onClose()
                            }}
                        >
                            All Categories
                        </li>
                        {categories.map((category) => (
                            <li
                                key={category.id}
                                className={`flex items-center px-4 py-3 text-[#1E1E1E] border-b cursor-pointer ${
                                    selectedCategory?.id === category.id ? "bg-[#ECFDF6]" : ""
                                }`}
                                onClick={() => {
                                    onCategorySelect(category)
                                    onClose()
                                }}
                            >
                                {category.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

const MarketPlace = () => {
    const [countdown, setCountdown] = useState<number>(24 * 60 * 60)
    const [apiProducts, setApiProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [markets, setMarkets] = useState<Market[]>([])
    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [isSearching, setIsSearching] = useState<boolean>(false)
    const [categories, setCategories] = useState<CategoryResponse[]>([])
    const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null)
    const [subCategories, setSubCategories] = useState<SubCategoryResponse[]>([])
    const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategoryResponse | null>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [hoveredCategory, setHoveredCategory] = useState<CategoryResponse | null>(null)
    const [showSubcategories, setShowSubcategories] = useState<boolean>(false)
    const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState<boolean>(false)
    const { currentProduct, showFloatingProduct, hideCurrentProduct } = useFloatingProducts()
    const [promotedProducts, setPromotedProducts] = useState<Product[]>([])

    const fetchProductsByCategory = async (categoryId: number) => {
        try {
            setLoading(true)
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/by-category?categoryId=${categoryId}`,
            )
            if (response.data) {
                setApiProducts(response.data)
            }
        } catch (err) {
            console.error("Error fetching products by category:", err)
            setError("Failed to fetch products by category")
        } finally {
            setLoading(false)
        }
    }

    const handleMarketSelect = (market: Market) => {
        setSelectedMarket(market)
        fetchProductsByMarket(market.id)
    }

    const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const handleCategoryHover = (category: CategoryResponse) => {
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current)
            leaveTimeoutRef.current = null
        }
        setHoveredCategory(category)
        setShowSubcategories(true)
        fetchSubCategories(category.name)
    }

    const handleCategoryLeave = () => {
        leaveTimeoutRef.current = setTimeout(() => {
            setShowSubcategories(false)
            setHoveredCategory(null)
        }, 300)
    }

    const handleSubcategoryLeave = () => {
        leaveTimeoutRef.current = setTimeout(() => {
            setShowSubcategories(false)
            setHoveredCategory(null)
        }, 300)
    }

    const cancelLeave = () => {
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current)
            leaveTimeoutRef.current = null
        }
    }

    const fetchProductsBySubCategory = async (subCategoryId: number) => {
        try {
            setLoading(true)
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/by-subcategory?subCategoryId=${subCategoryId}`,
            )
            if (response.data) {
                setApiProducts(response.data)
            }
        } catch (err) {
            console.error("Error fetching products by subcategory:", err)
            setError("Failed to fetch products by subcategory")
        } finally {
            setLoading(false)
        }
    }

    const fetchProductsByMarket = async (marketId: number) => {
        try {
            setLoading(true)
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/getByMarket?marketId=${marketId}`,
            )
            if (response.data) {
                setApiProducts(response.data)
            }
        } catch (err) {
            console.error("Error fetching products by market:", err)
            setError("Failed to fetch products by market")
        } finally {
            setLoading(false)
        }
    }

    const fetchData = async () => {
        try {
            const [marketsData] = await Promise.all([fetchMarkets()])
            setMarkets(marketsData)
            if (marketsData.length > 0) {
                setSelectedMarket(marketsData[0])
            }
        } catch (error) {
            console.error("Error fetching data:", error)
        }

    }

    useEffect(() => {
        fetchProducts()
        const intervalId = setInterval(fetchProducts, 300000)
        return () => clearInterval(intervalId)
    }, [])

    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown <= 0) {
                    clearInterval(countdownInterval)
                    return 0
                }
                return prevCountdown - 1
            })
        }, 1000)
        return () => clearInterval(countdownInterval)
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            setError(null)
            let response
            try {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/all`, {
                    headers: { "Content-Type": "application/json" },
                })
                if (response.data.data) {
                    setApiProducts(response.data.data)
                    console.log("Products here: ", response.data)
                    console.log("Products here2: ", response.data.data)
                } else {
                    throw new Error(response.data.message || "Failed to fetch products")
                }
            } catch (primaryError) {
                console.warn("Primary API failed, trying fallback...", primaryError)
            }
        } catch (err) {
            console.error("Error fetching products:", err)
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || err.message || "An error occurred while fetching products")
            } else {
                setError(err instanceof Error ? err.message : "An error occurred while fetching products")
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchPromotedProducts = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/get-promoted`, {
                headers: { "Content-Type": "application/json" },
            })
            if (response.data && Array.isArray(response.data)) {
                setPromotedProducts(response.data)
                console.log("Promoted Products: ", response.data)
            } else {
                setPromotedProducts([])
            }
        } catch (err) {
            console.error("Error fetching promoted products:", err)
            setPromotedProducts([])
        }
    }

    const fetchSearchResults = useCallback(async (query: string) => {
        if (!query.trim()) {
            setIsSearching(false)
            await fetchProducts()
            return
        }
        try {
            setLoading(true)
            setError(null)
            setIsSearching(true)
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/search-product?keyword=${encodeURIComponent(query)}`, {
                headers: { "Content-Type": "application/json" },
            })
            if (response.data) {
                setApiProducts(response.data)
            } else {
                setApiProducts([])
            }
        } catch (err) {
            console.error("Error searching products:", err)
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || err.message || "An error occurred while searching products")
            } else {
                setError(err instanceof Error ? err.message : "An error occurred while searching products")
            }
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchCategories = async () => {
        try {
            let response
            try {
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/all`)
            } catch (primaryError) {
                console.warn("Primary API failed, trying fallback...", primaryError)
                response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/all`)
            }
            if (response.data) {
                setCategories(response.data)
            }
        } catch (err) {
            console.error("Error fetching categories:", err)
        }
    }

    const fetchSubCategories = async (categoryName: string) => {
        try {
            let response
            try {
                response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/getAllCategorySub?categoryName=${encodeURIComponent(categoryName)}`,
                )
            } catch (primaryError) {
                console.warn("Primary API failed, trying fallback...", primaryError)
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            if (response.data) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setSubCategories(response.data)
            } else {
                setSubCategories([])
            }
        } catch (err) {
            console.error("Error fetching subcategories:", err)
            setSubCategories([])
        }
    }

    const handleCategoryClick = (category: CategoryResponse) => {
        cancelLeave()
        setSelectedCategory(category)
        setSelectedSubCategory(null)
        setSearchQuery("")
        setIsSearching(false)
        fetchProductsByCategory(category.id)
        setShowSubcategories(false)
    }

    const handleSubCategoryClick = (subCategory: SubCategoryResponse) => {
        cancelLeave()
        const parentCategory = categories.find((cat) => cat.name === hoveredCategory?.name)
        if (parentCategory) {
            setSelectedCategory(parentCategory)
        }
        setSelectedSubCategory(subCategory)
        fetchProductsBySubCategory(subCategory.id)
        setShowSubcategories(false)
    }

    const handleAllCategoriesSelect = () => {
        setSelectedCategory(null)
        setSelectedSubCategory(null)
        fetchProducts()
    }

    useEffect(() => {
        fetchData()
        fetchCategories()
        fetchPromotedProducts()
    }, [])

    useEffect(() => {
        if (searchQuery.trim()) {
            fetchSearchResults(searchQuery)
        } else {
            setIsSearching(false)
            fetchProducts()
        }
    }, [searchQuery, fetchSearchResults])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setSearchQuery("")
            searchInputRef.current?.blur()
        }
    }

    return (
        <>
            <MarketPlaceHeader />
            <div className="flex-col w-full border-t-[0.5px] border-[#ededed]">
                <div className="flex justify-between min-h-[400px] lg:h-[595px] pt-[10px] px-4 sm:px-6 lg:px-25">
                    {!isSearching && (
                        <div className="hidden lg:flex w-[20%] flex-col drop-shadow-sm h-full">
                            <div className="rounded-t-[8px] gap-[8px] h-[52px] px-[10px] font-medium text-[16px] flex items-center bg-[#022B23]">
                                <Image src={categoryImg || "/placeholder.svg"} alt={"image"} />
                                <p className="text-[#FFEEBE]">Categories</p>
                            </div>
                            <div className="shadow-sm relative">
                                <ul>
                                    <li
                                        className={`flex items-center px-[14px] gap-[10px] h-[48px] text-[#1E1E1E] hover:bg-[#ECFDF6] cursor-pointer ${
                                            !selectedCategory ? "bg-[#ECFDF6]" : ""
                                        }`}
                                        onClick={handleAllCategoriesSelect}
                                    >
                                        All Categories
                                    </li>
                                    {categories.map((category) => (
                                        <li
                                            key={category.id}
                                            className={`flex items-center px-[14px] gap-[10px] h-[48px] text-[#1E1E1E] hover:bg-[#ECFDF6] cursor-pointer ${
                                                selectedCategory?.id === category.id ? "bg-[#ECFDF6]" : ""
                                            }`}
                                            onMouseEnter={() => handleCategoryHover(category)}
                                            onMouseLeave={handleCategoryLeave}
                                            onClick={() => handleCategoryClick(category)}
                                        >
                                            {category.name}
                                        </li>
                                    ))}
                                </ul>
                                {showSubcategories && hoveredCategory && (
                                    <div
                                        className="absolute left-full top-0 ml-1 bg-white shadow-lg rounded-md z-50 min-w-[200px]"
                                        onMouseEnter={cancelLeave}
                                        onMouseLeave={handleSubcategoryLeave}
                                        style={{
                                            top: `${categories.findIndex((c) => c.id === hoveredCategory.id) * 48 + 48}px`,
                                            border: "1px solid #EDEDED",
                                            maxHeight: "400px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        <div className="px-[14px] py-2 font-medium bg-gray-100">{hoveredCategory.name}</div>
                                        <ul>
                                            {subCategories.map((subCategory) => (
                                                <li
                                                    key={subCategory.id}
                                                    className={`flex items-center px-[14px] gap-[10px] h-[48px] text-[#1E1E1E] hover:bg-[#ECFDF6] cursor-pointer ${
                                                        selectedSubCategory?.id === subCategory.id ? "bg-[#ECFDF6]" : ""
                                                    }`}
                                                    onClick={() => {
                                                        cancelLeave()
                                                        handleSubCategoryClick(subCategory)
                                                    }}
                                                >
                                                    {subCategory.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className={`flex flex-col h-full ${isSearching ? "w-full" : "w-full lg:w-[80%]"}`}>
                        {!isSearching && (
                            <div className="lg:hidden mb-2">
                                <button
                                    onClick={() => setIsMobileCategoryOpen(true)}
                                    className="flex items-center gap-2 bg-[#022B23] text-white px-4 py-2 rounded-lg"
                                >
                                    <Menu size={20} />
                                    <span>Categories</span>
                                </button>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row justify-between mb-4 items-stretch sm:items-center gap-2 sm:gap-4">
                            <div className="flex gap-2 items-center bg-[#F9F9F9] border-[0.5px] border-[#ededed] h-[40px] sm:h-[52px] px-[10px] rounded-[8px] flex-1 max-w-full sm:max-w-[540px]">
                                <Image
                                    src={searchImg || "/placeholder.svg"}
                                    alt="Search Icon"
                                    width={20}
                                    height={20}
                                    className="h-[16px] w-[16px] sm:h-[20px] sm:w-[20px]"
                                />
                                <input
                                    ref={searchInputRef}
                                    placeholder="Search for items here"
                                    className="w-full text-[#707070] text-[12px] sm:text-[14px] focus:outline-none"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            {!isSearching && (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-[2px] gap-[2px] p-[2px] border-[0.5px] border-[#ededed]">
                                    <div className="w-full sm:w-[171px]">
                                        <Dropdown
                                            items={markets}
                                            selectedItem={selectedMarket}
                                            onSelect={handleMarketSelect}
                                            placeholder="Wurukum market"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        {isSearching && (
                            <div className="mt-4">
                                <div className="flex items-center w-full justify-between h-[50px] sm:h-[66px] px-2 sm:px-4 border-y border-[#ededed]">
                                    <div className="flex gap-[2px] p-0.5 border border-[#ededed] w-full max-w-[313px] rounded-[2px]">
                                        <div className="flex gap-[4px] h-[36px] sm:h-[42px] w-full bg-[#f9f9f9] rounded-[2px] items-center px-[8px] py-[14px]">
                                            <Image
                                                width={16}
                                                height={16}
                                                src={marketIcon || "/placeholder.svg"}
                                                alt="Market Icon"
                                                className="sm:w-5 sm:h-5"
                                            />
                                            <p className="text-[#1E1E1E] font-normal text-[12px] sm:text-[14px]">
                                                {loading ? "Loading..." : `${apiProducts.length} Products found`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <ProductGrid apiProducts={apiProducts} />
                                </div>
                            </div>
                        )}
                        {!isSearching && (
                            <div className="hidden sm:block">
                                <BannerSection />
                            </div>
                        )}
                    </div>
                </div>

                {loading && (
                    <div className="py-10">
                        <ProductGridSkeleton itemCount={8} />
                    </div>
                )}
                {error && (
                    <div className="flex flex-col sm:flex-row justify-center items-center py-10 gap-2 sm:gap-4 px-4">
                        <p className="text-red-500 text-sm sm:text-lg text-center">Error: {error}</p>
                        <button
                            onClick={isSearching ? () => fetchSearchResults(searchQuery) : fetchProducts}
                            className="bg-[#022B23] text-white px-4 py-2 rounded text-sm sm:text-base"
                        >
                            Retry
                        </button>
                    </div>
                )}
                {!loading && !error && !isSearching && (
                    <>
                        {promotedProducts.length > 0 && (
                            <PromotedSection promotedProducts={promotedProducts} />
                        )}
                        <ProductGrid apiProducts={apiProducts} />
                        <div className="flex-col px-4 sm:px-6 lg:px-25">
                            <FlashSale countdown={countdown} apiProducts={apiProducts} />
                        </div>
                        <StoreSection />
                    </>
                )}
            </div>
            <MobileCategoryModal
                isOpen={isMobileCategoryOpen}
                onClose={() => setIsMobileCategoryOpen(false)}
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategoryClick}
                onAllCategoriesSelect={handleAllCategoriesSelect}
            />
            {showFloatingProduct && currentProduct && (
                <FloatingProduct
                    product={currentProduct}
                    onClose={hideCurrentProduct}
                />
            )}
            <Footer />
        </>
    )
}

export default MarketPlace