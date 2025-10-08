// components/InputField.tsx
'use client'

import { useState } from 'react'

interface InputFieldProps {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    optional?: boolean
    type?: string
    className?: string
}

export default function InputField({
                                       id,
                                       label,
                                       value,
                                       onChange,
                                       placeholder,
                                       optional = false,
                                       type = 'text',
                                       className = '',
                                   }: InputFieldProps) {
    const [isFocused, setIsFocused] = useState(false)

    return (
        <div className={`relative w-full mb-[10px] flex flex-col ${className}`}>
            <label
                htmlFor={id}
                className={`absolute left-4 transition-all ${
                    isFocused || value
                        ? 'text-[#6D6D6D] text-[12px] font-medium top-[6px]'
                        : 'hidden'
                }`}
            >
                {label} {optional && <span className="text-[#B0B0B0]">(optional)</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={!isFocused && !value ? placeholder : ''}
                className={`px-4 h-[58px] w-full border-[1.5px] border-[#D1D1D1] rounded-[14px] outline-none focus:border-[2px] focus:border-[#022B23] ${
                    isFocused || value
                        ? 'pt-[14px] pb-[4px] text-[#121212] text-[14px] font-medium'
                        : 'text-[#BDBDBD] text-[16px] font-medium'
                }`}
            />
        </div>
    )
}