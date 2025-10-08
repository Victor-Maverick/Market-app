'use client';

import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Define the data type
interface MarketData {
    name: string;
    market1: number;
    market2: number;
}

const data: MarketData[] = [
    { name: 'Jan', market1: 50000, market2: 35000 },
    { name: 'Feb', market1: 60000, market2: 40000 },
    { name: 'Mar', market1: 65000, market2: 45000 },
    { name: 'Apr', market1: 80000, market2: 50000 },
    { name: 'May', market1: 85000, market2: 60000 },
    { name: 'Jun', market1: 90000, market2: 65000 },
    { name: 'Jul', market1: 95000, market2: 62000 },
    { name: 'Aug', market1: 110000, market2: 65000 },
    { name: 'Sep', market1: 120000, market2: 70000 },
    { name: 'Oct', market1: 125000, market2: 80000 },
    { name: 'Nov', market1: 130000, market2: 75000 },
    { name: 'Dec', market1: 140000, market2: 85000 },
];

export default function MarketPerformanceChart() {
    const [selectedTimeRange, setSelectedTimeRange] = useState<string>('12months');

    // Filter data based on selected time range
    const getFilteredData = (): MarketData[] => {
        switch(selectedTimeRange) {
            case '6months':
                return data.slice(6);
            case '30days':
                return data.slice(11);
            case '7days':
                return Array(7).fill(null).map((_, i) => ({
                    name: `Day ${i+1}`,
                    market1: 120000 + Math.random() * 30000,
                    market2: 70000 + Math.random() * 20000
                }));
            case '24hours':
                return Array(24).fill(null).map((_, i) => ({
                    name: `${i}:00`,
                    market1: 120000 + Math.random() * 30000,
                    market2: 70000 + Math.random() * 20000
                }));
            default:
                return data;
        }
    };

    return (
        <div className="flex flex-col h-full w-full p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-gray-800">Market performance</div>
                <div className="flex gap-2">
                    <button
                        className={`px-3 py-1 text-xs rounded ${
                            selectedTimeRange === '12months' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedTimeRange('12months')}
                    >
                        12 Months
                    </button>
                    <button
                        className={`px-3 py-1 text-xs rounded ${
                            selectedTimeRange === '6months' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedTimeRange('6months')}
                    >
                        6 Months
                    </button>
                    <button
                        className={`px-3 py-1 text-xs rounded ${
                            selectedTimeRange === '30days' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedTimeRange('30days')}
                    >
                        30 Days
                    </button>
                    <button
                        className={`px-3 py-1 text-xs rounded ${
                            selectedTimeRange === '7days' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedTimeRange('7days')}
                    >
                        7 Days
                    </button>
                    <button
                        className={`px-3 py-1 text-xs rounded ${
                            selectedTimeRange === '24hours' ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedTimeRange('24hours')}
                    >
                        24 Hours
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={getFilteredData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            stroke="#8c8c8c"
                            fontSize={12}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            stroke="#8c8c8c"
                            fontSize={12}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            hide
                        />
                        <Tooltip
                            formatter={(value) => [`₦${value.toLocaleString()}`, '']}
                            labelStyle={{ color: '#022B23' }}
                            contentStyle={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #f0f0f0',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="market1"
                            stroke="#FFA26B"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: "#FFA26B", stroke: "white", strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="market2"
                            stroke="#4CC9F0"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6, fill: "#4CC9F0", stroke: "white", strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}