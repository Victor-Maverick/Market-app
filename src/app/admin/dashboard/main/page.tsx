// app/admin/dashboard/index.tsx
'use client'
import MarketPerformanceChart from "@/components/marketPerformanceChart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { SkeletonLoader } from "@/components/LoadingSkeletons";

interface DashboardData {
    marketsCount: number;
    vendorsCount: number;
    logisticsCount: number;
    usersCount: number;
    totalTransactions: number;
    adsRevenue: number;
    shopSales: number;
    disputesCount: number;
    marketsChangePercent: number;
    vendorsChangePercent: number;
    logisticsChangePercent: number;
    usersChangePercent: number;
    transactionsChangePercent: number;
    adsChangePercent: number;
    salesChangePercent: number;
    disputesChangePercent: number;
}

export default function DashboardOverview() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch all data in parallel using axios
                const [
                    marketsRes,
                    shopSalesRes,
                    logisticsRes,
                    totalTransactionsRes,
                    adsRevenueRes,
                    vendorRes,
                    usersRes,
                    disputesRes
                ] = await Promise.all([
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/markets/all`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/getTotalTransactionAmount`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/logisticsAll`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/allTransactionAmount`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/allPromotion`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getAllVendorsCount`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/allCount`),
                    axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/dispute/allPendingCount`)

                ]);

                // Extract data from responses
                const markets = marketsRes.data;
                const shopSalesAmount = shopSalesRes.data;
                const logistics = logisticsRes.data;
                const totalTransactions = totalTransactionsRes.data;
                const adsPromotions = adsRevenueRes.data;
                const vendors = vendorRes.data;
                const disputeNumber = disputesRes.data;
                const users = usersRes.data;

                // Calculate ads revenue from promotions data
                const adsRevenue = Array.isArray(adsPromotions) 
                    ? adsPromotions.reduce((total: number, transaction) => total + (transaction.amount /100 || 0), 0)
                    : 0;

                // Format the dashboard data
                const dashboardData: DashboardData = {
                    marketsCount: markets.length || 0,
                    vendorsCount: vendors,
                    logisticsCount: logistics,
                    usersCount: users,
                    totalTransactions: totalTransactions || 0,
                    adsRevenue: adsRevenue,
                    shopSales: shopSalesAmount || 0,
                    disputesCount: disputeNumber,
                    marketsChangePercent: 6.41,
                    vendorsChangePercent: 6.41,
                    logisticsChangePercent: 1.41,
                    usersChangePercent: -0.41,
                    transactionsChangePercent: 4.38,
                    adsChangePercent: 15.6,
                    salesChangePercent: 8.75,
                    disputesChangePercent: 8.75
                };

                setData(dashboardData);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch dashboard data");
                setLoading(false);
                console.error("Error fetching dashboard data:", err);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-6"><SkeletonLoader type="card" count={4} /></div>;
    if (error) return <div className="h-[900px] flex items-center justify-center text-red-500">{error}</div>;
    if (!data) return <div className="h-[900px] flex items-center justify-center">No data available</div>;

    // Helper function to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="min-h-[900px] pb-4">
            <div className="h-[46px] flex items-center border-b-[0.5px] border-[#ededed] px-4 sm:px-6 lg:px-[20px]">
                <p className="text-[#022B23] font-medium text-[14px] sm:text-[16px]">Dashboard overview</p>
            </div>

            {/* Metrics Section */}
            <div className="flex flex-col lg:flex-row w-full px-4 sm:px-6 lg:px-[20px] gap-4 lg:gap-[20px] mt-[20px] lg:h-[110px] lg:justify-between">
                {/* Markets Card */}
                <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#EAEAEA] border-[0.5px]">
                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#F7F7F7]">
                        <p className="text-[#707070] text-[12px] sm:text-[14px]">Markets</p>
                    </div>
                    <div className="flex-1 flex justify-center flex-col p-[14px]">
                        <p className="text-[18px] sm:text-[20px] text-[#022B23] font-medium">{data.marketsCount}</p>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                            <p 
                                className="text-[10px] sm:text-[11px] text-[#022B23] underline font-medium cursor-pointer hover:text-[#52A43E]"
                                onClick={() => router.push('/admin/dashboard/markets')}
                            >
                                View markets
                            </p>
                        </div>
                    </div>
                </div>

                {/* Vendors Card */}
                <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#EAEAEA] border-[0.5px]">
                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#F7F7F7]">
                        <p className="text-[#707070] text-[12px] sm:text-[14px]">Vendors</p>
                    </div>
                    <div className="flex-1 flex justify-center flex-col p-[14px]">
                        <p className="text-[18px] sm:text-[20px] text-[#022B23] font-medium">{data.vendorsCount.toLocaleString()}</p>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                            <p 
                                className="text-[10px] sm:text-[11px] text-[#022B23] underline font-medium cursor-pointer hover:text-[#52A43E]"
                                onClick={() => router.push('/admin/dashboard/vendors')}
                            >
                                View vendors
                            </p>
                        </div>
                    </div>
                </div>

                {/* Logistics Card */}
                <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#EAEAEA] border-[0.5px]">
                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#F7F7F7]">
                        <p className="text-[#707070] text-[12px] sm:text-[14px]">Logistics</p>
                    </div>
                    <div className="flex-1 flex justify-center flex-col p-[14px]">
                        <p className="text-[18px] sm:text-[20px] text-[#022B23] font-medium">{data.logisticsCount}</p>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                            <p 
                                className="text-[10px] sm:text-[11px] text-[#022B23] underline font-medium cursor-pointer hover:text-[#52A43E]"
                                onClick={() => router.push('/admin/dashboard/logistics')}
                            >
                                View logistics
                            </p>
                        </div>
                    </div>
                </div>

                {/* Users Card */}
                <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#EAEAEA] border-[0.5px]">
                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#F7F7F7]">
                        <p className="text-[#707070] text-[12px] sm:text-[14px]">All Users</p>
                    </div>
                    <div className="flex-1 flex justify-center flex-col p-[14px]">
                        <p className="text-[18px] sm:text-[20px] text-[#022B23] font-medium">{data.usersCount.toLocaleString()}</p>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                            <p 
                                className="text-[10px] sm:text-[11px] text-[#022B23] underline font-medium cursor-pointer hover:text-[#52A43E]"
                                onClick={() => router.push('/admin/dashboard/users')}
                            >
                                View customers
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Second Row Metrics */}
            <div className="flex flex-col lg:flex-row w-full px-4 sm:px-6 lg:px-[20px] gap-4 lg:gap-[20px] mt-4 lg:mt-[20px] lg:h-[110px]">
                {/* Total Transactions Card */}
                <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#EAEAEA] border-[0.5px]">
                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#000000]">
                        <p className="text-[#FFFFFF] text-[12px] sm:text-[14px]">Total transactions</p>
                    </div>
                    <div className="flex-1 flex justify-center flex-col p-[14px]">
                        <p className="text-[16px] sm:text-[18px] lg:text-[20px] text-[#022B23] font-medium">{formatCurrency(data.totalTransactions)}</p>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                            <p 
                                className="text-[10px] sm:text-[11px] text-[#022B23] underline font-medium cursor-pointer hover:text-[#52A43E]"
                                onClick={() => router.push('/admin/dashboard/transactions')}
                            >
                                View transactions
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ads Revenue Card */}
                <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#EAEAEA] border-[0.5px]">
                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#000000]">
                        <p className="text-[#FFFFFF] text-[12px] sm:text-[14px]">Ads and promotion revenue</p>
                    </div>
                    <div className="flex-1 flex justify-center flex-col p-[14px]">
                        <p className="text-[16px] sm:text-[18px] lg:text-[20px] text-[#022B23] font-medium">{formatCurrency(data.adsRevenue)}</p>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                            <p 
                                className="text-[10px] sm:text-[11px] text-[#022B23] underline font-medium cursor-pointer hover:text-[#52A43E]"
                                onClick={() => router.push('/admin/dashboard/ads')}
                            >
                                View details
                            </p>
                        </div>
                    </div>
                </div>

                {/* Shop Sales Card */}
                <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#EAEAEA] border-[0.5px]">
                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#000000]">
                        <p className="text-[#FFFFFF] text-[12px] sm:text-[14px]">Shop sales</p>
                    </div>
                    <div className="flex-1 flex justify-center flex-col p-[14px]">
                        <p className="text-[16px] sm:text-[18px] lg:text-[20px] text-[#022B23] font-medium">{formatCurrency(data.shopSales)}</p>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">

                            <p 
                                className="text-[10px] sm:text-[11px] text-[#022B23] underline font-medium cursor-pointer hover:text-[#52A43E]"
                                onClick={() => router.push('/admin/dashboard/transactions')}
                            >
                                View details
                            </p>
                        </div>
                    </div>
                </div>

                {/* Disputes Card */}
                <div className="flex flex-col w-full lg:w-[25%] rounded-[14px] min-h-[110px] border-[#FF5050] border-[0.5px]">
                    <div className="w-full px-[14px] flex items-center rounded-tl-[14px] rounded-tr-[14px] h-[30px] bg-[#FFF2F2]">
                        <p className="text-[#FF5050] text-[12px] sm:text-[14px]">Disputes</p>
                    </div>
                    <div className="flex-1 flex justify-center flex-col p-[14px]">
                        <p className="text-[18px] sm:text-[20px] text-[#022B23] font-medium">{data.disputesCount}</p>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                            <p 
                                className="text-[10px] sm:text-[11px] text-[#022B23] underline font-medium cursor-pointer hover:text-[#52A43E]"
                                onClick={() => router.push('/admin/dashboard/disputes')}
                            >
                                View disputes
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="px-4 sm:px-6 lg:px-[20px] w-full mt-6 lg:mt-25">
                <p className="text-[#18181B] text-[12px] sm:text-[14px] mb-2">Analytics</p>
                <div className="w-full max-w-[291px] mt-[10px] h-[26px] sm:h-[32px] flex rounded-[6px] border-[0.5px] border-[#F2F2F2] overflow-hidden">
                    <div className="flex-1 h-full border-r-[0.5px] border-[#f2f2f2] flex items-center text-[10px] sm:text-[12px] rounded-tl-[6px] rounded-bl-[6px] bg-[#F8FAFB] text-[#03071E] justify-center">
                        <p>Markets</p>
                    </div>
                    <div className="flex-1 h-full border-r-[0.5px] border-[#f2f2f2] flex items-center text-[10px] sm:text-[12px] text-[#8c8c8c] justify-center">
                        <p>Vendor</p>
                    </div>
                    <div className="flex-1 h-full border-r-[0.5px] border-[#f2f2f2] flex items-center text-[10px] sm:text-[12px] text-[#8c8c8c] justify-center">
                        <p>Logistics</p>
                    </div>
                    <div className="flex-1 h-full border-r-[0.5px] border-[#f2f2f2] flex items-center text-[10px] sm:text-[12px] text-[#8c8c8c] justify-center">
                        <p>Users</p>
                    </div>
                    <div className="flex-1 h-full rounded-tr-[6px] rounded-br-[6px] flex items-center text-[10px] sm:text-[12px] text-[#8c8c8c] justify-center">
                        <p>Transactions</p>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="w-[calc(100%-32px)] sm:w-[calc(100%-48px)] lg:w-[calc(100%-40px)] mx-4 sm:mx-6 lg:mx-[20px] mt-6 lg:mt-[30px] h-[300px] sm:h-[350px] lg:h-[391px] border-[0.5px] border-[#f2f2f2] rounded-[14px] overflow-hidden">
                <MarketPerformanceChart />
            </div>
        </div>
    );
}