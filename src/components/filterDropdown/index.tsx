'use client';
import { ChevronDown } from 'lucide-react';
import { useState } from "react";

type FilterValue = 'all' | 'today' | '1day' | '7days' | '30days';

type Props = {
    filter: FilterValue;
    setFilter: (value: FilterValue) => void;
    setCurrentPage: (page: number) => void;
};

const options: { label: string; value: FilterValue }[] = [
    { label: "All", value: "all" },
    { label: "Today", value: "today" },
    { label: "1 day ago", value: "1day" },
    { label: "7 days ago", value: "7days" },
    { label: "30 days ago", value: "30days" },
];

const FilterDropdown = ({ filter, setFilter, setCurrentPage }: Props) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (value: FilterValue) => {
        setFilter(value);
        setCurrentPage(1);
        setIsOpen(false);
    };

    const selectedOption = options.find((o) => o.value === filter);

    return (
        <div className="relative mr-6 pr-6">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between h-[38px] w-[123px] px-[10px] bg-white border border-[#F2F2F2] shadow-xs rounded-[8px] text-[#707070] text-[12px] cursor-pointer"
            >
                {selectedOption?.label ?? "Select"}
                <ChevronDown className="ml-2 h-4 w-4" />
            </div>

            {isOpen && (
                <div className="absolute mt-2 w-[123px] bg-white rounded-md shadow-lg z-20">
                    <ul className="py-1">
                        {options.map((option) => (
                            <li
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className="px-4 py-2 text-[12px] text-[#333] hover:bg-gray-200 hover:text-black cursor-pointer"
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;