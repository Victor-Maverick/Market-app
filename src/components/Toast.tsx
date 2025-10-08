// components/Toast.tsx
'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
    type: 'success' | 'error'
    message: string
    subMessage?: string
    onClose: () => void
    duration?: number
}

export default function Toast({
                                  type,
                                  message,
                                  subMessage,
                                  onClose,
                                  duration = 5000,
                              }: ToastProps) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false)
            onClose()
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    if (!visible) return null

    const bgColor = type === 'success' ? 'bg-[#ECFDF6]' : 'bg-[#FEF2F2]'
    const textColor = type === 'success' ? 'text-[#05966F]' : 'text-[#DC2626]'
    const icon = type === 'success' ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="#05966F"/>
        </svg>
    ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="#DC2626"/>
        </svg>
    )

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`${bgColor} p-4 rounded-lg shadow-lg border border-[#D1FAE5] max-w-xs`}>
                <div className="flex items-start">
                    <div className={`flex-shrink-0 ${textColor} mt-1`}>
                        {icon}
                    </div>
                    <div className="ml-3">
                        <h3 className={`text-sm font-medium ${textColor}`}>{message}</h3>
                        {subMessage && (
                            <p className="mt-1 text-sm text-gray-700">{subMessage}</p>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setVisible(false)
                            onClose()
                        }}
                        className="ml-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}