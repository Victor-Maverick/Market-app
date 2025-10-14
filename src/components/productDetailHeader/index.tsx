'use client'
import profileImage from '../../../public/assets/images/profile-circle.png';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import headerImg from "../../../public/assets/images/headerImg.png";
import { useSession } from "next-auth/react";
import { useLogoutHandler } from "@/hooks/useLogoutHandler";

const ProductDetailHeader = () => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    const userProfile = session?.user ? {
        firstName: session.user.firstName,
        roles: session.user.roles || []
    } : null;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (isProfileDropdownOpen && !target.closest('.profile-dropdown-container')) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileDropdownOpen]);

    const handleLogoClick = () => {
        router.push("/");
    };

    const handleProfileClick = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const navigateToDashboard = () => {
        if (!userProfile?.roles) return;

        const roles = userProfile.roles;
        if (roles.includes('VENDOR') && roles.includes('BUYER')) {
            router.push('/vendor/dashboard');
        }
        else if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
            router.push('/admin/dashboard/main');
        }
        else if (roles.includes('LOGISTICS')) {
            router.push('/logistics/dashboard');
        } else {
            router.push('/buyer/orders');
        }
        setIsProfileDropdownOpen(false);
    };

    const navigateToProfile = () => {
        router.push('/profile');
        setIsProfileDropdownOpen(false);
    };

    const { handleLogout } = useLogoutHandler();

    return (
        <div className="flex justify-between items-center h-[78px] px-4 sm:px-6 lg:px-[100px] py-[18px] bg-white shadow-sm">
            <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
                <Image
                    src={headerImg}
                    alt="FarmGo Logo"
                    width={50}
                    height={50}
                    className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] md:w-[50px] md:h-[50px]"
                />
                <p className="text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] font-semibold text-black leading-tight">
                    Farm<span style={{ color: "#c6eb5f" }}>Go</span> <br />
                    <span className="block">Benue</span>
                </p>
            </div>

            {status === 'authenticated' && userProfile ? (
                <div className="relative profile-dropdown-container">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={handleProfileClick}
                    >
                        <Image
                            src={profileImage}
                            alt="Profile"
                            width={28}
                            height={28}
                            className="rounded-full w-[24px] h-[24px] sm:w-[28px] sm:h-[28px]"
                        />
                        <p className="text-xs sm:text-sm font-medium text-black hidden sm:block">
                            Hey, <span className="font-semibold">{userProfile.firstName}</span>
                        </p>
                    </div>

                    {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                            <button
                                onClick={navigateToDashboard}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={navigateToProfile}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default ProductDetailHeader;