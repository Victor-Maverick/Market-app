'use client';
import { useState } from 'react';
import { userService } from '@/services/userService';

interface LogisticsPartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

const LogisticsPartnerModal = ({ isOpen, onClose, onSuccess, onError }: LogisticsPartnerModalProps) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await userService.registerLogisticsPartner(formData);
            
            if (result.success) {
                onSuccess('Logistics partner registered successfully');
                setFormData({ firstName: '', lastName: '', email: '', password: '' });
                onClose();
            } else {
                onError(result.message);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            onError('Failed to register logistics partner');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ firstName: '', lastName: '', email: '', password: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#808080]/20 flex items-center justify-center z-50">
            <div className="bg-white  w-[60%] max-w-[500px] p-[24px]">
                <div className="flex justify-between items-center mb-[20px]">
                    <h2 className="text-[18px] font-medium text-[#101828]">Add Logistics Partner Admin</h2>
                    <button
                        onClick={handleClose}
                        className="text-[#667085] hover:text-[#101828] transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-[16px]">
                    <div>
                        <label className="block text-[14px] font-medium text-[#344054] mb-[6px]">
                            First Name
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-[14px] py-[10px] border border-[#D0D5DD] rounded-[8px] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#022B23] focus:border-transparent"
                            placeholder="Enter first name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[14px] font-medium text-[#344054] mb-[6px]">
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-[14px] py-[10px] border border-[#D0D5DD] rounded-[8px] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#022B23] focus:border-transparent"
                            placeholder="Enter last name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[14px] font-medium text-[#344054] mb-[6px]">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-[14px] py-[10px] border border-[#D0D5DD] rounded-[8px] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#022B23] focus:border-transparent"
                            placeholder="Enter email address"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[14px] font-medium text-[#344054] mb-[6px]">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-[14px] py-[10px] border border-[#D0D5DD] rounded-[8px] text-[16px] focus:outline-none focus:ring-2 focus:ring-[#022B23] focus:border-transparent pr-[50px]"
                                placeholder="Enter password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-[14px] top-1/2 transform -translate-y-1/2 text-[#667085] hover:text-[#101828] transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-[12px] pt-[20px]">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-[16px] py-[10px] border border-[#D0D5DD] text-[#344054] rounded-[8px] font-medium hover:bg-[#F9FAFB] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-[16px] py-[10px] bg-[#022B23] text-white rounded-[8px] font-medium hover:bg-[#033228] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span className="ml-2">Adding...</span>
                                </div>
                            ) : (
                                'Add Partner'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LogisticsPartnerModal;