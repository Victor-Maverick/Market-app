// contexts/ShopSetupContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ShopInfo {
    name: string
    address: string
    phone: string
    shopNumber: string
    homeAddress: string
    streetName: string
    cacNumber: string
    taxIdNumber: string
    nin: string
    bankName: string
    accountNumber: string
    marketId: number | null
    marketSectionId: number | null
    logoImage?: File | string | null
    email?: string
}

interface ShopSetupContextType {
    shopData: ShopInfo
    setShopData: (data: Partial<ShopInfo>) => void
    currentStep: number
    setCurrentStep: (step: number) => void
    resetShopData: () => void
}

const defaultShopData: ShopInfo = {
    name: '',
    address: '',
    phone: '',
    shopNumber: '',
    homeAddress: '',
    streetName: '',
    cacNumber: '',
    taxIdNumber: '',
    nin: '',
    bankName: '',
    accountNumber: '',
    marketId: null,
    marketSectionId: null,
    logoImage: null,
}

const ShopSetupContext = createContext<ShopSetupContextType>({
    shopData: defaultShopData,
    setShopData: () => {},
    currentStep: 1,
    setCurrentStep: () => {},
    resetShopData: () => {},
})

export const ShopSetupProvider = ({ children }: { children: ReactNode }) => {
    const [shopData, setShopState] = useState<ShopInfo>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('shopSetupData')
            return saved ? JSON.parse(saved) : defaultShopData
        }
        return defaultShopData
    })

    const [currentStep, setCurrentStep] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('shopSetupStep')
            return saved ? parseInt(saved) : 1
        }
        return 1
    })

    const setShopData = (data: Partial<ShopInfo>) => {
        setShopState(prev => {
            const newData = { ...prev, ...data }
            if (typeof window !== 'undefined') {
                localStorage.setItem('shopSetupData', JSON.stringify(newData))
            }
            return newData
        })
    }

    const resetShopData = () => {
        setShopState(defaultShopData)
        setCurrentStep(1)
        if (typeof window !== 'undefined') {
            localStorage.removeItem('shopSetupData')
            localStorage.removeItem('shopSetupStep')
        }
    }

    const setStep = (step: number) => {
        setCurrentStep(step)
        if (typeof window !== 'undefined') {
            localStorage.setItem('shopSetupStep', step.toString())
        }
    }

    return (
        <ShopSetupContext.Provider
            value={{
                shopData,
                setShopData,
                currentStep,
                setCurrentStep: setStep,
                resetShopData,
            }}
        >
            {children}
        </ShopSetupContext.Provider>
    )
}

export const useShopSetup = () => {
    const context = useContext(ShopSetupContext)
    if (!context) {
        throw new Error('useShopSetup must be used within a ShopSetupProvider')
    }
    return context
}