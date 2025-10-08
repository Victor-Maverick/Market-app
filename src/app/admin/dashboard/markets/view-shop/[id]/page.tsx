'use client'
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import BackButton from "@/components/BackButton";

interface ShopResponse {
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
}

interface PageParams {
    id: string;
}

const ViewShop = ({ params }: { params: Promise<PageParams> }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true';
    const [shop, setShop] = useState<ShopResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(isEditMode);
    const [formData, setFormData] = useState<Partial<ShopResponse>>({});
    const { id } = use<PageParams>(params);

    const fetchShopDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/${id}`);
            setShop(response.data);
            setFormData(response.data);
            console.log("Shop details: ", response.data);
        } catch (err) {
            console.error("Error fetching shop details:", err);
            setError("Failed to fetch shop details");
            toast.error("Failed to fetch shop details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchShopDetails();
    }, [fetchShopDetails]);

    const handleInputChange = (field: keyof ShopResponse, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };


    const handleCancel = () => {
        setFormData(shop || {});
        setIsEditing(false);
    };

    const handleStatusToggle = async () => {
        try {
            const endpoint = shop?.status === 'VERIFIED'
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/deactivateShop?shopId=${id}`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/shops/activateShop?shopId=${id}`;
            const newStatus = shop?.status === 'VERIFIED' ? 'INACTIVE' : 'VERIFIED';

            const response = await axios.put(endpoint);

            if (response.status === 200) {
                setShop(prev => prev ? { ...prev, status: newStatus } : null);
                toast.success(`Shop ${newStatus.toLowerCase()} successfully`);
            }
        } catch (error) {
            console.error("Error updating shop status:", error);
            toast.error("Failed to update shop status. Please try again.");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading shop details...</div>;
    if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!shop) return <div className="h-screen flex items-center justify-center">Shop not found</div>;

    return (
        <div className="w-full min-h-screen">
            {/* Header Navigation */}
            <div className="text-[#707070] text-[14px] px-3 md:px-5 font-medium gap-2 flex items-center h-[56px] w-full border-b border-[#ededed]">
                <BackButton
                    variant="default"
                    text="Back to shops"
                    onClick={() => router.back()}
                />
            </div>

            {/* Page Title */}
            <div className="text-[#022B23] text-[14px] px-3 md:px-5 font-medium flex flex-col md:flex-row items-start md:items-center justify-between h-auto md:h-[49px] py-3 md:py-0 border-b border-[#ededed] gap-3">
                <p className="text-[16px] md:text-[14px]">{isEditing ? 'Edit Shop' : 'Shop Details'}</p>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    {!isEditing ? (
                        <>
                            <button
                                onClick={handleStatusToggle}
                                className={`px-4 py-2 text-[12px] rounded-md transition-colors w-full md:w-auto ${
                                    shop.status === 'VERIFIED'
                                        ? 'border border-[#FF5050] text-[#FF5050] hover:bg-[#FF5050] hover:text-white'
                                        : 'border border-[#027A48] text-[#027A48] hover:bg-[#027A48] hover:text-white'
                                }`}
                            >
                                {shop.status === 'VERIFIED' ? 'Deactivate' : 'Activate'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-[12px] border border-[#667085] text-[#667085] rounded-md hover:bg-[#667085] hover:text-white transition-colors w-full md:w-auto"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-3 md:px-[20px] py-6">
                {/* Shop Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3 md:gap-4 flex-1">
                        {shop.logoUrl && (
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                <Image
                                    src={shop.logoUrl}
                                    alt={shop.name}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-[18px] md:text-[24px] font-semibold text-[#022B23] truncate">{shop.name}</h1>
                            <p className="text-[12px] md:text-[14px] text-[#667085]">Shop ID: #{shop.id}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap ${
                        shop.status === 'VERIFIED'
                            ? 'bg-[#ECFDF3] text-[#027A48]'
                            : 'bg-[#FEF3F2] text-[#B42318]'
                    }`}>
                        {shop.status}
                    </span>
                </div>

                {/* Shop Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Basic Information */}
                    <div className="bg-white border border-[#EAECF0] rounded-[8px] md:rounded-[12px] p-4 md:p-6">
                        <h3 className="text-[14px] md:text-[16px] font-semibold text-[#101828] mb-4">Basic Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">Shop Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    />
                                ) : (
                                    <p className="text-[14px] text-[#101828]">{shop.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">Shop Number</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.shopNumber || ''}
                                        onChange={(e) => handleInputChange('shopNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    />
                                ) : (
                                    <p className="text-[14px] text-[#101828]">{shop.shopNumber}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">Address</label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.address || ''}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                        rows={2}
                                    />
                                ) : (
                                    <p className="text-[14px] text-[#101828]">{shop.address}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1

">Market</label>
                                <p className="text-[14px] text-[#101828]">{shop.market}</p>
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">Market Section</label>
                                <p className="text-[14px] text-[#101828]">{shop.marketSection}</p>
                            </div>
                        </div>
                    </div>

                    {/* Owner Information */}
                    <div className="bg-white border border-[#EAECF0] rounded-[8px] md:rounded-[12px] p-4 md:p-6">
                        <h3 className="text-[14px] md:text-[16px] font-semibold text-[#101828] mb-4">Owner Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">First Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.firstName || ''}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    />
                                ) : (
                                    <p className="text-[14px] text-[#101828]">{shop.firstName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">Last Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.lastName || ''}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    />
                                ) : (
                                    <p className="text-[14px] text-[#101828]">{shop.lastName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">Phone</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.phone || ''}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    />
                                ) : (
                                    <p className="text-[14px] text-[#101828]">{shop.phone}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">Home Address</label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.homeAddress || ''}
                                        onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                        rows={2}
                                    />
                                ) : (
                                    <p className="text-[14px] text-[#101828]">{shop.homeAddress}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">Street Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.streetName || ''}
                                        onChange={(e) => handleInputChange('streetName', e.target.value)}
                                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    />
                                ) : (
                                    <p className="text-[14px] text-[#101828]">{shop.streetName}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Business Information */}
                    <div className="bg-white border border-[#EAECF0] rounded-[8px] md:rounded-[12px] p-4 md:p-6">
                        <h3 className="text-[14px] md:text-[16px] font-semibold text-[#101828] mb-4">Business Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">CAC Number</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.cacNumber || ''}
                                        onChange={(e) => handleInputChange('cacNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    />
                                ) : (
                                    <p className="text-[14px] text-[#101828]">{shop.cacNumber || 'N/A'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">Tax ID Number</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.taxIdNumber || ''}
                                        onChange={(e) => handleInputChange('taxIdNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    />
                                ) : (
                                    <p className="text-[14px] text-[#101828]">{shop.taxIdNumber || 'N/A'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">NIN</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.nin || ''}
                                        onChange={(e) => handleInputChange('nin', e.target.value)}
                                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    />
                                ) : (
                                    <p className="text-[14px] text-[#101828]">{shop.nin || 'N/A'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">Promoted Status</label>
                                <p className="text-[14px] text-[#101828]">{shop.promotedStatus || 'Not Promoted'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Information */}
                    <div className="bg-white border border-[#EAECF0] rounded-[8px] md:rounded-[12px] p-4 md:p-6">
                        <h3 className="text-[14px] md:text-[16px] font-semibold text-[#101828] mb-4">Financial Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">Bank Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.bankName || ''}
                                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    />
                                ) : (
                                    <p className="text-[14px] text-[#101828]">{shop.bankName || 'N/A'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">Account Number</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.accountNumber || ''}
                                        onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                                        className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#022B23]"
                                    />
                                ) : (
                                    <p className="text-[14px] text-[#101828]">{shop.accountNumber || 'N/A'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-[12px] font-medium text-[#667085] mb-1">Total Payout Amount</label>
                                <p className="text-[18px] font-semibold text-[#022B23]">₦{shop.totalPayoutAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewShop;