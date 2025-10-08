'use client'
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { logisticsService, LogisticsCompany } from '@/services/logisticsService';
import Image from 'next/image';

const ViewPendingPartner = () => {
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
                // Mock data for pending partner
                const mockPartner: LogisticsCompany = {
                    id: parseInt(partnerId),
                    companyName: "Swift Logistics",
                    companyAddress: "456 Business Avenue, Lagos, Lagos State",
                    ownerEmail: "admin@swiftlogistics.com",
                    ownerName: "Jane Smith",
                    fleetNumber: 15,
                    logoUrl: "/assets/images/company-logo.png",
                    cacImageUrl: "/assets/images/cac-document.pdf",
                    cacNumber: "RC789012",
                    tin: "TIN123456789",
                    status: "Pending"
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

    const handleApprove = async () => {
        if (!partner) return;
        
        try {
            await logisticsService.approvePartner(partner.id);
            alert('Partner approved successfully');
            router.push('/admin/dashboard/logistics');
        } catch (error) {
            console.error('Error approving partner:', error);
            alert('Failed to approve partner');
        }
    };

    const handleReject = async () => {
        if (!partner) return;
        
        try {
            await logisticsService.rejectPartner(partner.id);
            alert('Partner rejected successfully');
            router.push('/admin/dashboard/logistics');
        } catch (error) {
            console.error('Error rejecting partner:', error);
            alert('Failed to reject partner');
        }
    };

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
                        <div className="px-3 py-1 rounded-full text-sm font-medium bg-[#FFFAEB] text-[#FF5050]">
                            Pending Approval
                        </div>
                    </div>
                </div>

                <div className="bg-[#FFFAEB] border border-[#FFD700] rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-[#FFB320] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">!</span>
                        </div>
                        <p className="text-[#B45309] font-medium">This partner is awaiting approval</p>
                    </div>
                    <p className="text-[#92400E] text-sm mt-1">
                        Please review all information and documents before making a decision.
                    </p>
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
                                        📄 CAC Document
                                    </a>
                                )}
                                <p className="text-sm text-[#667085]">Click to view and verify documents</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button 
                        className="px-6 py-3 bg-[#027A48] text-white rounded-lg hover:bg-[#025A35] font-medium"
                        onClick={handleApprove}
                    >
                        ✓ Approve Partner
                    </button>
                    <button 
                        className="px-6 py-3 bg-[#FF5050] text-white rounded-lg hover:bg-[#E04545] font-medium"
                        onClick={handleReject}
                    >
                        ✗ Reject Partner
                    </button>
                    <button 
                        className="px-6 py-3 bg-[#F9FAFB] text-[#344054] border border-[#D0D5DD] rounded-lg hover:bg-[#F3F4F6] font-medium"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewPendingPartner;