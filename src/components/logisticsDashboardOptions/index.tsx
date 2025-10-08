'use client'
import { useState, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import shadow from "../../../public/assets/images/shadow.png";
import dashboardImage from "../../../public/assets/images/dashboardImage.png";
import shopImg from "../../../public/assets/images/shop-image.svg";
import transactionImg from "../../../public/assets/images/receipt-discount.svg";
import starImg from "../../../public/assets/images/star.svg";
import notificationImg from "../../../public/assets/images/notification-bing.png";
import settingImg from "../../../public/assets/images/settingImg.png";
import menuIcon from '../../../public/assets/images/orderImg.png';
import closeIcon from '../../../public/assets/images/settingImg.png';

type MenuOption =
    | 'dashboard'
    | 'fleet'
    | 'transaction'
    | 'reviews'
    | 'notifications'
    | 'settings';

interface DashboardOptionsProps {
    initialSelected?: MenuOption;
}

const LogisticsDashboardOptions = ({
                                       initialSelected = 'dashboard',
                                   }: DashboardOptionsProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [selectedOption, setSelectedOption] = useState<MenuOption>(initialSelected);
    const [indicatorPosition, setIndicatorPosition] = useState({ left: 0, width: 0 });
    const [notificationCount, setNotificationCount] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Check if mobile view
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const routeToOption = useMemo(
        () => ({
            '/logistics/dashboard/main': 'dashboard',
            '/logistics/dashboard/fleet': 'fleet',
            '/logistics/dashboard/transactions': 'transaction',
            '/logistics/dashboard/reviews': 'reviews',
            '/logistics/dashboard/notifications': 'notifications',
            '/logistics/dashboard/settings': 'settings',
        }),
        []
    );

    // Update selected option based on pathname
    useEffect(() => {
        const matchedOption = Object.entries(routeToOption)
            .sort(([a], [b]) => b.length - a.length)
            .find(([route]) => pathname.startsWith(route))?.[1] || 'dashboard';
        setSelectedOption(matchedOption as MenuOption);
    }, [pathname, routeToOption]);

    // Fetch notifications periodically
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => {
            fetchNotifications();
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const getRouteForOption = (option: MenuOption): string => {
        const routeMap: Record<MenuOption, string> = {
            dashboard: '/logistics/dashboard/main',
            fleet: '/logistics/dashboard/fleet',
            transaction: '/logistics/dashboard/transactions',
            reviews: '/logistics/dashboard/reviews',
            notifications: '/logistics/dashboard/notifications',
            settings: '/logistics/dashboard/settings',
        };
        return routeMap[option];
    };

    const handleOptionClick = useCallback(async (option: MenuOption, isNotification?: boolean) => {
        if (isNotification) {
            markNotificationsAsRead();
        }
        setSelectedOption(option);
        router.push(getRouteForOption(option));
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    }, [markNotificationsAsRead, router, isMobile]);

    const menuItems = useMemo(() => [
        { id: 'dashboard', icon: dashboardImage, label: 'Dashboard', widthClass: 'w-[116px]' },
        { id: 'fleet', icon: shopImg, label: 'Fleet', widthClass: 'w-[77px]' },
        { id: 'transaction', icon: transactionImg, label: 'Transactions', widthClass: 'w-[127px]' },
        { id: 'reviews', icon: starImg, label: 'Reviews and Ratings', widthClass: 'w-[163px]' },
        {
            id: 'notifications',
            icon: notificationImg,
            label: 'Notifications',
            widthClass: 'w-[154px]',
            notifications: notificationCount > 0 ? (notificationCount > 9 ? '9+' : notificationCount.toString()) : undefined,
            isNotification: true,
        },
        { id: 'settings', icon: settingImg, label: 'Settings', widthClass: 'w-[97px]' },
    ], [notificationCount]);

    const updateIndicatorPosition = useCallback((element: HTMLElement | null) => {
        if (element) {
            setIndicatorPosition({
                left: element.offsetLeft,
                width: element.offsetWidth,
            });
        }
    }, []);

    useLayoutEffect(() => {
        if (!isMobile) {
            const selectedElement = document.getElementById(`menu-item-${selectedOption}`);
            if (selectedElement) {
                updateIndicatorPosition(selectedElement);
            } else {
                const timeout = setTimeout(() => {
                    const retryElement = document.getElementById(`menu-item-${selectedOption}`);
                    updateIndicatorPosition(retryElement);
                }, 100);
                return () => clearTimeout(timeout);
            }
        }
    }, [selectedOption, menuItems, updateIndicatorPosition, isMobile]);

    // Mobile menu toggle
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    if (isMobile) {
        return (
            <>
                {/* Mobile Hamburger Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
                >
                    <Image
                        src={mobileMenuOpen ? closeIcon : menuIcon}
                        alt="menu"
                        width={24}
                        height={24}
                    />
                </button>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-white pt-16 pl-4">
                        <div className="flex flex-col space-y-4">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`
                                        flex items-center gap-3 p-3 rounded-lg
                                        ${selectedOption === item.id ? 'bg-[#ECFDF6] font-medium' : ''}
                                    `}
                                    onClick={() => handleOptionClick(item.id as MenuOption, item.isNotification)}
                                >
                                    <Image
                                        src={item.icon}
                                        alt={`${item.label} icon`}
                                        width={20}
                                        height={20}
                                        className="w-5 h-5"
                                    />
                                    <span className="text-sm">{item.label}</span>
                                    {item.notifications && (
                                        <span className="ml-auto bg-[#FF5050] text-white text-xs px-2 py-1 rounded-full">
                                            {item.notifications}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mobile Top Bar (shows current selection) */}
                <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-center z-30">
                    <div className="flex items-center gap-2">
                        <Image
                            src={menuItems.find(item => item.id === selectedOption)?.icon || dashboardImage}
                            alt=""
                            width={20}
                            height={20}
                            className="w-5 h-5"
                        />
                        <span className="font-medium text-sm">
                            {menuItems.find(item => item.id === selectedOption)?.label}
                        </span>
                    </div>
                </div>
            </>
        );
    }

    // Desktop View
    return (
        <div className="relative w-full">
            <div
                className="h-[60px] sm:h-[70px] border-b-[1px] border-[#EDEDED] px-4 sm:px-6 lg:px-25 py-2 sm:py-[10px] w-full flex items-center gap-2 sm:gap-3 lg:gap-[14px] relative overflow-x-auto scrollbar-hide"
                style={{
                    backgroundImage: `url(${shadow.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
            >
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        id={`menu-item-${item.id}`}
                        type="button"
                        className={`
                            text-[#171719] text-[12px] sm:text-[13px] lg:text-[14px] h-[36px] sm:h-[40px] flex items-center gap-1 sm:gap-[4px] lg:gap-[6px] cursor-pointer
                            px-2 sm:px-3 lg:px-4 rounded-md sm:rounded-lg
                            hover:bg-gray-50 transition-colors duration-200
                            relative flex-shrink-0
                            ${selectedOption === item.id ? 'font-bold bg-gray-50' : ''}
                        `}
                        onClick={(e) => {
                            handleOptionClick(item.id as MenuOption, item.isNotification);
                            updateIndicatorPosition(e.currentTarget);
                        }}
                    >
                        <Image
                            src={item.icon}
                            alt={`${item.label} icon`}
                            width={14}
                            height={14}
                            className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] lg:w-[16px] lg:h-[16px] flex-shrink-0"
                        />
                        <span className="whitespace-nowrap hidden sm:inline">{item.label}</span>
                        <span className="whitespace-nowrap sm:hidden text-[10px]">
                            {item.label === 'Reviews and Ratings' ? 'Reviews' : item.label}
                        </span>

                        {item.notifications && (
                            <span className="text-[#ffffff] p-[2px] sm:p-[3px] bg-[#FF5050] flex justify-center items-center rounded-[8px] sm:rounded-[10px] w-[16px] h-[14px] sm:w-[22px] sm:h-[18px] text-[12px] sm:text-[14px]">
                                <span className="text-[6px] sm:text-[8px] font-semibold">{item.notifications}</span>
                            </span>
                        )}
                    </button>
                ))}
            </div>
            <div
                className="absolute bottom-0 h-[2px] bg-[#022B23] transition-all duration-300 hidden sm:block"
                style={{
                    left: `${indicatorPosition.left}px`,
                    width: `${indicatorPosition.width}px`,
                }}
            />
        </div>
    );
};

export default LogisticsDashboardOptions;