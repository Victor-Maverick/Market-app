'use client'
import profileImage from '../../../public/assets/images/profile-circle.png';
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSmartNavigation } from "@/utils/navigationUtils";

import headerImg from "../../../public/assets/images/headerImg.png";
import { useSession } from "next-auth/react";
import { useLogoutHandler } from "@/hooks/useLogoutHandler";


const DashboardHeader = () => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const { smartNavigate } = useSmartNavigation();
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

    const handleProfileClick = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const { handleLogout } = useLogoutHandler();

    const handleLogoClick = () => {
        smartNavigate("/", "Loading home page...");
    };

    return (
        <div className="flex justify-between items-center h-[55px] sm:h-[65px] lg:h-[78px] px-3 sm:px-6 lg:px-[100px] py-2 sm:py-3 lg:py-[18px] bg-white shadow-sm">
            <div onClick={handleLogoClick} className="flex items-center gap-1 sm:gap-2 cursor-pointer">
                <Image
                    src={headerImg}
                    alt="FarmGo Logo"
                    width={40}
                    height={40}
                    className="w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] md:w-[40px] md:h-[40px] lg:w-[50px] lg:h-[50px]"
                />
                <p className="text-[10px] sm:text-[12px] md:text-[14px] lg:text-[18px] font-semibold text-black leading-tight">
                    Farm<span style={{ color: "#c6eb5f" }}>Go</span> <br />
                    <span className="block">Benue</span>
                </p>
            </div>

            {status === 'authenticated' && userProfile && (
                <div className="flex items-center gap-3">
                    <div className="relative profile-dropdown-container">
                        <div
                            className="flex items-center gap-1 sm:gap-2 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={handleProfileClick}
                        >
                        <Image
                            src={profileImage}
                            alt="Profile"
                            width={24}
                            height={24}
                            className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px] lg:w-[28px] lg:h-[28px] rounded-full"
                        />
                        <div className="hidden sm:block">
                            <p className="text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] text-[#171719] font-medium">
                                Hey, <span className="font-semibold">{userProfile.firstName}</span>
                            </p>
                        </div>
                        <div className="sm:hidden">
                            <p className="text-[10px] text-[#171719] font-medium">
                                <span className="font-semibold">{userProfile.firstName}</span>
                            </p>
                        </div>
                        {/* Dropdown arrow */}
                        <svg
                            className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    {isProfileDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 w-32 sm:w-40 md:w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardHeader;