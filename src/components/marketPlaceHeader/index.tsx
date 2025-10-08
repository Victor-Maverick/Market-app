'use client';
import Image, { StaticImageData } from "next/image";
import notificationImg from "../../../public/assets/images/notification-bing.png";
import routing from "../../../public/assets/images/routing.png";
import bag from "../../../public/assets/images/bag.png";
import profileImg from '@/../public/assets/images/profile-circle.png';
import wishListImg from '@/../public/assets/images/heart.png';
import farmGoLogo from "../../../public/assets/images/farmGoLogo.png";
import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import React from "react";
import { useSession } from "next-auth/react";
import { useLogoutHandler } from "@/hooks/useLogoutHandler";
import { FiMenu, FiX } from "react-icons/fi";
import axios from "axios";

interface HeaderItem {
    img: StaticImageData;
    text: string;
    path: string;
    showBadge?: boolean;
    badgeCount?: number;
    isNotification?: boolean;
}

const MarketPlaceHeader = () => {
    const pathname = usePathname();
    const [notificationCount, setNotificationCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    const userProfile = session?.user ? {
        firstName: session.user.firstName,
        roles: session.user.roles || []
    } : null;

    const fetchNotifications = useCallback(async () => {
        if (session?.user?.email) {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/notification/getUserAllUnRead?email=${session.user.email}`
                );
                if (Array.isArray(response.data)) {
                    setNotificationCount(response.data.length);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        }
    }, [session?.user?.email]);

    const markNotificationsAsRead = useCallback(async () => {
        if (session?.user?.email) {
            try {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/notification/readAllNotification?email=${session.user.email}`
                );
                fetchNotifications();
            } catch (error) {
                console.error('Error marking notifications as read:', error);
            }
        }
    }, [session?.user?.email, fetchNotifications]);

    const handleProfileClick = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const navigateToDashboard = () => {
        if (!userProfile?.roles) return;

        const roles = userProfile.roles;
        if (roles.includes('VENDOR') && roles.includes('BUYER')) {
            router.push('/vendor/dashboard');
        }
        else if (roles.includes('ADMIN')) {
            router.push('/admin/dashboard/main');
        }
        else if (roles.includes('LOGISTICS')) {
            router.push('/logistics/dashboard/main');
        } else {
            router.push('/buyer/orders');
        }
        setIsProfileDropdownOpen(false);
        setIsMobileMenuOpen(false);
    };

    const { handleLogout } = useLogoutHandler();

    const handleNavigation = useCallback((path: string, isNotification?: boolean) => {
        if (isNotification) {
            markNotificationsAsRead();
            // Route based on user role for notifications
            const roles = userProfile?.roles || [];
            if (roles.includes('ADMIN')) {
                router.push('/admin/dashboard/notifications');
            } else {
                router.push('/buyer/notifications');
            }
            setIsMobileMenuOpen(false);
            return;
        }
        setIsMobileMenuOpen(false);
        if (pathname !== path) {
            router.push(path);
        }
    }, [markNotificationsAsRead, pathname, router, userProfile?.roles]);

    // Fetch notifications on component mount and periodically
    React.useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Fetch every 30 seconds
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Only show these items if user is logged in
    const loggedInHeaderItems: HeaderItem[] = [
        { img: wishListImg, text: "Wishlist", path: "/buyer/wishlist" },
        { img: routing, text: "Order", path: "/buyer/orders" },
        { img: bag, text: "Cart", path: "/cart" },
        {
            img: notificationImg,
            text: "Notifications",
            path: "/buyer/notifications",
            showBadge: true,
            badgeCount: notificationCount,
            isNotification: true
        },
    ];

    const isLoggedIn = status === 'authenticated';

    return (
        <header className="w-full bg-white shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-24">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Image
                            onClick={() => handleNavigation("/")}
                            src={farmGoLogo}
                            alt="FarmGo logo"
                            className="cursor-pointer h-8 w-auto md:h-10"
                            priority
                        />
                    </div>

                    {/* Desktop Navigation - Only shows if logged in */}
                    {isLoggedIn && (
                        <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
                            {loggedInHeaderItems.map(({ img, text, path, showBadge, badgeCount, isNotification }, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity relative group"
                                    onClick={() => handleNavigation(path, isNotification)}
                                >
                                    <div className="relative flex items-center">
                                        <Image
                                            src={img}
                                            alt={text}
                                            height={20}
                                            width={20}
                                            className="w-5 h-5"
                                        />
                                        {/* Only show badge if badgeCount exists and is greater than 0 */}
                                        {showBadge && badgeCount !== undefined && badgeCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-[#FF5050] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {badgeCount > 9 ? '9+' : badgeCount}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 group-hover:text-primary">
                                        {text}
                                    </span>
                                </div>
                            ))}

                            {/* Profile dropdown */}
                            <div className="relative">
                                <div
                                    className="flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={handleProfileClick}
                                >
                                    <Image
                                        src={profileImg}
                                        alt="Profile"
                                        height={20}
                                        width={20}
                                        className="w-5 h-5 rounded-full"
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                        Hey, {userProfile?.firstName}
                                    </span>
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
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </nav>
                    )}

                    {/* Mobile menu button - Only show if logged in */}
                    {isLoggedIn && (
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
                            >
                                {isMobileMenuOpen ? (
                                    <FiX className="h-6 w-6" />
                                ) : (
                                    <FiMenu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Navigation - Only show if logged in */}
            {isLoggedIn && isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {loggedInHeaderItems.map(({ img, text, path, showBadge, badgeCount, isNotification }, index) => (
                            <div
                                key={index}
                                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleNavigation(path, isNotification)}
                            >
                                <div className="relative mr-3">
                                    <Image
                                        src={img}
                                        alt={text}
                                        height={20}
                                        width={20}
                                        className="w-5 h-5"
                                    />
                                    {/* Only show badge if badgeCount exists and is greater than 0 */}
                                    {showBadge && badgeCount !== undefined && badgeCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-[#FF5050] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {badgeCount > 9 ? '9+' : badgeCount}
                                        </span>
                                    )}
                                </div>
                                {text}
                            </div>
                        ))}

                        {/* Mobile profile dropdown */}
                        <div className="px-3 py-2">
                            <div
                                className="flex items-center cursor-pointer"
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                            >
                                <Image
                                    src={profileImg}
                                    alt="Profile"
                                    height={20}
                                    width={20}
                                    className="w-5 h-5 rounded-full mr-3"
                                />
                                <span className="text-base font-medium text-gray-900">
                                    Hey, {userProfile?.firstName}
                                </span>
                            </div>

                            {isProfileDropdownOpen && (
                                <div className="mt-2 ml-8 bg-white rounded-md shadow-inner py-1 border border-gray-200">
                                    <button
                                        onClick={() => {
                                            navigateToDashboard();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Dashboard
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default MarketPlaceHeader;