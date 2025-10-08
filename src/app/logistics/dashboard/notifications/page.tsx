'use client'
import LogisticsCompanyGuard from "@/components/LogisticsCompanyGuard";
import DashboardHeader from "@/components/dashboardHeader";
import LogisticsDashboardOptions from "@/components/logisticsDashboardOptions";
import Image from "next/image";
import iPhone from "../../../../../public/assets/images/blue14.png";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { SkeletonLoader } from "@/components/LoadingSkeletons";

interface Notification {
    id: number;
    title: string;
    message: string;
    email: string;
    type: string;
    createdAt: string;
}

const Notifications = () => {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const notificationsPerPage = 6;

    const fetchNotifications = useCallback(async () => {
        if (session?.user?.email) {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/notification/getUserAll?email=${session.user.email}`
                );
                if (Array.isArray(response.data)) {
                    // Sort notifications by createdAt in descending order (newest first)
                    const sortedNotifications = [...response.data].sort((a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    setNotifications(sortedNotifications);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [session?.user?.email]);

    // Calculate current notifications to display
    const indexOfLastNotification = currentPage * notificationsPerPage;
    const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
    const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
    const totalPages = Math.ceil(notifications.length / notificationsPerPage);

    const clearNotifications = async () => {
        if (session?.user?.email && notifications.length > 0) {
            try {
                await axios.delete(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/notification/deleteAllUser?email=${session.user.email}`
                );
                fetchNotifications();
            } catch (error) {
                console.error('Error deleting notifications:', error);
            }
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Set up polling every 5 seconds
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const getNotificationIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'info':
                return '✅';
            case 'delay':
                return '⚠️';
            case 'delivered':
                return '✅';
            case 'system':
                return '🔄';
            default:
                return '🔔';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options).replace(',', ' //');
    };

    return (
        <LogisticsCompanyGuard>
            <DashboardHeader />
            <LogisticsDashboardOptions />
            <div className="flex px-4 md:px-8 lg:px-25 mt-[30px] gap-[40px] flex-col md:flex-row">
                <div className="flex flex-col gap-[14px]">
                    <div className="flex flex-col">
                        <p className="text-[18px] font-medium text-[#101828]">All Notifications ({notifications.length})</p>
                        <p className="text-[#667085] text-[14px]">View all your notifications here</p>
                    </div>
                    {notifications.length > 0 && (
                        <p
                            className="text-[#667085] text-[14px] underline cursor-pointer"
                            onClick={clearNotifications}
                        >
                            Clear all notifications
                        </p>
                    )}
                </div>

                <div className="flex flex-col w-full md:w-[645px]">
                    {isLoading ? (
                        <div className="w-full">
                            <SkeletonLoader type="card" count={6} />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex items-center justify-center w-full">
                            <p>No notifications found</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-[8px] mb-4 w-full">
                                {currentNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="flex px-[20px] rounded-[14px] py-[15px] h-auto w-full flex-col bg-[#F9F9F9] border-[0.5px] border-[#EDEDED]"
                                    >
                                        <div className="flex flex-col">
                                            <p className="text-[#101828] text-[14px] font-semibold">
                                                {getNotificationIcon(notification.type)} {notification.title}
                                            </p>
                                            <p className="text-[#667085] text-[12px] mt-[4px]">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <p className="mt-[10px] text-[10px] text-[#667085]">
                                            {formatDate(notification.createdAt)}
                                        </p>

                                        {notification.type.toLowerCase().includes('order') && (
                                            <>
                                                <div className="w-full md:w-[550px] gap-[12px] flex items-center mt-[20px] bg-white h-[72px] rounded-[14px] border-[1px] border-[#EAECF0]">
                                                    <div className="bg-[#f9f9f9] h-full w-[70px] overflow-hidden rounded-bl-[14px] rounded-tl-[14px]">
                                                        <Image
                                                            src={iPhone}
                                                            alt={'product image'}
                                                            width={70}
                                                            height={70}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="text-[14px] text-[#101828] font-medium">Product Name</p>
                                                        <p className="text-[14px] text-[#667085]">ID: #{notification.id.toString().padStart(13, '0')}</p>
                                                    </div>
                                                </div>
                                                <p className="text-[12px] mt-[15px] mb-[8px] text-[#022B23] font-medium">
                                                    Track order
                                                </p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination controls */}
                            {notifications.length > notificationsPerPage && (
                                <div className="flex justify-center mt-4 mb-10 w-full">
                                    <div className="flex items-center gap-25">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#022B23] text-white hover:bg-[#033a30]'}`}
                                        >
                                            Previous
                                        </button>
                                        <div className="flex gap-[2px] items-center">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-[#022B23] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#022B23] text-white hover:bg-[#033a30]'}`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </LogisticsCompanyGuard>
    );
};

export default Notifications;