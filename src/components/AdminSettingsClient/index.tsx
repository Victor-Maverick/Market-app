'use client'
import React, { useEffect,  useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import emailIcon from "../../../public/assets/images/sms.svg";
import eyeOpen from "../../../public/assets/images/eye.svg";
import eyeClosed from "../../../public/assets/images/eye.svg";
import settingUser from "../../../public/assets/images/settingUser.svg";
import limeArrow from '@/../public/assets/images/green arrow.png';
import { useSession } from "next-auth/react";
import axios from "axios";
import { FormSkeleton, UsersTableSkeleton } from '../LoadingSkeletons';

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
    shopName: string;
    phone: string;
    address: string;
};

interface AddressResponse {
    id: number;
    address: string;
    state: string;
    lga: string;
}

interface UserResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white px-10 py-8 w-[600px] rounded-[24px] gap-[30px] flex flex-col items-center">
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

const GeneralTab = () => {
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
    const [passwordUpdateError, setPasswordUpdateError] = useState<string | null>(null);
    const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [userAddress, setUserAddress] = useState<AddressResponse | null>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

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

    useEffect(() => {
        const fetchUserData = async () => {
            if (!session?.user?.email) return;

            try {
                setLoading(true);

                const existsResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/address-exists?email=${session.user.email}`
                );

                const profileResponse = await axios.get<UserProfile>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/get-profile?email=${session.user.email}`
                );

                setUserProfile(profileResponse.data);
                if (existsResponse.data) {
                    const addressResponse = await axios.get<AddressResponse>(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/get-userAddress?email=${session.user.email}`);
                    setUserAddress(addressResponse.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [session]);

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
                const addressResponse = await axios.get<AddressResponse>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/get-userAddress?email=${session.user.email}`
                );
                setUserAddress(addressResponse.data);
            } else {
                throw new Error(userAddress ? 'Failed to update address' : 'Failed to add address');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while processing address');
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
                setTimeout(() => setPasswordUpdateSuccess(false), 5000);
            } else {
                throw new Error('Failed to update password');
            }
        } catch (err) {
            setPasswordUpdateError(err instanceof Error ? err.message : 'Failed to update password');
            console.error('Error updating password:', err);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    // Split password criteria into two rows
    const firstRowCriteria = passwordCriteria.slice(0, 2);
    const secondRowCriteria = passwordCriteria.slice(2);

    if (loading) {
        return (
            <div className="p-6">
                <FormSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>No profile data available</p>
            </div>
        );
    }

    return (
        <>
            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSubmit={handleAddressSubmit}
                email={session?.user?.email || ''}
                initialData={userAddress || undefined}
                isUpdate={!!userAddress}
            />
            <div className="flex gap-[30px]">
                <div className="flex flex-col gap-[24px] mb-10 w-[820px]">
                    <div className="flex-col flex w-full h-auto rounded-[24px] border-[1px] border-[#EDEDED]">
                        <div className="flex flex-col h-[92px] w-full px-[37px] py-[14px] border-b border-[#ededed]">
                            <p className="text-[#101828] text-[18px] font-medium">General settings</p>
                            <p className="text-[#667085] text-[14px]">View and manage all your settings</p>
                        </div>
                        <div className="flex flex-col h-[77px] w-full px-[37px] py-[14px] leading-tight">
                            <p className="text-[#6A6C6E] text-[14px]">Full Name</p>
                            <p className="text-[#141415] text-[16px] font-medium">{userProfile.firstName} {userProfile.lastName}</p>
                        </div>

                    </div>

                    <div className="flex-col flex w-full h-auto rounded-[24px] border-[1px] border-[#EDEDED]">
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
                    <div className="flex-col flex w-full h-auto rounded-[24px] border-[1px] border-[#EDEDED]">
                        <div className="flex flex-col h-[92px] w-full px-[37px] py-[14px] border-b border-[#ededed]">
                            <p className="text-[#101828] text-[18px] font-medium">Notifications</p>
                            <p className="text-[#667085] text-[14px]">Notification preference</p>
                        </div>
                        <div className="flex justify-between items-center h-[77px] w-full px-[37px] py-[14px] leading-tight">
                            <div className="flex flex-col">
                                <p className="text-[#6A6C6E] text-[14px]">Email</p>
                                <p className="text-[#141415] text-[16px] font-medium">{userProfile.email}</p>
                            </div>
                            <div className="flex w-[72px] justify-end cursor-pointer p-[4px] items-center rounded-[24px] bg-[#C6EB5F] h-[40px]">
                                <div className="w-[32px] bg-white h-[32px] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

interface InputFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    optional?: boolean;
    type?: string;
}

const InputField = ({
                        id,
                        label,
                        value,
                        onChange,
                        placeholder,
                        optional = false,
                        type = 'text',
                    }: InputFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative w-full flex flex-col">
            <label
                htmlFor={id}
                className={`absolute left-4 transition-all ${
                    isFocused || value
                        ? 'text-[#6D6D6D] text-[12px] font-medium top-[6px]'
                        : 'hidden'
                }`}
            >
                {label} {optional && <span className="text-[#B0B0B0]">(optional)</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={!isFocused && !value ? placeholder : ''}
                className={`px-4 h-[58px] w-full border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] ${
                    isFocused || value
                        ? 'pt-[14px] pb-[4px] text-[#121212] text-[14px] font-medium'
                        : 'text-[#BDBDBD] text-[16px] font-medium'
                }`}
            />
        </div>
    );
};

const AddAdminModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: keyof typeof formData) => (value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/add-admin`,
                formData
            );
            if (response.status >= 200 && response.status < 300) {
                setSuccess('Admin added successfully!');
                setFormData({ email: '', firstName: '', lastName: '', password: '' });
                setTimeout(() => {
                    setSuccess(null);
                    onClose();
                }, 2000);
            } else {
                throw new Error('Failed to add admin');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add admin');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white w-[1100px] h-[600px] px-[300px] pt-[90px] shadow-lg relative">
                <div className="flex flex-col gap-[10px] mb-[40px]">
                    <p className="text-[16px] font-semibold text-[#101828]">New admin role</p>
                    <p className="text-[14px] text-[#667085]">Add a new admin role</p>
                </div>

                <div className="flex flex-col gap-[12px]">
                    <InputField
                        id="email"
                        label="Email"
                        value={formData.email}
                        onChange={handleChange('email')}
                        placeholder="Email"
                    />
                    <InputField
                        id="firstName"
                        label="First name"
                        value={formData.firstName}
                        onChange={handleChange('firstName')}
                        placeholder="First name"
                    />
                    <InputField
                        id="lastName"
                        label="Last name"
                        value={formData.lastName}
                        onChange={handleChange('lastName')}
                        placeholder="Last name"
                    />
                    <InputField
                        id="password"
                        label="Password"
                        value={formData.password}
                        onChange={handleChange('password')}
                        placeholder="Password"
                        type="password"
                    />
                </div>

                {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
                {success && <div className="mt-4 text-green-500 text-sm">{success}</div>}

                <div
                    onClick={handleSubmit}
                    className={`mt-6 w-full bg-[#022B23] gap-[9px] h-[52px] flex items-center justify-center text-[14px] text-[#C6EB5F] font-semibold font-medium rounded-[14px] ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#014f41]'
                    }`}
                >
                    <p>{isSubmitting ? 'Adding...' : 'Add new admin'}</p>
                    <Image src={limeArrow} alt="arrow" />
                </div>
            </div>
        </div>
    );
};

const RolesTab = () => {
    const [showModal, setShowModal] = useState(false);
    const [admins, setAdmins] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                setLoading(true);
                const response = await axios.get<UserResponse[]>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/adminAll`
                );
                setAdmins(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch admins');
            } finally {
                setLoading(false);
            }
        };

        fetchAdmins();
    }, []);

    const handleDeleteAdmin = async (id: number) => {
        setDeleteError(null);
        setDeleteSuccess(null);

        try {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/delete-user?id=${id}`
            );
            if (response.status >= 200 && response.status < 300) {
                setAdmins((prev) => prev.filter((admin) => admin.id !== id));
                setDeleteSuccess('Admin removed successfully!');
                setTimeout(() => setDeleteSuccess(null), 2000);
            } else {
                throw new Error('Failed to delete admin');
            }
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete admin');
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <UsersTableSkeleton />
            </div>
        );
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
    }

    return (
        <>
            <AddAdminModal isOpen={showModal} onClose={() => setShowModal(false)} />
            <div className="flex gap-[20px]">
                <div
                    className={`w-[25%] flex items-center text-[#022B23] text-[12px] font-medium h-[40px] px-[8px] bg-[#f8f8f8] rounded-[12px] border border-[#eeeeee]`}
                >
                    <p>Admin roles</p>
                </div>
                <div className="w-[75%] rounded-[24px] border border-[#ededed]">
                    <div className="flex flex-col h-[92px] w-full px-[37px] py-[14px] border-b border-[#ededed]">
                        <p className="text-[#101828] text-[18px] font-medium">Team ({admins.length})</p>
                        <p className="text-[#667085] text-[14px]">View and manage your team</p>
                    </div>

                    {deleteError && <div className="px-[15px] py-2 text-red-500 text-sm">{deleteError}</div>}
                    {deleteSuccess && (
                        <div className="px-[15px] py-2 text-green-500 text-sm">{deleteSuccess}</div>
                    )}

                    {admins.length === 0 ? (
                        <div className="flex justify-center items-center h-[200px] text-[#667085] text-[16px]">
                            No admins
                        </div>
                    ) : (
                        <div className="flex flex-col mb-[28px] mt-[30px] gap-[8px]">
                            {admins.map((admin) => (
                                <div
                                    key={admin.id}
                                    className="flex justify-between items-center h-[62px] w-full pl-[15px] pr-[30px] py-[14px] leading-tight"
                                >
                                    <div className="flex gap-[8px] items-center">
                                        <Image src={settingUser} alt="user" />
                                        <div className="flex flex-col">
                                            <p className="text-[#101828] font-medium text-[14px]">
                                                {admin.firstName} {admin.lastName}
                                            </p>
                                            <p className="text-[#667085] text-[16px]">{admin.email}</p>
                                            <span className="w-[51px] text-[#022B23] text-[12px] font-medium py-[2px] px-[8px] bg-[#F9FDE8] rounded-[16px] flex justify-center items-center h-[22px]">
                        Admin
                      </span>
                                        </div>
                                    </div>
                                    <div
                                        className="flex cursor-pointer hover:shadow-sm justify-center text-[#023047] text-[14px] items-center rounded-[8px] w-[86px] h-[40px] border-[1px] border-[#D0D5DD]"
                                        onClick={() => handleDeleteAdmin(admin.id)}
                                    >
                                        <p>Remove</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => setShowModal(true)}
                        className="w-[156px] h-[40px] mb-[15px] rounded-[8px] ml-[15px] cursor-pointer hover:shadow-sm text-[#023047] font-medium text-[14px] px-[16px] py-[10px] border border-[#D0D5DD]"
                    >
                        Add team member
                    </button>
                </div>
            </div>
        </>
    );
};

const AdminSettingsClient = () => {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') as 'general' | 'roles' || 'general';
    const [activeTab, setActiveTab] = useState<'general' | 'roles'>(initialTab);
    const router = useRouter();

    const handleTabChange = (tab: 'general' | 'roles') => {
        setActiveTab(tab);
        router.replace(`/admin/dashboard/settings?tab=${tab}`, { scroll: false });
    };

    return (
        <>
            <div className="text-[#022B23] text-[14px] px-[20px] font-medium gap-[8px] flex items-center h-[49px] w-full border-b-[0.5px] border-[#ededed]">
                <p>Settings</p>
            </div>
            <div className="text-[#1E1E1E] text-[14px] px-[20px] font-medium gap-[8px] flex items-center h-[49px] w-full border-b-[0.5px] border-[#ededed]">
                <p>Manage the admin dashboard</p>
            </div>
            <div className="flex flex-col">
                <div className="flex border-b border-[#ededed] mb-6 px-[20px]">
                    <div className="w-[403px] h-[52px] gap-[24px] flex items-end">
                        <p
                            className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${activeTab === 'general' ? 'font-medium border-b-2 border-[#000000]' : 'text-[#707070]'}`}
                            onClick={() => handleTabChange('general')}
                        >
                            General settings
                        </p>
                        <p
                            className={`py-2 text-[#11151F] cursor-pointer text-[14px] ${activeTab === 'roles' ? 'font-medium border-b-2 border-[#000000]' : 'text-[#707070]'}`}
                            onClick={() => handleTabChange('roles')}
                        >
                            Roles
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg mx-[20px] mb-8">
                    {activeTab === 'general' && <GeneralTab />}
                    {activeTab === 'roles' && <RolesTab />}
                </div>
            </div>
        </>
    );
};

export default AdminSettingsClient;