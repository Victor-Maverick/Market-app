'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Eye } from 'lucide-react';

interface FloatingProductProps {
    product: {
        id: number;
        name: string;
        description: string;
        price: number;
        mainImageUrl: string;
        shopName: string;
        vendorName: string;
        city: string;
        market: string;
        shopId: number;
    };
    onClose: () => void;
}

const FloatingProduct: React.FC<FloatingProductProps> = ({ product, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const router = useRouter();

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match animation duration
    }, [onClose]);

    useEffect(() => {
        // Slide in animation
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);

        // Auto close after 10 seconds
        const autoCloseTimer = setTimeout(() => {
            handleClose();
        }, 10000);

        return () => {
            clearTimeout(timer);
            clearTimeout(autoCloseTimer);
        };
    }, [handleClose]);

    const handleView = () => {
        // Navigate to store page using the product ID
        router.push(`/marketPlace/store/${product.shopId}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#808080]/20  pointer-events-none">
            {/* Backdrop */}
            <div 
                className={`absolute fixed inset-0 z-50 flex  transition-opacity duration-300 ${
                    isVisible && !isClosing ? 'bg-opacity-20' : 'bg-opacity-0'
                }`}
            />
            
            {/* Floating Product Card */}
            <div className="flex items-center justify-center h-full p-4">
                <div 
                    className={`
                        relative bg-white rounded-2xl shadow-2xl border border-gray-200
                        max-w-xs w-full mx-4 pointer-events-auto
                        transform transition-all duration-500 ease-out
                        ${isVisible && !isClosing 
                            ? 'translate-y-0 opacity-100 scale-100' 
                            : isClosing 
                                ? 'translate-y-8 opacity-0 scale-95'
                                : 'translate-y-8 opacity-0 scale-95'
                        }
                    `}
                    style={{
                        animation: !isClosing ? 'slideInFromBottom 0.5s ease-out' : 'slideOutToBottom 0.3s ease-in'
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-3 right-3 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all duration-200"
                    >
                        <X size={16} className="text-gray-600" />
                    </button>

                    {/* Product Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                        <Image
                            src={product.mainImageUrl || '/placeholder.svg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Floating Badge */}
                        <div className="absolute top-3 left-3 bg-[#C6EB5F] text-[#022B23] px-3 py-1 rounded-full text-xs font-semibold">
                            Top product
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                            {product.name}
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold text-[#022B23]">
                                ₦{product.price.toLocaleString()}
                            </span>
                        </div>

                        {/* Vendor Info */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <div>
                                    <p className="font-medium text-gray-900">{product.shopName}</p>
                                    <p className="text-gray-600">{product.market}, {product.city}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">{product.vendorName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleView}
                            className="w-full bg-[#022B23] cursor-pointer hover:bg-[#033d32] text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <Eye size={18} />
                            View Product
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideInFromBottom {
                    from {
                        transform: translateY(100px);
                        opacity: 0;
                        scale: 0.9;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                        scale: 1;
                    }
                }

                @keyframes slideOutToBottom {
                    from {
                        transform: translateY(0);
                        opacity: 1;
                        scale: 1;
                    }
                    to {
                        transform: translateY(50px);
                        opacity: 0;
                        scale: 0.95;
                    }
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default FloatingProduct;