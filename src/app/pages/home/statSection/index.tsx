'use client';
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import arrowImg from '../../../../../public/assets/images/cartImg.png';
import { statsService, StatsData } from '@/services/statsService';

const formatNumber = (num: number) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "K";
    }
    return num.toString();
};

const StatSection = () => {
    const [statsData, setStatsData] = useState<StatsData>({ vendors: 0, stores: 0, buyers: 0 });
    const [counts, setCounts] = useState([0, 0, 0]);
    const [hovered, setHovered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch real stats data
    useEffect(() => {
        const fetchStatsData = async () => {
            try {
                setLoading(true);
                setError(null);

                const newStatsData = await statsService.getHomePageStats();
                setStatsData(newStatsData);
                console.log("Stats data fetched:", newStatsData);
            } catch (err) {
                console.error("Error fetching stats data:", err);
                setError("Failed to load stats");
                // Fallback to default values
                setStatsData({ vendors: 300000, stores: 82000, buyers: 500000 });
            } finally {
                setLoading(false);
            }
        };

        fetchStatsData();
    }, []);

    const stats = useMemo(() => [
        { label: "Vendors", value: statsData.vendors },
        { label: "Stores", value: statsData.stores },
        { label: "Buyers", value: statsData.buyers },
    ], [statsData.vendors, statsData.stores, statsData.buyers]);

    // Pre-calculate the maximum display values for width consistency
    const maxDisplayValues = stats.map(stat => `${formatNumber(stat.value)}+`);

    useEffect(() => {
        if (loading) return;

        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            setCounts(stats.map(stat => stat.value));
            return;
        }

        if (!hovered) {
            setCounts(stats.map(() => 0));
            return;
        }

        const duration = 1000;
        const steps = 50;
        const intervals = stats.map((stat, index) => {
            const increment = stat.value / steps;
            let count = 0;
            return setInterval(() => {
                count += increment;
                setCounts((prev) => {
                    const newCounts = [...prev];
                    newCounts[index] = Math.min(count, stat.value);
                    return newCounts;
                });
            }, duration / steps);
        });

        return () => intervals.forEach(clearInterval);
    }, [hovered, loading, stats, statsData]);

    // Show loading state
    if (loading) {
        return (
            <div className="bg-[#f9fbe9] w-full py-4 px-4 lg:px-[100px]">
                <div className="max-w-screen-xl mx-auto">
                    <div className="flex justify-between items-center">
                        <div className="flex w-full md:gap-16 gap-4 justify-between md:justify-start">
                            {[1, 2, 3].map((index) => (
                                <div key={index} className="flex flex-col items-center md:items-start flex-shrink-0">
                                    <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                                    <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                        <div className="hidden md:block md:ml-12 flex-shrink-0">
                            <Image src={arrowImg} alt="Arrow Image" width={80} height={80} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="bg-[#f9fbe9] w-full py-4 px-4 lg:px-[100px]"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="max-w-screen-xl mx-auto">
                <div className="flex justify-between items-center">
                    {/* Stats */}
                    <div className="flex w-full md:gap-16 gap-4 justify-between md:justify-start">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center md:items-start flex-shrink-0"
                                style={{ width: `${maxDisplayValues[index].length * 0.8}em` }}
                            >
                                <p className="text-[#022b23] uppercase text-xs md:text-sm whitespace-nowrap">
                                    {stat.label}
                                </p>
                                <div className="relative">
                                    <p className="text-[#022b23] text-lg md:text-[2.25rem] font-semibold">
                                        {error ? "N/A" : `${formatNumber(Math.floor(counts[index]))}+`}
                                    </p>
                                    <p
                                        className="invisible absolute top-0 left-0 text-[#022b23] text-lg md:text-[2.25rem] font-semibold pointer-events-none"
                                        aria-hidden="true"
                                    >
                                        {maxDisplayValues[index]}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Arrow Image - Desktop Only */}
                    <div className="hidden md:block md:ml-12 flex-shrink-0">
                        <Image src={arrowImg} alt="Arrow Image" width={80} height={80} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatSection;