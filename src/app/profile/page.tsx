'use client'
import React, {useEffect, useRef, useState} from "react";
import MarketPlaceHeader from "@/components/marketPlaceHeader";
import Image from "next/image";
import arrowBack from "../../../public/assets/images/arrow-right.svg";
import emailIcon from "../../../public/assets/images/sms.svg";
import eyeOpen from "../../../public/assets/images/eye.svg";
import eyeClosed from "../../../public/assets/images/eye.svg";
import {useSession} from "next-auth/react";
import axios from "axios";
import Toast from "@/components/Toast";
import { Camera, X } from "lucide-react";

type FormField = {
    id: keyof FormData;
    label: string;
    type: 'password';
    withIcon?: boolean;
};

type FormData = {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
};

type PasswordValidation = {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    specialChar: boolean;
    number: boolean;
};

type UserProfile = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    imageUrl: string;
};

interface AddressResponse {
    id: number;
    address: string;
    state: string;
    lga: string;
}

const formFields: FormField[] = [
    { id: 'oldPassword', label: 'Old password', type: 'password' },
    { id: 'newPassword', label: 'New password', type: 'password' },
    { id: 'confirmPassword', label: 'Confirm password', type: 'password' },
];

const passwordCriteria = [
    { key: 'length', label: '8 characters' },
    { key: 'lowercase', label: 'one lowercase character' },
    { key: 'uppercase', label: 'one uppercase character' },
    { key: 'specialChar', label: 'special character' },
    { key: 'number', label: 'number' },
];

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (addressData: { address: string; state: string; lga: string }) => void;
    email: string;
    initialData?: {
        address: string;
        state: string;
        lga: string;
    };
    isUpdate?: boolean;
}

// Profile Picture Modal Component
const ProfilePictureModal = ({ 
    isOpen, 
    onClose, 
    imageUrl 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    imageUrl: string | null; 
}) => {
    if (!isOpen || !imageUrl) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="relative max-w-4xl max-h-4xl p-4">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={24} className="text-gray-600" />
                </button>
                <Image
                    src={imageUrl}
                    alt="Profile picture"
                    width={800}
                    height={800}
                    className="max-w-full max-h-full object-contain rounded-lg"
                />
            </div>
        </div>
    );
};

// Profile Picture Upload Confirmation Modal
const ProfilePictureUploadModal = ({
    isOpen,
    onClose,
    selectedFile,
    onConfirm,
    onCancel,
    isUploading
}: {
    isOpen: boolean;
    onClose: () => void;
    selectedFile: File | null;
    onConfirm: () => void;
    onCancel: () => void;
    isUploading: boolean;
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [selectedFile]);

    if (!isOpen || !selectedFile) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 w-[90%] max-w-md">
                <h3 className="text-lg font-semibold text-[#022B23] mb-4">Upload Profile Picture</h3>
                
                {previewUrl && (
                    <div className="flex justify-center mb-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                width={128}
                                height={128}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}
                
                <p className="text-sm text-gray-600 mb-6 text-center">
                    Do you want to upload this image as your profile picture?
                </p>
                
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={isUploading}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isUploading}
                        className="px-4 py-2 bg-[#022B23] text-white rounded-lg hover:bg-[#033a30] disabled:opacity-50 flex items-center gap-2"
                    >
                        {isUploading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Profile Picture Component
const ProfilePicture = ({ 
    imageUrl, 
    onUpload,
    isUploading = false
}: { 
    imageUrl: string | null; 
    onUpload: (file: File) => void;
    isUploading?: boolean;
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClick = () => {
        if (!isUploading) {
            setIsDropdownOpen(!isDropdownOpen);
        }
    };

    const handleViewPhoto = () => {
        setIsModalOpen(true);
        setIsDropdownOpen(false);
    };

    const handleUploadPhoto = () => {
        fileInputRef.current?.click();
        setIsDropdownOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            setIsUploadModalOpen(true);
        }
        // Reset file input
        e.target.value = '';
    };

    const handleConfirmUpload = () => {
        if (selectedFile) {
            onUpload(selectedFile);
            setIsUploadModalOpen(false);
            setSelectedFile(null);
        }
    };

    const handleCancelUpload = () => {
        setIsUploadModalOpen(false);
        setSelectedFile(null);
    };

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <div 
                    className="relative w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
                    onClick={handleClick}
                >
                    {isUploading ? (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#022B23]"></div>
                        </div>
                    ) : imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt="Profile picture"
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Camera size={24} className="text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        {imageUrl && (
                            <button
                                onClick={handleViewPhoto}
                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Photo
                            </button>
                        )}
                        <button
                            onClick={handleUploadPhoto}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Camera size={16} />
                            {imageUrl ? 'Change Photo' : 'Upload Photo'}
                        </button>
                    </div>
                )}
            </div>
            
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            
            <ProfilePictureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                imageUrl={imageUrl}
            />

            <ProfilePictureUploadModal
                isOpen={isUploadModalOpen}
                onClose={handleCancelUpload}
                selectedFile={selectedFile}
                onConfirm={handleConfirmUpload}
                onCancel={handleCancelUpload}
                isUploading={isUploading}
            />
        </>
    );
};

const AddressModal = ({ isOpen, onClose, onSubmit, email, initialData, isUpdate = false }: AddressModalProps) => {
    const [formData, setFormData] = useState({
        address: initialData?.address || '',
        state: initialData?.state || 'Benue',
        lga: initialData?.lga || '',
        email: email
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                address: initialData.address,
                state: initialData.state,
                lga: initialData.lga,
                email: email
            });
        }
    }, [initialData, email]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20 p-4">
            <div className="bg-white px-6 lg:px-10 py-8 w-full max-w-[600px] rounded-[24px] gap-[30px] flex flex-col items-center max-h-[90vh] overflow-y-auto">
                <div className="w-full text-left">
                    <h2 className="text-[16px] font-medium text-[#022B23]">{isUpdate ? 'Update' : 'Add'} Address</h2>
                    <p className="text-[14px] font-medium leading-tight text-[#707070]">
                        Please provide your complete address details
                    </p>
                </div>

                <div className="flex flex-col w-full gap-4">
                    <div className="relative flex flex-col w-full">
                        <label htmlFor="address" className="text-[#6D6D6D] text-[12px] font-medium mb-1">
                            Address
                        </label>
                        <input
                            id="address"
                            name="address"
                            type="text"
                            value={formData.address}
                            onChange={handleChange}
                            className="px-4 w-full h-[58px] border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] text-[#121212] text-[14px] font-medium"
                            placeholder="Enter your full address"
                        />
                    </div>

                    <div className="relative flex flex-col w-full">
                        <label htmlFor="state" className="text-[#6D6D6D] text-[12px] font-medium mb-1">
                            State
                        </label>
                        <select
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="px-4 w-full h-[58px] border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] text-[#121212] text-[14px] font-medium appearance-none"
                        >
                            <option value="Benue">Benue</option>
                        </select>
                    </div>

                    <div className="relative flex flex-col w-full">
                        <label htmlFor="lga" className="text-[#6D6D6D] text-[12px] font-medium mb-1">
                            LGA
                        </label>
                        <input
                            id="lga"
                            name="lga"
                            type="text"
                            value={formData.lga}
                            onChange={handleChange}
                            className="px-4 w-full h-[58px] border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] text-[#121212] text-[14px] font-medium"
                            placeholder="Enter your Local Government Area"
                        />
                    </div>
                </div>

                <div className="flex w-full gap-4 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-[#D0D5DD] rounded-[8px] text-[#022B23] font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 bg-[#022B23] rounded-[8px] text-white font-medium hover:bg-[#033a30] transition-colors"
                    >
                        {isUpdate ? 'Update' : 'Save'} Address
                    </button>
                </div>
            </div>
        </div>
    );
};

const Profile = () => {
    const [form, setForm] = useState<FormData>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [focusedFields, setFocusedFields] = useState<Record<keyof FormData, boolean>>(
        Object.fromEntries(Object.keys(form).map(key => [key, false])) as Record<keyof FormData, boolean>
    );
    const [passwordValid, setPasswordValid] = useState<PasswordValidation>({
        length: false,
        lowercase: false,
        uppercase: false,
        specialChar: false,
        number: false
    });
    const { data: session } = useSession();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activeSection, setActiveSection] = useState<'general' | 'team' | 'security' | 'notifications'>('general');
    const [passwordUpdateError, setPasswordUpdateError] = useState<string | null>(null);
    const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const [userAddress, setUserAddress] = useState<AddressResponse | null>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(true);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    // Toast state
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const [toastMessage, setToastMessage] = useState("");
    const [toastSubMessage, setToastSubMessage] = useState("");

    // Refs for each section
    const generalSettingsRef = useRef<HTMLDivElement>(null);
    const securityRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const showErrorToast = (message: string, subMessage: string) => {
        setToastType("error");
        setToastMessage(message);
        setToastSubMessage(subMessage);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const showSuccessToast = (message: string, subMessage: string) => {
        setToastType("success");
        setToastMessage(message);
        setToastSubMessage(subMessage);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const handleCloseToast = () => setShowToast(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (name === 'newPassword') {
            setPasswordValid({
                length: value.length >= 8,
                lowercase: /[a-z]/.test(value),
                uppercase: /[A-Z]/.test(value),
                specialChar: /[^A-Za-z0-9]/.test(value),
                number: /[0-9]/.test(value)
            });
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user?.email) return;

            try {
                setLoading(true);
                setIsLoadingAddress(true);

                // First check if address exists
                const existsResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/address-exists?email=${session.user.email}`
                );

                // Fetch user profile
                const profileResponse = await axios.get<UserProfile>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/get-profile?email=${session.user.email}`
                );

                setUserProfile(profileResponse.data);
                if (existsResponse.data) {
                    const addressResponse = await axios.get<AddressResponse>(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/get-userAddress?email=${session.user.email}`
                    );
                    setUserAddress(addressResponse.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
                console.error('Error:', err);
            } finally {
                setLoading(false);
                setIsLoadingAddress(false);
            }
        };

        fetchUserData();
    }, [session]);

    const handleProfilePictureUpload = async (file: File) => {
        if (!session?.user?.email) return;

        try {
            setIsUploadingPhoto(true);
            
            const formData = new FormData();
            formData.append('email', session.user.email);
            formData.append('image', file);

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/upload-photo`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.status >= 200 && response.status < 300) {
                // Refresh user profile to get updated image URL
                const profileResponse = await axios.get<UserProfile>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/get-profile?email=${session.user.email}`
                );
                setUserProfile(profileResponse.data);
                showSuccessToast('Success', 'Profile picture updated successfully');
            } else {
                throw new Error('Failed to upload profile picture');
            }
        } catch (err) {
            showErrorToast('Error', 'Failed to upload profile picture. Please try again.');
            console.error('Error uploading profile picture:', err);
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleAddressSubmit = async (addressData: { address: string; state: string; lga: string }) => {
        if (!session?.user?.email) return;

        try {
            const endpoint = userAddress
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update-address`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/add-address`;

            const method = userAddress ? 'POST' : 'POST';

            const response = await axios(endpoint, {
                method,
                data: {
                    ...addressData,
                    email: session.user.email
                }
            });

            if (response.status >= 200 && response.status < 300) {
                // Fetch updated address
                const addressResponse = await axios.get<AddressResponse>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/get-userAddress?email=${session.user.email}`
                );
                setUserAddress(addressResponse.data);
                showSuccessToast('Success', userAddress ? 'Address updated successfully' : 'Address added successfully');
            } else {
                throw new Error(userAddress ? 'Failed to update address' : 'Failed to add address');
            }
        } catch (err) {
            showErrorToast('Error', err instanceof Error ? err.message : 'An error occurred while processing address');
            console.error('Error:', err);
        } finally {
            setIsAddressModalOpen(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!session?.user?.email) return;
        if (form.newPassword !== form.confirmPassword) {
            setPasswordUpdateError("New passwords don't match");
            return;
        }

        try {
            setIsUpdatingPassword(true);
            setPasswordUpdateError(null);
            setPasswordUpdateSuccess(false);

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/change-password`,
                {
                    email: session.user.email,
                    oldPassword: form.oldPassword,
                    newPassword: form.newPassword
                }
            );

            if (response.status >= 200 && response.status < 300) {
                setPasswordUpdateSuccess(true);
                setForm({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                showSuccessToast('Success', 'Password updated successfully');
                setTimeout(() => setPasswordUpdateSuccess(false), 5000);
            } else {
                throw new Error('Failed to update password');
            }
        } catch (err) {
            setPasswordUpdateError("Wrong password");
            showErrorToast('Error', 'Failed to update password. Please check your old password.');
            console.error('Error updating password:', err);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleFocus = (field: keyof FormData) => {
        setFocusedFields(prev => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field: keyof FormData) => {
        setFocusedFields(prev => ({ ...prev, [field]: false }));
    };

    const toggleOldPasswordVisibility = () => setShowOldPassword(!showOldPassword);
    const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const getInputType = (field: FormField): string => {
        if (field.id === 'oldPassword') return showOldPassword ? 'text' : 'password';
        if (field.id === 'newPassword') return showNewPassword ? 'text' : 'password';
        if (field.id === 'confirmPassword') return showConfirmPassword ? 'text' : 'password';
        return field.type;
    };

    const shouldShowIcon = (field: FormField) => {
        return (focusedFields[field.id] || form[field.id]) && field.withIcon;
    };

    const shouldShowPasswordToggle = (field: FormField) => {
        return (focusedFields[field.id] || form[field.id]) && field.type === 'password';
    };

    const SCROLL_OFFSET = 119;
    const handleNavClick = (section: 'general' | 'security' | 'notifications') => {
        setActiveSection(section);

        let targetRef;
        switch (section) {
            case 'general':
                targetRef = generalSettingsRef.current;
                break;
            case 'security':
                targetRef = securityRef.current;
                break;
            case 'notifications':
                targetRef = notificationsRef.current;
                break;
            default:
                return;
        }

        if (targetRef) {
            const elementPosition = targetRef.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - SCROLL_OFFSET;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const generalSettingsNode = generalSettingsRef.current;
        const securityNode = securityRef.current;
        const notificationsNode = notificationsRef.current;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        switch (entry.target.id) {
                            case 'general-settings':
                                setActiveSection('general');
                                break;
                            case 'security-section':
                                setActiveSection('security');
                                break;
                            case 'notifications-section':
                                setActiveSection('notifications');
                                break;
                        }
                    }
                });
            },
            { threshold: 0.5 }
        );
        if (generalSettingsNode) observer.observe(generalSettingsNode);
        if (securityNode) observer.observe(securityNode);
        if (notificationsNode) observer.observe(notificationsNode);

        return () => {
            if (generalSettingsNode) observer.unobserve(generalSettingsNode);
            if (securityNode) observer.unobserve(securityNode);
            if (notificationsNode) observer.unobserve(notificationsNode);
        };
    }, []);

    // Split password criteria into two rows
    const firstRowCriteria = passwordCriteria.slice(0, 2);
    const secondRowCriteria = passwordCriteria.slice(2);

    if (loading) {
        return (
            <>
                <MarketPlaceHeader />
                <div className="flex justify-center items-center h-screen">
                    <p>Loading profile...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <MarketPlaceHeader />
                <div className="flex justify-center items-center h-screen">
                    <p className="text-red-500">Error: {error}</p>
                </div>
            </>
        );
    }

    if (!userProfile) {
        return (
            <>
                <MarketPlaceHeader />
                <div className="flex justify-center items-center h-screen">
                    <p>No profile data available</p>
                </div>
            </>
        );
    }

    return (
        <>
            <MarketPlaceHeader />
            <div className="h-[48px] w-full border-b-[0.5px] border-[#EDEDED]">
                <div className="h-[48px] px-25 gap-[8px] items-center flex">
                    <Image src={arrowBack} alt={'image'}/>
                    <p className="text-[14px] text-[#3F3E3E]">Home // <span className="font-medium text-[#022B23]">Profile</span></p>
                </div>
            </div>
            <div className="pt-[62px] px-4 lg:px-25">
                <div className="flex w-full max-w-[400px] bg-[#f8f8f8] mb-[10px] h-[40px] rounded-[10px] items-center px-[8px]">
                    <p className="text-[12px] font-medium text-[#022B23]">My profile</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-[20px] lg:gap-[30px]">
                    <div className="flex flex-col gap-[14px] w-full lg:w-auto">
                        <div className="flex flex-row lg:flex-col w-full lg:w-[400px] h-auto lg:h-[120px] rounded-[12px] border-[1px] border-[#EDEDED] overflow-x-auto lg:overflow-x-visible">
                            <span
                                className={`text-[#022B23] ${activeSection === 'general' ? 'bg-[#F8F8F8]' : ''} flex-shrink-0 lg:flex-shrink lg:rounded-tr-[12px] lg:rounded-tl-[12px] text-[12px] py-[10px] px-[8px] h-[40px] cursor-pointer whitespace-nowrap flex items-center`}
                                onClick={() => handleNavClick('general')}
                            >
                                General settings
                            </span>
                            <span
                                className={`text-[#022B23] ${activeSection === 'security' ? 'bg-[#F8F8F8]' : ''} flex-shrink-0 lg:flex-shrink text-[12px] py-[10px] px-[8px] h-[40px] cursor-pointer whitespace-nowrap flex items-center`}
                                onClick={() => handleNavClick('security')}
                            >
                                Security
                            </span>
                            <span
                                className={`text-[#022B23] ${activeSection === 'notifications' ? 'bg-[#F8F8F8]' : ''} flex-shrink-0 lg:flex-shrink lg:rounded-br-[12px] lg:rounded-bl-[12px] text-[12px] py-[10px] px-[8px] h-[40px] cursor-pointer whitespace-nowrap flex items-center`}
                                onClick={() => handleNavClick('notifications')}
                            >
                                Notifications
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[24px] mb-10 w-full lg:w-[820px]">
                        <div
                            ref={generalSettingsRef}
                            id="general-settings"
                            className="flex-col flex w-full h-auto rounded-[24px] border-[1px] border-[#EDEDED]"
                        >
                            <div className="flex flex-col h-[92px] w-full px-[37px] py-[14px] border-b border-[#ededed]">
                                <p className="text-[#101828] text-[18px] font-medium">General settings</p>
                                <p className="text-[#667085] text-[14px]">View and manage all your settings</p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center min-h-[77px] w-full px-[20px] sm:px-[37px] py-[14px] leading-tight gap-[16px] sm:gap-0">
                                <div className="flex flex-col">
                                    <p className="text-[#6A6C6E] text-[14px] ">Full Name</p>
                                    <p className="text-[#141415] text-[16px] font-medium break-words">{userProfile.firstName} {userProfile.lastName}</p>
                                </div>
                                <div className="flex justify-center sm:justify-end">
                                    <ProfilePicture 
                                        imageUrl={userProfile.imageUrl} 
                                        onUpload={handleProfilePictureUpload}
                                        isUploading={isUploadingPhoto}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center min-h-[77px] w-full px-[20px] sm:px-[37px] py-[14px] leading-tight gap-[16px] sm:gap-0">
                                <div className="flex flex-col flex-1 min-w-0">
                                    <p className="text-[#6A6C6E] text-[14px] ">Address</p>
                                    <p className="text-[#141415] text-[16px] font-medium break-words">
                                        {isLoadingAddress ? "Loading..." :
                                            userAddress ? `${userAddress.address}, ${userAddress.lga}, ${userAddress.state}` : "No address provided"}
                                    </p>
                                </div>
                                <div
                                    className="flex cursor-pointer hover:shadow-sm justify-center text-[#023047] text-[14px] items-center rounded-[8px] w-full sm:w-[100px] h-[40px] border-[1px] border-[#D0D5DD] flex-shrink-0"
                                    onClick={() => setIsAddressModalOpen(true)}
                                >
                                    {userAddress ? "Edit" : "Add Address"}
                                </div>
                            </div>
                            <div className="flex flex-col min-h-[77px] w-full px-[20px] sm:px-[37px] py-[14px] leading-tight">
                                <p className="text-[#6A6C6E] text-[14px] ">LGA</p>
                                <p className="text-[#141415] text-[16px] font-medium break-words">
                                    {isLoadingAddress ? "Loading..." :
                                        userAddress ? `${userAddress.lga}` : "No address"}
                                </p>
                            </div>
                            <div className="flex flex-col min-h-[77px] w-full px-[20px] sm:px-[37px] py-[14px] leading-tight">
                                <p className="text-[#6A6C6E] text-[14px] ">State</p>
                                <p className="text-[#141415] text-[16px] font-medium break-words">
                                    {isLoadingAddress ? "Loading..." :
                                        userAddress ? `${userAddress.state}` : "No address"}
                                </p>
                            </div>
                        </div>

                        <div
                            ref={securityRef}
                            id="security-section"
                            className="flex-col flex w-full h-auto rounded-[24px] border-[1px] border-[#EDEDED]"
                        >
                            <div className="flex flex-col h-[92px] w-full px-[37px] py-[14px] border-b border-[#ededed]">
                                <p className="text-[#101828] text-[18px] font-medium">Security</p>
                                <p className="text-[#667085] text-[14px]">Change and manage passwords</p>
                            </div>
                            {formFields.map((field) => (
                                <div key={field.id} className="relative mt-[15px] w-full flex flex-col">
                                    <label
                                        htmlFor={field.id}
                                        className={`absolute left-4 transition-all ${
                                            focusedFields[field.id] || form[field.id]
                                                ? "text-[#6D6D6D] text-[12px] font-medium top-[6px] ml-[16px]"
                                                : "hidden"
                                        }`}
                                    >
                                        {field.label}
                                    </label>
                                    <div className="relative mx-[15px]">
                                        <input
                                            id={field.id}
                                            type={getInputType(field)}
                                            name={field.id}
                                            value={form[field.id]}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus(field.id)}
                                            onBlur={() => handleBlur(field.id)}
                                            placeholder={!focusedFields[field.id] && !form[field.id] ? field.label : ""}
                                            className={`px-4 h-[58px] w-full border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] ${
                                                focusedFields[field.id] || form[field.id]
                                                    ? "pt-[14px] pb-[4px] text-[#121212] text-[14px] font-medium"
                                                    : "text-[#BDBDBD] text-[16px] font-medium"
                                            }`}
                                        />

                                        {shouldShowIcon(field) && (
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                                <Image src={emailIcon} alt="Email icon" width={20} height={20} />
                                            </div>
                                        )}

                                        {shouldShowPasswordToggle(field) && (
                                            <div
                                                className="absolute right-4 px-[6px] py-[4px] flex items-center text-[#DCDCDC] text-[12px] shadow-md gap-[8px] rounded-[8px] border-[1px] border-[#EAEAEA] w-[72px] top-1/2 transform -translate-y-1/2 cursor-pointer bg-white"
                                                onClick={
                                                    field.id === 'oldPassword' ? toggleOldPasswordVisibility :
                                                        field.id === 'newPassword' ? toggleNewPasswordVisibility :
                                                            toggleConfirmPasswordVisibility
                                                }
                                            >
                                                <Image
                                                    src={
                                                        (field.id === 'oldPassword' ? showOldPassword :
                                                            field.id === 'newPassword' ? showNewPassword :
                                                                showConfirmPassword) ? eyeOpen : eyeClosed
                                                    }
                                                    alt={
                                                        field.id === 'oldPassword' ? (showOldPassword ? "Hide password" : "Show password") :
                                                            field.id === 'newPassword' ? (showNewPassword ? "Hide password" : "Show password") :
                                                                (showConfirmPassword ? "Hide password" : "Show password")
                                                    }
                                                    width={16}
                                                    height={16}
                                                />
                                                <span>{
                                                    field.id === 'oldPassword' ? (showOldPassword ? "Hide" : "Show") :
                                                        field.id === 'newPassword' ? (showNewPassword ? "Hide" : "Show") :
                                                            (showConfirmPassword ? "Hide" : "Show")
                                                }</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div className="flex flex-col gap-2 mt-2 px-[15px]">
                                <div className="flex gap-2">
                                    {firstRowCriteria.map((criteria) => (
                                        <span
                                            key={criteria.key}
                                            className={`px-2 flex items-center justify-center h-[33px] text-[14px] text-[#022B23] rounded-[10px] ${
                                                passwordValid[criteria.key as keyof PasswordValidation] ? 'bg-[#D1FAE7]' : 'bg-gray-300'
                                            }`}
                                        >
                                            {criteria.label}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    {secondRowCriteria.map((criteria) => (
                                        <span
                                            key={criteria.key}
                                            className={`px-2 flex items-center justify-center h-[33px] text-[14px] text-[#022B23] rounded-[10px] ${
                                                passwordValid[criteria.key as keyof PasswordValidation] ? 'bg-[#D1FAE7]' : 'bg-gray-300'
                                            }`}
                                        >
                                            {criteria.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {passwordUpdateError && (
                                <div className="px-[15px] text-red-500 text-sm">
                                    {passwordUpdateError}
                                </div>
                            )}
                            {passwordUpdateSuccess && (
                                <div className="px-[15px] text-green-500 text-sm">
                                    Password updated successfully!
                                </div>
                            )}
                            <div className="flex px-[15px] py-[20px]">
                                <button
                                    className="w-[156px] h-[40px] rounded-[8px] cursor-pointer hover:shadow-sm border-[#D0D5DD] border font-medium text-[14px] px-[16px] py-[10px] text-[#022B23]"
                                    onClick={handleUpdatePassword}
                                    disabled={isUpdatingPassword}
                                >
                                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </div>
                        <div
                            ref={notificationsRef}
                            id="notifications-section"
                            className="flex-col flex w-full h-auto rounded-[24px] border-[1px] border-[#EDEDED]"
                        >
                            <div className="flex flex-col h-[92px] w-full px-[37px] py-[14px] border-b border-[#ededed]">
                                <p className="text-[#101828] text-[18px] font-medium">Notifications</p>
                                <p className="text-[#667085] text-[14px]">Notification preference</p>
                            </div>
                            <div className="flex justify-between items-center h-[77px] w-full px-[37px] py-[14px] leading-tight">
                                <div className="flex flex-col">
                                    <p className="text-[#6A6C6E] text-[14px] ">Email</p>
                                    <p className="text-[#141415] text-[16px] font-medium">{userProfile.email}</p>
                                </div>
                                <div className="flex w-[72px] justify-end cursor-pointer p-[4px] items-center rounded-[24px] bg-[#C6EB5F] h-[40px]">
                                    <div className="w-[32px] bg-white h-[32px] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSubmit={handleAddressSubmit}
                email={session?.user?.email || ''}
                initialData={userAddress || undefined}
                isUpdate={!!userAddress}
            />
            {showToast && (
                <Toast
                    type={toastType}
                    message={toastMessage}
                    subMessage={toastSubMessage}
                    onClose={handleCloseToast}
                />
            )}
        </>
    )
}
export default Profile;