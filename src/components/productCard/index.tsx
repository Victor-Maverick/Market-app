'use client';
import Image from "next/image";
import { useRouter } from "next/navigation";
import buyIcon from "../../../public/assets/images/bag-2.png";
import locationImg from "../../../public/assets/images/location.png";

interface ProductCardProps {
    id: number;
    image: string;
    title: string;
    price: number;
    location: string;
    height?: number;
    imageHeight?: number;
}

const ProductCard = ({ id, image, title, price, location, height = 280, imageHeight = 160 }: ProductCardProps) => {
    const router = useRouter();
    const contentHeight = height - imageHeight;

    const handleProductClick = () => {
        router.push(`/marketPlace/productDetails/${id}`);
    };

    return (
        <div 
            onClick={handleProductClick}
            className="w-full cursor-pointer rounded-[14px] bg-[#FFFFFF] border border-transparent group transition-all duration-300 hover:border-lime-300 hover:shadow-lg flex flex-col overflow-hidden"
            style={{ height: `${height}px` }}
        >
            {/* Image Container - Customizable height */}
            <div className="relative w-full overflow-hidden rounded-t-[14px]" style={{ height: `${imageHeight}px` }}>
                <Image 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    src={image} 
                    alt="product image" 
                    width={400} 
                    height={imageHeight}
                    priority
                />
                
                {/* Location overlay */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1">
                    <Image src={locationImg} alt="location icon" width={12} height={12} />
                    <span className="text-[#1E1E1E] truncate max-w-[60px]">{location}</span>
                </div>
            </div>

            {/* Content Container - Dynamic height based on total height */}
            <div className="flex-1 p-3 flex flex-col justify-between" style={{ height: `${contentHeight}px` }}>
                {/* Product title and price with reduced gap */}
                <div className="space-y-1">
                    <p className="font-medium text-[#1E1E1E] text-sm line-clamp-2 leading-tight">{title}</p>
                    <p className="font-bold text-[#1E1E1E] text-base">₦{price.toLocaleString()}</p>
                </div>

                {/* Buy button - larger size */}
                <div className="flex justify-end mt-2">
                    <button className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 text-white bg-[#022B23] hover:bg-[#034A3A] px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 flex-shrink-0 min-w-[100px] h-[40px]">
                        Buy Now
                        <Image src={buyIcon} alt="buy icon" className="h-[16px] w-[16px]" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
