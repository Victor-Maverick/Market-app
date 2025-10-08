// components/Dropdown.tsx
'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface DropdownProps<T> {
    options: T[]
    selectedOption: T | null
    onSelect: (option: T) => void
    placeholder: string
    disabled?: boolean
    renderOption?: (option: T) => React.ReactNode
    getLabel?: (option: T) => string
}

export default function Dropdown<T>({
                                        options,
                                        selectedOption,
                                        onSelect,
                                        placeholder,
                                        disabled = false,
                                        renderOption,
                                        getLabel,
                                    }: DropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false)

    const handleSelect = (option: T) => {
        onSelect(option)
        setIsOpen(false)
    }

    return (
        <div className="relative w-full">
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`border-[1.5px] rounded-[14px] h-[58px] flex justify-between px-[18px] border-[#D1D1D1] items-center ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
            >
                <p className={`${selectedOption ? 'text-[#121212]' : 'text-[#BDBDBD]'} text-[16px] font-medium`}>
                    {selectedOption
                        ? getLabel
                            ? getLabel(selectedOption)
                            : String(selectedOption)
                        : placeholder}
                </p>
                <ChevronDown
                    size={24}
                    className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    color="#BDBDBD"
                />
            </div>

            {isOpen && !disabled && (
                <div className="absolute left-0 mt-2 w-full bg-white text-black rounded-md shadow-lg z-10 border border-[#ededed] max-h-60 overflow-y-auto">
                    <ul className="py-1">
                        {options.map((option, index) => (
                            <li
                                key={index}
                                className="px-4 py-2 text-black hover:bg-[#ECFDF6] cursor-pointer"
                                onClick={() => handleSelect(option)}
                            >
                                {renderOption ? renderOption(option) : getLabel ? getLabel(option) : String(option)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}