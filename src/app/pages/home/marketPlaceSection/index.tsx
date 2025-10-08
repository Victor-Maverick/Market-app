'use client';
import { useState, useEffect } from 'react';
import Image from "next/image";
import axios from 'axios';
import arrow from "../../../../../public/assets/images/grey right arrow.png";
import ProductCard from "@/components/productCard";

interface FeaturedProduct {
    id: number;
    name: string;
    price: number;
    mainImageUrl: string;
    city: string;
    market: string;
}



const MarketPlaceSection = () => {
    const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFeaturedProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/get-featured`, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data && Array.isArray(response.data)) {
                setFeaturedProducts(response.data);
                console.log("Featured Products: ", response.data);
            } else {
                setFeaturedProducts([]);
            }
        } catch (err) {
            console.error("Error fetching featured products:", err);
            setError("Failed to fetch featured products");
            setFeaturedProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    // Don't render the section if there are no featured products
    if (featuredProducts.length === 0 && !loading) {
        return null;
    }

    return (
        <div className="flex flex-col bg-[#fffcf3] py-6 sm:py-8 lg:py-10">
            {/* Header Section */}
            <div className="px-4 sm:px-6 lg:px-25">
                <p className="text-[#461602] text-sm sm:text-base lg:text-[18px] mb-2">MARKETPLACE</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-[#022b23] font-semibold text-lg sm:text-xl lg:text-[22px] leading-tight">
                        Check out a list of featured products<br className="hidden sm:block" />
                        <span className="sm:hidden"> </span>on our marketplace.
                    </p>
                    <div className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
                        <p className="text-xs sm:text-sm lg:text-[14px] text-[#022b23]">VIEW ALL</p>
                        <Image src={arrow} alt="arrow icon" width={16} height={16} className="sm:w-5 sm:h-5" />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="mt-6 px-4 sm:px-6 lg:px-25">
                    <div className="flex justify-center items-center py-10">
                        <p className="text-[#022b23] text-base">Loading featured products...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="mt-6 px-4 sm:px-6 lg:px-25">
                    <div className="flex justify-center items-center py-10">
                        <p className="text-red-500 text-base">{error}</p>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            {!loading && !error && featuredProducts.length > 0 && (
                <div className="mt-6 px-4 sm:px-6 lg:px-25">
                    {/* Mobile: Single column scrollable */}
                    <div className="block sm:hidden">
                        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                            {featuredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex-shrink-0 w-[280px] group hover:animate-shake"
                                >
                                    <ProductCard
                                        id={product.id}
                                        image={product.mainImageUrl}
                                        title={product.name}
                                        price={product.price}
                                        location={`${product.market}, ${product.city}`}
                                        height={360}
                                        imageHeight={240}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tablet: 2 columns, 4 rows */}
                    <div className="hidden sm:block md:hidden">
                        <div className="grid grid-cols-2 gap-4">
                            {featuredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="group hover:animate-shake"
                                >
                                    <ProductCard
                                        id={product.id}
                                        image={product.mainImageUrl}
                                        title={product.name}
                                        price={product.price}
                                        location={`${product.market}, ${product.city}`}
                                        height={360}
                                        imageHeight={240}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Small Desktop: 3 columns */}
                    <div className="hidden md:block lg:hidden">
                        <div className="grid grid-cols-3 gap-4">
                            {featuredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="group hover:animate-shake"
                                >
                                    <ProductCard
                                        id={product.id}
                                        image={product.mainImageUrl}
                                        title={product.name}
                                        price={product.price}
                                        location={`${product.market}, ${product.city}`}
                                        height={360}
                                        imageHeight={240}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Large Desktop: 4 columns, 2 rows (original layout) */}
                    <div className="hidden lg:block">
                        {/* First row of 4 products */}
                        <div className="relative py-6 mt-6 overflow-hidden">
                            <div className="flex flex-nowrap gap-4">
                                {featuredProducts.slice(0, 4).map((product) => (
                                    <div
                                        key={product.id}
                                        className="w-[25%] group hover:animate-shake"
                                    >
                                        <ProductCard
                                            id={product.id}
                                            image={product.mainImageUrl}
                                            title={product.name}
                                            price={product.price}
                                            location={`${product.market}, ${product.city}`}
                                            height={360}
                                            imageHeight={240}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Second row of 4 products */}
                        {featuredProducts.length > 4 && (
                            <div className="relative overflow-hidden">
                                <div className="flex flex-nowrap gap-4">
                                    {featuredProducts.slice(4, 8).map((product) => (
                                        <div
                                            key={product.id}
                                            className="w-[25%] group hover:animate-shake"
                                        >
                                            <ProductCard
                                                id={product.id}
                                                image={product.mainImageUrl}
                                                title={product.name}
                                                price={product.price}
                                                location={`${product.market}, ${product.city}`}
                                                height={360}
                                                imageHeight={240}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketPlaceSection;