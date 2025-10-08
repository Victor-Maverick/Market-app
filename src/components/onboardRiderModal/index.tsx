'use client';
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useSession } from 'next-auth/react';
import arrowDown from '@/../public/assets/images/arrow-down.svg';
import axios from 'axios';
import Toast from '@/components/Toast';

interface Vehicle {
    id: number;
    plateNumber: string;
    engineNumber: string;
    type: "BIKE" | "TRUCK";
}

interface RiderRequest {
    vehicleId: number;
    riderFirstName: string;
    riderLastName: string;
    riderEmail: string;
    phone: string;
}

interface OnboardRiderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const logisticsApi = axios.create({
    baseURL: 'https://digitalmarket.benuestate.gov.ng/api/logistics',
    headers: {
        'Content-Type': 'application/json',
    }
});

const OnboardRiderModal: React.FC<OnboardRiderModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { data: session } = useSession();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        riderFirstName: '',
        riderLastName: '',
        riderEmail: '',
        phone: ''
    });
    const [errors, setErrors] = useState({
        vehicleId: '',
        riderFirstName: '',
        riderLastName: '',
        riderEmail: '',
        phone: ''
    });
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [toastMessage, setToastMessage] = useState('');
    const [toastSubMessage, setToastSubMessage] = useState('');

    // Helper function to show toast messages
    const showToastMessage = (type: 'success' | 'error', message: string, subMessage: string) => {
        setToastType(type);
        setToastMessage(message);
        setToastSubMessage(subMessage);
        setShowToast(true);

        // Auto-hide after 3 seconds
        setTimeout(() => setShowToast(false), 3000);
    };

    // Fetch vehicles when modal opens
    useEffect(() => {
        if (isOpen && session?.user?.email) {
            fetchVehicles();
        }
    }, [isOpen, session]);

    const fetchVehicles = async () => {
        try {
            const response = await logisticsApi.get<Vehicle[]>('/allCompanyVehicles', {
                params: { email: session?.user?.email }
            });
            setVehicles(response.data);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            showToastMessage('error', 'Failed to load vehicles', 'Please try again later');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleVehicleSelect = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsDropdownOpen(false);

        // Clear vehicle error
        if (errors.vehicleId) {
            setErrors(prev => ({
                ...prev,
                vehicleId: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            vehicleId: '',
            riderFirstName: '',
            riderLastName: '',
            riderEmail: '',
            phone: ''
        };

        if (!selectedVehicle) {
            newErrors.vehicleId = 'Please select a vehicle';
        }

        if (!formData.riderFirstName.trim()) {
            newErrors.riderFirstName = 'First name is required';
        }

        if (!formData.riderLastName.trim()) {
            newErrors.riderLastName = 'Last name is required';
        }

        if (!formData.riderEmail.trim()) {
            newErrors.riderEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.riderEmail)) {
            newErrors.riderEmail = 'Please enter a valid email';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.trim())) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const riderRequest: RiderRequest = {
                vehicleId: selectedVehicle!.id,
                riderFirstName: formData.riderFirstName,
                riderLastName: formData.riderLastName,
                riderEmail: formData.riderEmail,
                phone: formData.phone
            };

            await logisticsApi.post('/onboard-rider', riderRequest);

            // Reset form
            setFormData({
                riderFirstName: '',
                riderLastName: '',
                riderEmail: '',
                phone: ''
            });
            setSelectedVehicle(null);
            setErrors({
                vehicleId: '',
                riderFirstName: '',
                riderLastName: '',
                riderEmail: '',
                phone: ''
            });

            // Show success toast
            showToastMessage('success', 'Rider Added Successfully', 'The rider has been onboarded successfully');

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to onboard rider:', error);
            let errorMessage = 'An unexpected error occurred';
            let subMessage = 'Please try again later';


            if (axios.isAxiosError(error)) {
                if (error.response?.status === 500) {
                    errorMessage = 'User Exists';
                    subMessage = 'A user with this email already exists';
                } else {
                    errorMessage = error.response?.data?.message || error.message;
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            showToastMessage('error', errorMessage, subMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        // Reset form when closing
        setFormData({
            riderFirstName: '',
            riderLastName: '',
            riderEmail: '',
            phone: ''
        });
        setSelectedVehicle(null);
        setErrors({
            vehicleId: '',
            riderFirstName: '',
            riderLastName: '',
            riderEmail: '',
            phone: ''
        });
        setIsDropdownOpen(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {showToast && (
                <Toast
                    type={toastType}
                    message={toastMessage}
                    subMessage={toastSubMessage}
                    onClose={() => setShowToast(false)}
                />
            )}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
                <div className="bg-white rounded-[16px] w-[500px] max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-6 border-b border-[#EAECF0]">
                        <h2 className="text-[20px] font-semibold text-[#101828]">Add New Rider</h2>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            {/*<Image src={closeImg} alt="Close" width={20} height={20} />*/}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Vehicle Selection */}
                        <div className="space-y-2">
                            <label className="block text-[14px] font-medium text-[#344054]">
                                Select Vehicle *
                            </label>
                            <div className="relative">
                                <div
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`flex items-center justify-between w-full px-3 py-2 border rounded-[8px] cursor-pointer ${
                                        errors.vehicleId ? 'border-red-500' : 'border-[#D0D5DD]'
                                    } ${selectedVehicle ? 'text-[#101828]' : 'text-[#667085]'}`}
                                >
                                    <span>
                                        {selectedVehicle
                                            ? `${selectedVehicle.type} - ${selectedVehicle.engineNumber}`
                                            : 'Select a vehicle'
                                        }
                                    </span>
                                    <Image
                                        src={arrowDown}
                                        alt="Dropdown"
                                        width={16}
                                        height={16}
                                        className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    />
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 z-10 bg-white border border-[#D0D5DD] rounded-[8px] mt-1 max-h-[200px] overflow-y-auto shadow-lg">
                                        {vehicles.length === 0 ? (
                                            <div className="px-3 py-2 text-[#667085] text-[14px]">
                                                No vehicles available
                                            </div>
                                        ) : (
                                            vehicles.map(vehicle => (
                                                <div
                                                    key={vehicle.id}
                                                    onClick={() => handleVehicleSelect(vehicle)}
                                                    className="px-3 py-2 hover:bg-[#F9FAFB] cursor-pointer text-[14px] text-[#101828] border-b border-[#EAECF0] last:border-b-0"
                                                >
                                                    <div className="font-medium">{vehicle.type}</div>
                                                    <div className="text-[12px] text-[#667085]">
                                                        Engine: {vehicle.engineNumber}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.vehicleId && (
                                <span className="text-red-500 text-[12px]">{errors.vehicleId}</span>
                            )}
                        </div>

                        {/* First Name */}
                        <div className="space-y-2">
                            <label className="block text-[14px] font-medium text-[#344054]">
                                First Name *
                            </label>
                            <input
                                type="text"
                                name="riderFirstName"
                                value={formData.riderFirstName}
                                onChange={handleInputChange}
                                placeholder="Enter rider's first name"
                                className={`w-full px-3 py-2 border rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6941C6] ${
                                    errors.riderFirstName ? 'border-red-500' : 'border-[#D0D5DD]'
                                }`}
                            />
                            {errors.riderFirstName && (
                                <span className="text-red-500 text-[12px]">{errors.riderFirstName}</span>
                            )}
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                            <label className="block text-[14px] font-medium text-[#344054]">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                name="riderLastName"
                                value={formData.riderLastName}
                                onChange={handleInputChange}
                                placeholder="Enter rider's last name"
                                className={`w-full px-3 py-2 border rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6941C6] ${
                                    errors.riderLastName ? 'border-red-500' : 'border-[#D0D5DD]'
                                }`}
                            />
                            {errors.riderLastName && (
                                <span className="text-red-500 text-[12px]">{errors.riderLastName}</span>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-[14px] font-medium text-[#344054]">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="riderEmail"
                                value={formData.riderEmail}
                                onChange={handleInputChange}
                                placeholder="Enter rider's email address"
                                className={`w-full px-3 py-2 border rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6941C6] ${
                                    errors.riderEmail ? 'border-red-500' : 'border-[#D0D5DD]'
                                }`}
                            />
                            {errors.riderEmail && (
                                <span className="text-red-500 text-[12px]">{errors.riderEmail}</span>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="block text-[14px] font-medium text-[#344054]">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter rider's phone number"
                                className={`w-full px-3 py-2 border rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#6941C6] ${
                                    errors.phone ? 'border-red-500' : 'border-[#D0D5DD]'
                                }`}
                            />
                            {errors.phone && (
                                <span className="text-red-500 text-[12px]">{errors.phone}</span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 border border-[#D0D5DD] text-[#344054] rounded-[8px] font-medium hover:bg-[#F9FAFB] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-[#022B23] text-[#C6EB5F] rounded-[8px] font-medium hover:bg-[#022B23]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Adding Rider...' : 'Add Rider'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default OnboardRiderModal;