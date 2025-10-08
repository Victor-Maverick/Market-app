'use client'
import Image from "next/image";
import arrowUp from "../../../../../public/assets/images/green arrow up.png";
import arrowDown from "../../../../../public/assets/images/arrow-down.svg";
import {useEffect, useRef, useState} from "react";

import BackButton from "@/components/BackButton";
import axios from 'axios';
import { UsersTableSkeleton, StatsCardsLoadingSkeleton } from "@/components/LoadingSkeletons";
import { userService } from "@/services/userService";
import LoadingSpinner from "@/components/LoadingSpinner";

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    roles: string[];
    createdAt: string;
    active: boolean;
}

const UserTableRow = ({
    user,
    isLast
                      }: {
    user: User;
    isLast: boolean;
    onDeleteUser: (userId: number) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [navigating, setNavigating] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleRowClick = () => {
        setNavigating(true);
        window.location.href = `/admin/dashboard/users/view-user/${encodeURIComponent(user.email)}`;
    };

    return (
        <>
            <div 
                className={`flex h-[72px] cursor-pointer hover:bg-[#F9FAFB] transition-colors ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}
                onClick={handleRowClick}
            >
                <div className="flex items-center w-[35%] pl-[24px]">
                    <div className="flex flex-col">
                        <p className="text-[14px] text-[#101828] font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-[12px] text-[#667085]">{user.email}</p>
                    </div>
                </div>

                <div className="flex flex-col justify-center w-[25%] px-[15px]">
                    <p className="text-[14px] text-[#101828]">{user.phone || 'None'}</p>
                </div>


                <div className="flex items-center w-[20%] justify-center">
                    <p className="text-[14px] font-medium text-[#101828]">
                        {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                </div>

                <div className="flex items-center w-[10%] px-[24px]">
                    <div className={`px-2 py-1 rounded-[8px] flex items-center justify-center ${
                        user.active
                            ? 'bg-[#ECFDF3] text-[#027A48]'
                            : 'bg-[#FEF3F2] text-[#FF5050]'
                    }`}>
                        <p className="text-[12px] font-medium">
                            {user.active ? 'Active' : 'Inactive'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center w-[10%] relative" ref={dropdownRef}>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                        className="cursor-pointer flex flex-col gap-[3px] items-center justify-center p-2"
                    >
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                        <div className="w-[3px] h-[3px] bg-[#98A2B3] rounded-full"></div>
                    </div>

                    {isOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg z-50 border border-[#ededed] w-[150px]">
                            <ul className="py-1">
                                <li 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsOpen(false);
                                        setNavigating(true);
                                        window.location.href = `/admin/dashboard/users/view-user/${encodeURIComponent(user.email)}`;
                                    }}
                                    className="px-4 py-2 text-[12px] hover:bg-[#ECFDF6] cursor-pointer flex items-center"
                                >
                                    {navigating ? (
                                        <>
                                            <LoadingSpinner size="sm" className="mr-2" />
                                            Loading...
                                        </>
                                    ) : (
                                        'View details'
                                    )}
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const Users = () => {

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/buyersAll`);
            setUsers(response.data);
            console.log("Users: ",response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    // Calculate stats from actual data
    const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(user => user.active).length,
        dailySignups: users.filter(user => {
            const today = new Date();
            const userDate = new Date(user.createdAt);
            return userDate.toDateString() === today.toDateString();
        }).length,
        inactiveUsers: users.filter(user => !user.active).length
    };

    const filteredUsers = users;

    // Calculate pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);


    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const result = await userService.deleteUser(userId);
            if (result.success) {
                alert('User deleted successfully');
                fetchUsers(); // Refresh the users list
            } else {
                alert(`Delete failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('An error occurred while deleting the user');
        }
    };

    return(
        <>
            <div className="text-[#022B23] text-[14px] px-4 sm:px-6 lg:px-[20px] font-medium gap-[8px] flex items-center h-[49px] w-full border-b-[0.5px] border-[#ededed]">
                <BackButton variant="minimal" />
                <p>User management</p>
            </div>
            <div className="p-4 sm:p-6 lg:p-[20px]">
                {loading ? (
                    <StatsCardsLoadingSkeleton cardCount={3} />
                ) : (
                    <div className="flex flex-col lg:flex-row w-full gap-4 lg:gap-[20px] lg:h-[110px] lg:justify-between">
                        <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#EAEAEA] border-[0.5px]">
                            <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#F7F7F7]">
                                <p className="text-[#707070] text-[12px] sm:text-[14px]">Total users</p>
                            </div>
                            <div className="flex-1 flex justify-center flex-col p-[14px]">
                                <p className="text-[18px] sm:text-[20px] text-[#022B23] font-medium">{stats.totalUsers.toLocaleString()}</p>
                                <div className="flex items-center">
                                    <Image src={arrowUp} width={12} height={12} alt={'image'} className="h-[12px] w-[12px]" />
                                    <p className="text-[10px] sm:text-[11px] text-[#707070] ml-1"><span className="text-[#52A43E]">+1.41</span> from yesterday</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#EAEAEA] border-[0.5px]">
                            <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#F7F7F7]">
                                <p className="text-[#707070] text-[12px] sm:text-[14px]">Active users</p>
                            </div>
                            <div className="flex-1 flex justify-center flex-col p-[14px]">
                                <p className="text-[18px] sm:text-[20px] text-[#022B23] font-medium">{stats.activeUsers.toLocaleString()}</p>
                                <div className="flex items-center">
                                    <Image src={arrowUp} width={12} height={12} alt={'image'} className="h-[12px] w-[12px]" />
                                    <p className="text-[10px] sm:text-[11px] text-[#707070] ml-1"><span className="text-[#52A43E]">+1.41</span> from yesterday</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#FF2121] border-[0.5px]">
                            <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#FFE8E8]">
                                <p className="text-[#FF5050] font-medium text-[12px] sm:text-[14px]">Inactive users</p>
                            </div>
                            <div className="flex-1 flex justify-center flex-col p-[14px]">
                                <p className="text-[18px] sm:text-[20px] text-[#022B23] font-medium">{stats.inactiveUsers.toLocaleString()}</p>
                                <div className="flex items-center">
                                    <Image src={arrowUp} width={12} height={12} alt={'image'} className="h-[12px] w-[12px]" />
                                    <p className="text-[10px] sm:text-[11px] text-[#707070] ml-1"><span className="text-[#52A43E]">+1.41</span> from yesterday</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col mt-[30px] sm:mt-[50px] rounded-[24px] border-[1px] border-[#EAECF0]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:pr-[20px] gap-4 sm:gap-0">
                        <div className="mx-0 sm:mx-[25px] flex flex-col">
                            <p className="text-[#101828] font-medium text-[16px] sm:text-[18px]">Users ({filteredUsers.length})</p>
                            <p className="text-[#667085] text-[12px] sm:text-[14px]">View and manage users here</p>
                        </div>

                    </div>

                    <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                        <div className="flex items-center px-[24px] w-[35%] py-[12px] gap-[4px]">
                            <p className="text-[#667085] font-medium text-[12px]">User</p>
                            <Image src={arrowDown} alt="Sort" width={12} height={12} />
                        </div>
                        <div className="flex items-center px-[24px] w-[25%] py-[12px] gap-[4px]">
                            <p className="text-[#667085] font-medium text-[12px]">Phone</p>
                            <Image src={arrowDown} alt="Sort" width={12} height={12} />
                        </div>
                        <div className="flex items-center justify-center w-[20%]">
                            <p className="text-[#667085] font-medium text-[12px]">Joined</p>
                        </div>

                        <div className="flex items-center px-[24px] w-[10%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Status</p>
                        </div>

                        <div className="flex items-center w-[10%] py-[12px]"></div>
                    </div>

                    <div className="flex flex-col">
                        {loading ? (
                            <UsersTableSkeleton />
                        ) : error ? (
                            <div className="flex items-center justify-center h-[200px] flex-col">
                                <p className="text-red-500 mb-2">{error}</p>
                                <button 
                                    onClick={fetchUsers}
                                    className="px-4 py-2 bg-[#022B23] text-white rounded-md text-sm hover:bg-[#033228]"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="flex items-center justify-center h-[200px]">
                                <p className="text-[#667085]">No users found</p>
                            </div>
                        ) : (
                            currentUsers.map((user, index) => (
                                <UserTableRow
                                    key={user.id}
                                    user={user}
                                    isLast={index === currentUsers.length - 1}
                                    onDeleteUser={handleDeleteUser}
                                />
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-[24px] py-[16px] border-t border-[#EAECF0] gap-4 sm:gap-0">
                            <p className="text-[12px] sm:text-[14px] text-[#667085]">
                                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                            </p>
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center sm:justify-start">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-2 sm:px-3 py-1 text-[12px] sm:text-[14px] text-[#667085] border border-[#D0D5DD] rounded-md hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-2 sm:px-3 py-1 text-[12px] sm:text-[14px] border rounded-md ${
                                            currentPage === page
                                                ? 'bg-[#022B23] text-white border-[#022B23]'
                                                : 'text-[#667085] border-[#D0D5DD] hover:bg-[#F9FAFB]'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-2 sm:px-3 py-1 text-[12px] sm:text-[14px] text-[#667085] border border-[#D0D5DD] rounded-md hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Users;