/**
 * Reusable Loading Skeleton Components for Dashboard Pages
 */

// Main Skeleton Loader Component
export { default as SkeletonLoader } from './SkeletonLoader';

// Statistics Card Loading Skeleton
export const StatsCardSkeleton = ({ width = "w-32" }: { width?: string }) => (
    <div className={`animate-pulse bg-gray-200 h-6 ${width} rounded`}></div>
);

// Table Row Loading Skeleton - Generic for any table
export const TableRowSkeleton = ({ 
    columns, 
    rowIndex, 
    totalRows = 5 
}: { 
    columns: { width: string; hasSubtext?: boolean }[];
    rowIndex: number;
    totalRows?: number;
}) => (
    <div key={rowIndex} className={`flex h-[72px] ${rowIndex !== totalRows ? 'border-b border-[#EAECF0]' : ''} animate-pulse`}>
        {columns.map((column, colIndex) => (
            <div key={colIndex} className={`flex ${column.hasSubtext ? 'flex-col justify-center' : 'items-center'} ${column.width} px-[15px] ${column.hasSubtext ? 'gap-1' : ''}`}>
                <div className="bg-gray-200 h-4 w-20 rounded"></div>
                {column.hasSubtext && (
                    <div className="bg-gray-200 h-3 w-16 rounded"></div>
                )}
            </div>
        ))}
    </div>
);

// Disputes Table Loading Skeleton
export const DisputesTableSkeleton = () => (
    <>
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`flex h-[72px] ${i !== 5 ? 'border-b border-[#EAECF0]' : ''} animate-pulse`}>
                <div className="flex items-center w-[10%] pl-[24px]">
                    <div className="bg-gray-200 h-4 w-16 rounded"></div>
                </div>
                <div className="flex items-center pl-[15px] w-[12%]">
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                </div>
                <div className="flex flex-col justify-center w-[17%] px-[15px] gap-1">
                    <div className="bg-gray-200 h-4 w-24 rounded"></div>
                    <div className="bg-gray-200 h-3 w-16 rounded"></div>
                </div>
                <div className="flex items-center w-[15%] pl-[24px]">
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                </div>
                <div className="flex items-center w-[15%] pl-[24px]">
                    <div className="bg-gray-200 h-4 w-16 rounded"></div>
                </div>
                <div className="flex flex-col justify-center w-[15%] pl-[15px] gap-1">
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                    <div className="bg-gray-200 h-3 w-16 rounded"></div>
                </div>
                <div className="flex items-center w-[15%] px-[10px]">
                    <div className="bg-gray-200 h-5 w-16 rounded"></div>
                </div>
                <div className="flex items-center justify-center w-[3%]">
                    <div className="bg-gray-200 h-4 w-4 rounded"></div>
                </div>
            </div>
        ))}
    </>
);

// Transactions Table Loading Skeleton
export const TransactionsTableSkeleton = () => (
    <>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className={`flex h-[72px] ${i !== 8 ? 'border-b border-[#EAECF0]' : ''} animate-pulse`}>
                <div className="flex items-center w-[12%] pl-[24px]">
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                </div>
                <div className="flex items-center w-[18%] px-[24px]">
                    <div className="bg-gray-200 h-4 w-16 rounded"></div>
                </div>
                <div className="flex flex-col justify-center w-[22%] px-[24px] gap-1">
                    <div className="bg-gray-200 h-4 w-24 rounded"></div>
                    <div className="bg-gray-200 h-3 w-20 rounded"></div>
                </div>
                <div className="flex items-center w-[17%] pl-[24px]">
                    <div className="bg-gray-200 h-4 w-16 rounded"></div>
                </div>
                <div className="flex flex-col justify-center w-[15%] gap-1">
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                    <div className="bg-gray-200 h-3 w-16 rounded"></div>
                </div>
                <div className="flex items-center w-[13%] px-[10px]">
                    <div className="bg-gray-200 h-5 w-16 rounded"></div>
                </div>
                <div className="flex items-center justify-center w-[3%]">
                    <div className="bg-gray-200 h-4 w-4 rounded"></div>
                </div>
            </div>
        ))}
    </>
);

// Users Table Loading Skeleton
export const UsersTableSkeleton = () => (
    <>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className={`flex h-[72px] ${i !== 8 ? 'border-b border-[#EAECF0]' : ''} animate-pulse`}>
                <div className="flex items-center w-[20%] pl-[24px] gap-3">
                    <div className="bg-gray-200 h-10 w-10 rounded-full"></div>
                    <div className="flex flex-col gap-1">
                        <div className="bg-gray-200 h-4 w-24 rounded"></div>
                        <div className="bg-gray-200 h-3 w-32 rounded"></div>
                    </div>
                </div>
                <div className="flex items-center w-[15%] px-[24px]">
                    <div className="bg-gray-200 h-4 w-16 rounded"></div>
                </div>
                <div className="flex items-center w-[20%] px-[24px]">
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                </div>
                <div className="flex flex-col justify-center w-[15%] px-[24px] gap-1">
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                    <div className="bg-gray-200 h-3 w-16 rounded"></div>
                </div>
                <div className="flex items-center w-[15%] px-[24px]">
                    <div className="bg-gray-200 h-5 w-16 rounded"></div>
                </div>
                <div className="flex items-center w-[12%] px-[24px]">
                    <div className="bg-gray-200 h-5 w-16 rounded"></div>
                </div>
                <div className="flex items-center justify-center w-[3%]">
                    <div className="bg-gray-200 h-4 w-4 rounded"></div>
                </div>
            </div>
        ))}
    </>
);

// Vendors Table Loading Skeleton
export const VendorsTableSkeleton = () => (
    <>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className={`flex h-[72px] ${i !== 8 ? 'border-b border-[#EAECF0]' : ''} animate-pulse`}>
                <div className="flex items-center w-[25%] pl-[24px] gap-3">
                    <div className="bg-gray-200 h-10 w-10 rounded-full"></div>
                    <div className="flex flex-col gap-1">
                        <div className="bg-gray-200 h-4 w-24 rounded"></div>
                        <div className="bg-gray-200 h-3 w-32 rounded"></div>
                    </div>
                </div>
                <div className="flex items-center w-[20%] px-[24px]">
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                </div>
                <div className="flex flex-col justify-center w-[15%] px-[24px] gap-1">
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                    <div className="bg-gray-200 h-3 w-16 rounded"></div>
                </div>
                <div className="flex items-center w-[15%] px-[24px]">
                    <div className="bg-gray-200 h-4 w-16 rounded"></div>
                </div>
                <div className="flex items-center w-[12%] px-[24px]">
                    <div className="bg-gray-200 h-5 w-16 rounded"></div>
                </div>
                <div className="flex items-center justify-center w-[3%]">
                    <div className="bg-gray-200 h-4 w-4 rounded"></div>
                </div>
            </div>
        ))}
    </>
);

// Generic Stats Cards Loading Skeleton
export const StatsCardsLoadingSkeleton = ({ cardCount = 4 }: { cardCount?: number }) => (
    <div className="flex w-full gap-[20px] h-[86px] justify-between">
        {Array.from({ length: cardCount }, (_, i) => (
            <div key={i} className="flex flex-col w-[25%] rounded-[14px] h-full border-[#EAEAEA] border-[0.5px] animate-pulse">
                <div className="w-full h-[34px] rounded-tl-[14px] rounded-tr-[14px] bg-gray-200"></div>
                <div className="h-[52px] flex justify-center flex-col p-[14px]">
                    <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                </div>
            </div>
        ))}
    </div>
);

// Product Grid Loading Skeleton (for marketplace)
export const ProductGridSkeleton = ({ itemCount = 12 }: { itemCount?: number }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: itemCount }, (_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="bg-gray-200 h-48 w-full rounded-lg mb-4"></div>
                <div className="space-y-2">
                    <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                    <div className="bg-gray-200 h-6 w-1/3 rounded"></div>
                </div>
            </div>
        ))}
    </div>
);

// Product List Loading Skeleton (for vendor products)
export const ProductListSkeleton = ({ itemCount = 8 }: { itemCount?: number }) => (
    <>
        {Array.from({ length: itemCount }, (_, i) => (
            <div key={i} className={`flex h-[100px] ${i !== itemCount - 1 ? 'border-b border-[#EAECF0]' : ''} animate-pulse p-4`}>
                <div className="bg-gray-200 h-20 w-20 rounded-lg mr-4"></div>
                <div className="flex-1 space-y-2">
                    <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
                </div>
                <div className="flex flex-col justify-center space-y-2">
                    <div className="bg-gray-200 h-4 w-16 rounded"></div>
                    <div className="bg-gray-200 h-6 w-12 rounded"></div>
                </div>
            </div>
        ))}
    </>
);

// Orders Loading Skeleton (for buyer/vendor orders)
export const OrdersTableSkeleton = ({ itemCount = 8 }: { itemCount?: number }) => (
    <>
        {Array.from({ length: itemCount }, (_, i) => (
            <div key={i} className={`flex h-[72px] ${i !== itemCount - 1 ? 'border-b border-[#EAECF0]' : ''} animate-pulse`}>
                <div className="flex items-center w-[35%] pr-[24px] gap-3">
                    <div className="bg-gray-200 h-16 w-16 rounded"></div>
                    <div className="flex flex-col space-y-1">
                        <div className="bg-gray-200 h-4 w-32 rounded"></div>
                        <div className="bg-gray-200 h-3 w-24 rounded"></div>
                    </div>
                </div>
                <div className="flex items-center w-[30%] px-[20px]">
                    <div className="bg-gray-200 h-5 w-16 rounded"></div>
                </div>
                <div className="flex flex-col justify-center w-[15%] px-[16px] space-y-1">
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                    <div className="bg-gray-200 h-3 w-16 rounded"></div>
                </div>
                <div className="flex items-center w-[20%] px-[16px]">
                    <div className="bg-gray-200 h-4 w-24 rounded"></div>
                </div>
            </div>
        ))}
    </>
);

// Store/Shop Card Loading Skeleton
export const StoreCardSkeleton = ({ itemCount = 8 }: { itemCount?: number }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: itemCount }, (_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="bg-gray-200 h-32 w-full rounded-lg mb-4"></div>
                <div className="space-y-3">
                    <div className="bg-gray-200 h-5 w-3/4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                    <div className="flex items-center space-x-2">
                        <div className="bg-gray-200 h-4 w-4 rounded"></div>
                        <div className="bg-gray-200 h-4 w-16 rounded"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// Chat Messages Loading Skeleton
export const ChatMessagesSkeleton = ({ messageCount = 6 }: { messageCount?: number }) => (
    <div className="space-y-4 p-4">
        {Array.from({ length: messageCount }, (_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-pulse`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-300'}`}>
                    <div className="bg-gray-400 h-4 w-32 rounded mb-1"></div>
                    <div className="bg-gray-400 h-3 w-16 rounded"></div>
                </div>
            </div>
        ))}
    </div>
);

// Profile/Settings Loading Skeleton
export const ProfileSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="flex items-center space-x-4">
            <div className="bg-gray-200 h-20 w-20 rounded-full"></div>
            <div className="space-y-2">
                <div className="bg-gray-200 h-6 w-32 rounded"></div>
                <div className="bg-gray-200 h-4 w-48 rounded"></div>
            </div>
        </div>
        <div className="space-y-4">
            {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="space-y-2">
                    <div className="bg-gray-200 h-4 w-24 rounded"></div>
                    <div className="bg-gray-200 h-10 w-full rounded border"></div>
                </div>
            ))}
        </div>
    </div>
);

// Wishlist Loading Skeleton
export const WishlistSkeleton = ({ itemCount = 8 }: { itemCount?: number }) => (
    <>
        {Array.from({ length: itemCount }, (_, i) => (
            <div key={i} className={`flex h-[120px] ${i !== itemCount - 1 ? 'border-b border-[#EAECF0]' : ''} animate-pulse p-4`}>
                <div className="bg-gray-200 h-24 w-24 rounded-lg mr-4"></div>
                <div className="flex-1 space-y-3">
                    <div className="bg-gray-200 h-5 w-3/4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                    <div className="bg-gray-200 h-6 w-1/3 rounded"></div>
                </div>
                <div className="flex flex-col justify-between items-end">
                    <div className="bg-gray-200 h-6 w-6 rounded"></div>
                    <div className="bg-gray-200 h-8 w-20 rounded"></div>
                </div>
            </div>
        ))}
    </>
);

// Cart Items Loading Skeleton
export const CartItemsSkeleton = ({ itemCount = 4 }: { itemCount?: number }) => (
    <>
        {Array.from({ length: itemCount }, (_, i) => (
            <div key={i} className={`flex h-[100px] ${i !== itemCount - 1 ? 'border-b border-[#EAECF0]' : ''} animate-pulse p-4`}>
                <div className="bg-gray-200 h-20 w-20 rounded-lg mr-4"></div>
                <div className="flex-1 space-y-2">
                    <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                    <div className="flex items-center space-x-2">
                        <div className="bg-gray-200 h-8 w-8 rounded"></div>
                        <div className="bg-gray-200 h-4 w-8 rounded"></div>
                        <div className="bg-gray-200 h-8 w-8 rounded"></div>
                    </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                    <div className="bg-gray-200 h-6 w-6 rounded"></div>
                    <div className="bg-gray-200 h-6 w-16 rounded"></div>
                </div>
            </div>
        ))}
    </>
);

// Call History Loading Skeleton
export const CallHistorySkeleton = ({ itemCount = 8 }: { itemCount?: number }) => (
    <>
        {Array.from({ length: itemCount }, (_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-gray-200 animate-pulse">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
                <div className="text-right space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
            </div>
        ))}
    </>
);

// Pending Calls Badge Skeleton
export const PendingCallsBadgeSkeleton = () => (
    <div className="animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
    </div>
);

// Call Notification Skeleton
export const CallNotificationSkeleton = () => (
    <div className="animate-pulse bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
        <div className="flex space-x-2 mt-4">
            <div className="h-10 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
        </div>
    </div>
);

// Shop Data Loading Skeleton
export const ShopDataSkeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
    </div>
);

// Notification Badge Skeleton
export const NotificationBadgeSkeleton = () => (
    <div className="animate-pulse">
        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
    </div>
);

// Reviews Loading Skeleton
export const ReviewsSkeleton = ({ itemCount = 5 }: { itemCount?: number }) => (
    <>
        {Array.from({ length: itemCount }, (_, i) => (
            <div key={i} className="animate-pulse border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <div key={star} className="w-4 h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        ))}
    </>
);

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        ))}
    </div>
);

// Form Loading Skeleton
export const FormSkeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-28"></div>
            <div className="h-24 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
);

// Category Dropdown Skeleton
export const CategoryDropdownSkeleton = () => (
    <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
);

// Address Form Skeleton
export const AddressFormSkeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
);