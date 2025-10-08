'use client'

interface SkeletonLoaderProps {
    type: 'card' | 'table' | 'list' | 'notification' | 'order' | 'dispute' | 'return' | 'product';
    count?: number;
    className?: string;
}

const SkeletonLoader = ({ type, count = 3, className = '' }: SkeletonLoaderProps) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className={`bg-white border border-[#EDEDED] rounded-[14px] p-4 animate-pulse ${className}`}>
                        <div className="space-y-3">
                            <div className="h-32 bg-gray-200 rounded-lg"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    </div>
                );

            case 'table':
                return (
                    <div className={`bg-white border-b border-[#EDEDED] p-4 animate-pulse ${className}`}>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="w-20 h-6 bg-gray-200 rounded"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>
                );

            case 'list':
                return (
                    <div className={`bg-white border border-[#EDEDED] rounded-[12px] p-4 animate-pulse ${className}`}>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    </div>
                );

            case 'notification':
                return (
                    <div className={`bg-[#F9F9F9] border border-[#EDEDED] rounded-[14px] p-5 animate-pulse ${className}`}>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-48"></div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-2 bg-gray-200 rounded w-32"></div>
                        </div>
                    </div>
                );

            case 'order':
                return (
                    <div className={`border-b border-[#EDEDED] p-3 sm:p-0 animate-pulse ${className}`}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center">
                            {/* Mobile layout skeleton */}
                            <div className="flex w-full sm:hidden gap-3 mb-3">
                                <div className="w-[80px] h-[80px] bg-gray-200 rounded-[8px]"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="flex gap-2">
                                            <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Desktop layout skeleton */}
                            <div className="hidden sm:flex items-center w-full h-[72px]">
                                <div className="flex items-center w-[30%] pr-[24px] gap-3">
                                    <div className="w-[70px] h-[60px] bg-gray-200 rounded-[8px]"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="w-[20%] px-[24px]">
                                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                                </div>
                                <div className="w-[15%] px-[24px]">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                                <div className="w-[20%] px-[24px]">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                                <div className="w-[10%] px-[24px]">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                                <div className="w-[5%]">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'dispute':
                return (
                    <div className={`border-b border-[#EDEDED] p-3 sm:p-0 animate-pulse ${className}`}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center">
                            {/* Mobile layout skeleton */}
                            <div className="flex w-full sm:hidden gap-3 mb-3">
                                <div className="w-[80px] h-[80px] bg-gray-200 rounded-[8px]"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="flex gap-2">
                                            <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Desktop layout skeleton */}
                            <div className="hidden sm:flex items-center w-full h-[72px]">
                                <div className="flex items-center w-[30%] pr-[24px] gap-3">
                                    <div className="w-[70px] h-[60px] bg-gray-200 rounded-[8px]"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="w-[25%] px-[24px]">
                                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                                </div>
                                <div className="w-[15%] px-[24px]">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                                <div className="w-[25%] px-[24px]">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                                <div className="w-[5%]">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'return':
                return (
                    <div className={`border-b border-[#EDEDED] p-3 sm:p-0 animate-pulse ${className}`}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center">
                            {/* Mobile layout skeleton */}
                            <div className="flex w-full sm:hidden gap-3 mb-3">
                                <div className="w-[80px] h-[80px] bg-gray-200 rounded-[8px]"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        <div className="flex gap-2">
                                            <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Desktop layout skeleton */}
                            <div className="hidden sm:flex items-center w-full h-[72px]">
                                <div className="flex items-center w-[25%] pr-[24px] gap-3">
                                    <div className="w-[70px] h-[60px] bg-gray-200 rounded-[8px]"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="w-[15%] px-[24px]">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                                <div className="w-[15%] px-[24px]">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                                <div className="w-[15%] px-[24px]">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                                <div className="w-[15%] px-[24px]">
                                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                                </div>
                                <div className="w-[10%] px-[24px]">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </div>
                                <div className="w-[5%]">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'product':
                return (
                    <div className={`bg-white border border-[#EDEDED] rounded-[12px] p-4 animate-pulse ${className}`}>
                        <div className="space-y-3">
                            <div className="h-48 bg-gray-200 rounded-lg"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="flex justify-between items-center">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-8 bg-gray-200 rounded w-20"></div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className={`bg-gray-200 animate-pulse rounded ${className}`}>
                        <div className="h-20 w-full"></div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
                <div key={i}>
                    {renderSkeleton()}
                </div>
            ))}
        </div>
    );
};

export default SkeletonLoader;