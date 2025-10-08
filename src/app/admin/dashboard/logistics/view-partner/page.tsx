'use client'
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { logisticsService, LogisticsCompany } from '@/services/logisticsService';
import Image from 'next/image';

const ViewPartner = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const partnerId = searchParams.get('id');
    
    const [partner, setPartner] = useState<LogisticsCompany | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPartner = async () => {
            if (!partnerId) {
                setError('Partner ID not provided');
                setLoading(false);
                return;
            }

            try {
                // For now, we'll use mock data since the specific partner endpoint doesn't exist
                const mockPartner: LogisticsCompany = {
                    id: parseInt(partnerId),
                    companyName: "Fele Express",
                    companyAddress: "123 Main Street, Makurdi, Benue State",
                    ownerEmail: "owner@feleexpress.com",
                    ownerName: "John Doe",
                    fleetNumber: 25,
                    logoUrl: "/assets/images/company-logo.png",
                    cacImageUrl: "/assets/images/cac-document.pdf",
                    cacNumber: "RC123456",
                    tin: "TIN987654321",
                    status: "Active"
                };
                
                setPartner(mockPartner);
            } catch (err) {
                setError('Failed to fetch partner details');
                console.error('Error fetching partner:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPartner();
    }, [partnerId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-[#022B23]">Loading partner details...</div>
            </div>
        );
    }

    if (error || !partner) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">{error || 'Partner not found'}</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <button 
                    onClick={() => router.back()}
                    className="text-[#022B23] hover:text-[#034A3A] flex items-center gap-2"
                >
                    ← Back to Logistics
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[#EAECF0] p-6">
                <div className="flex items-center gap-4 mb-6">
                    {partner.logoUrl && (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Image 
                                src={partner.logoUrl} 
                                alt="Company Logo" 
                                width={64} 
                                height={64}
                                className="rounded-lg"
                            />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-semibold text-[#101828]">{partner.companyName}</h1>
                        <p className="text-[#667085]">Partner ID: {partner.id}</p>
                    </div>
                    <div className="ml-auto">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            partner.status === 'Active' 
                                ? 'bg-[#ECFDF3] text-[#027A48]'
                                : partner.status === 'Pending'
                                ? 'bg-[#FFFAEB] text-[#FF5050]'
                                : 'bg-[#FEF3F2] text-[#FF5050]'
                        }`}>
                            {partner.status}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium text-[#101828]">Company Information</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-[#344054] mb-1">Company Name</label>
                            <p className="text-[#101828]">{partner.companyName}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#344054] mb-1">Address</label>
                            <p className="text-[#101828]">{partner.companyAddress}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#344054] mb-1">Fleet Size</label>
                            <p className="text-[#101828]">{partner.fleetNumber} vehicles</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#344054] mb-1">CAC Number</label>
                            <p className="text-[#101828]">{partner.cacNumber}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#344054] mb-1">TIN</label>
                            <p className="text-[#101828]">{partner.tin}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-medium text-[#101828]">Owner Information</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-[#344054] mb-1">Owner Name</label>
                            <p className="text-[#101828]">{partner.ownerName}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#344054] mb-1">Email</label>
                            <p className="text-[#101828]">{partner.ownerEmail}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#344054] mb-1">Documents</label>
                            <div className="space-y-2">
                                {partner.cacImageUrl && (
                                    <a 
                                        href={partner.cacImageUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block text-[#0066CC] hover:underline"
                                    >
                                        CAC Document
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    {partner.status === 'Pending' && (
                        <>
                            <button 
                                className="px-4 py-2 bg-[#027A48] text-white rounded-lg hover:bg-[#025A35]"
                                onClick={() => {
                                    // Handle approve
                                    logisticsService.approvePartner(partner.id);
                                }}
                            >
                                Approve Partner
                            </button>
                            <button 
                                className="px-4 py-2 bg-[#FF5050] text-white rounded-lg hover:bg-[#E04545]"
                                onClick={() => {
                                    // Handle reject
                                    logisticsService.rejectPartner(partner.id);
                                }}
                            >
                                Reject Partner
                            </button>
                        </>
                    )}
                    {partner.status === 'Active' && (
                        <button 
                            className="px-4 py-2 bg-[#667085] text-white rounded-lg hover:bg-[#525866]"
                            onClick={() => {
                                // Handle deactivate
                                console.log('Deactivate partner');
                            }}
                        >
                            Deactivate Partner
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewPartner;