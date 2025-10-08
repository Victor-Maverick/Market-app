'use client';
import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
    OverviewIcon,
    MarketsIcon,
    VendorsIcon,
    LogisticsIcon,
    UsersIcon,
    TransactionsIcon,
    AdsIcon,
    DisputeIcon,
    NotificationsIcon,
    SettingsIcon,
} from "./../icons";
import { useSession } from "next-auth/react";
import { useLogoutHandler } from "@/hooks/useLogoutHandler";
import axios from "axios";
// import { NotificationBadgeSkeleton } from '../LoadingSkeletons';

interface SidebarProps {
    className?: string;
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    badge?: string;
    href: string;
    isActive: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, badge, href, isActive, onClick }) => {
    return (
        <Link
            href={href}
            className={`flex items-center text-[#171719] text-sm cursor-pointer px-2 py-2.5 relative hover:bg-gray-50 rounded-md transition-colors ${isActive ? 'text-[#00AA5B] font-medium bg-green-50' : ''}`}
            onClick={onClick}
        >
            {isActive && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-5 bg-[#00AA5B] rounded-r"></div>
            )}
            <div className="mr-1.5 flex-shrink-0">{icon}</div>
            <span className="grow text-[12px] md:text-sm truncate">{label}</span>
            {badge && (
                <div className="text-white text-[8px] font-bold bg-[#FF5050] px-1.5 py-[3px] rounded-[10px] flex-shrink-0">
                    {badge}
                </div>
            )}
        </Link>
    );
};

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [name, setName] = useState('');
    const { data: session } = useSession();
    const [notificationCount, setNotificationCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (session?.user?.email) {
            try {
                const response = await axios.get(
                    `https://digitalmarket.benuestate.gov.ng/api/notification/getUserAllUnRead?email=${session.user.email}`
                );
                if (Array.isArray(response.data)) {
                    setNotificationCount(response.data.length);
                }
                if (session.user.firstName) {
                    setName(session.user.firstName);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        }
    }, [session?.user?.email, session?.user?.firstName]);

    const markNotificationsAsRead = useCallback(async () => {
        if (session?.user?.email) {
            try {
                await axios.put(
                    `https://digitalmarket.benuestate.gov.ng/api/notification/readAllNotification?email=${session.user.email}`
                );
                fetchNotifications();
            } catch (error) {
                console.error('Error marking notifications as read:', error);
            }
        }
    }, [session?.user?.email, fetchNotifications]);

    // Fetch notifications periodically
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleNotificationClick = useCallback(() => {
        markNotificationsAsRead();
        router.push('/admin/dashboard/notifications');
    }, [markNotificationsAsRead, router]);

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/admin/dashboard') {
            return true;
        }
        return pathname === `/admin/dashboard${path}`;
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const { handleLogout } = useLogoutHandler();

    return (
        <div
            className={`w-[280px] md:w-[298px] max-h-screen flex flex-col justify-between bg-[#FFFFFF] py-[6px] border-r-[#E5E5E5] border-r-[0.5px] ${className}`}
        >
            <div className="flex flex-col gap-[10px] px-6 md:px-10 py-0 overflow-y-auto scrollbar-hide">
                <div>
                    <NavItem
                        icon={<OverviewIcon />}
                        label="Overview"
                        href="/admin/dashboard/main"
                        isActive={isActive('/')}
                    />
                </div>
                <div className="border-[#E7E7E7] border-t border-solid">
                    <NavItem
                        icon={<MarketsIcon />}
                        label="Markets"
                        href="/admin/dashboard/markets"
                        isActive={isActive('/markets')}
                    />
                    <NavItem
                        icon={<VendorsIcon />}
                        label="Vendors"
                        href="/admin/dashboard/vendors"
                        isActive={isActive('/vendors')}
                    />
                    <NavItem
                        icon={<LogisticsIcon />}
                        label="Logistics partners"
                        href="/admin/dashboard/logistics"
                        isActive={isActive('/logistics')}
                    />
                </div>
                <div className="border-[#E7E7E7] border-t border-solid">
                    <NavItem
                        icon={<UsersIcon />}
                        label="Users (customers)"
                        href="/admin/dashboard/users"
                        isActive={isActive('/users')}
                    />
                </div>
                <div className="border-[#E7E7E7] border-t border-solid">
                    <NavItem
                        icon={<TransactionsIcon />}
                        label="Transactions"
                        href="/admin/dashboard/transactions"
                        isActive={isActive('/transactions')}
                    />
                    <NavItem
                        icon={<AdsIcon />}
                        label="Ads and promotions"
                        href="/admin/dashboard/ads"
                        isActive={isActive('/ads')}
                    />
                </div>
                <div className="border-[#E7E7E7] border-t border-solid">
                    <NavItem
                        icon={<DisputeIcon />}
                        label="Dispute support"
                        href="/admin/dashboard/disputes"
                        isActive={isActive('/disputes')}
                    />
                </div>
                <div className="border-[#E7E7E7] border-t border-solid">
                    <NavItem
                        icon={<NotificationsIcon />}
                        label="Notifications"
                        badge={notificationCount > 0 ? (notificationCount > 9 ? '9+' : notificationCount.toString()) : undefined}
                        href="/admin/dashboard/notifications"
                        isActive={isActive('/notifications')}
                        onClick={handleNotificationClick}
                    />
                    <NavItem
                        icon={<SettingsIcon />}
                        label="Settings"
                        href="/admin/dashboard/settings"
                        isActive={isActive('/settings')}
                    />
                </div>
            </div>

            <div className="flex items-center justify-center relative" ref={dropdownRef}>
                <div
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-[170px] md:w-[186px] cursor-pointer px-[8px] py-[10px] h-[65px] rounded-[12px] border-[0.5px] border-[#EDEDED] flex items-center justify-between mx-auto"
                >
                    <div className="flex items-center gap-[8px]">
                        <div className="w-[28px] h-[28px] rounded-full bg-[#F2F2F2]"></div>
                        <div className="flex flex-col">
                            <p className="text-[#1E1E1E] text-[14px] font-medium">{name}</p>
                            <div className="w-fit px-[6px] h-[18px] text-[8px] text-[#52A43E] bg-[#D5FFE8] rounded-[100px] flex items-center justify-center">
                                Super admin
                            </div>
                        </div>
                    </div>
                    <ChevronDown size={16} />
                </div>

                {dropdownOpen && (
                    <div className="absolute bottom-[65px] w-[170px] md:w-[186px] bg-white border border-[#EDEDED] rounded-[12px] shadow-lg z-50">
                        <button
                            className="w-full text-left px-[12px] py-[10px] text-[14px] text-[#FF4D4F] hover:bg-[#FFF0F0] rounded-[12px]"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}