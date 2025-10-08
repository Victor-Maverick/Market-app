'use client'

import { createContext, useContext, useState } from 'react'
import { useSession } from 'next-auth/react'
import { logisticsService } from '@/services/logisticsService'

interface CompanyInfo {
    companyName: string
    ownerName: string
    companyAddress: string
    taxIdNumber: string
    logo?: File | null
}

interface Documents {
    cacNumber: string
    cacImage?: File | null
    otherDocuments?: File[]
}

interface BankInfo {
    bankName: string
    accountNumber: string
}

interface OnboardingData {
    companyInfo: CompanyInfo
    documents: Documents
    bankInfo: BankInfo
}

interface OnboardingContextType {
    onboardingData: OnboardingData
    updateCompanyInfo: (data: Partial<CompanyInfo>) => void
    updateDocuments: (data: Partial<Documents>) => void
    updateBankInfo: (data: Partial<BankInfo>) => void
    submitOnboarding: () => Promise<{ success: boolean; message: string }>
    addOtherDocument: (file: File) => void
    removeOtherDocument: (index: number) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()
    const [onboardingData, setOnboardingData] = useState<OnboardingData>({
        companyInfo: {
            companyName: '',
            ownerName: '',
            companyAddress: '',
            taxIdNumber: '',
            logo: null,
        },
        documents: {
            cacNumber: '',
            cacImage: null,
            otherDocuments: [],
        },
        bankInfo: {
            bankName: '',
            accountNumber: '',
        },
    })

    const updateCompanyInfo = (data: Partial<CompanyInfo>) => {
        setOnboardingData(prev => ({
            ...prev,
            companyInfo: { ...prev.companyInfo, ...data },
        }))
    }

    const updateDocuments = (data: Partial<Documents>) => {
        setOnboardingData(prev => ({
            ...prev,
            documents: { ...prev.documents, ...data },
        }))
    }

    const updateBankInfo = (data: Partial<BankInfo>) => {
        setOnboardingData(prev => ({
            ...prev,
            bankInfo: { ...prev.bankInfo, ...data },
        }))
    }

    const addOtherDocument = (file: File) => {
        setOnboardingData(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                otherDocuments: [...(prev.documents.otherDocuments || []), file]
            }
        }))
    }

    const removeOtherDocument = (index: number) => {
        setOnboardingData(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                otherDocuments: prev.documents.otherDocuments?.filter((_, i) => i !== index) || []
            }
        }))
    }

    const submitOnboarding = async () => {
        if (!session?.user?.email) {
            throw new Error('User email not found. Please log in again.')
        }

        // Validate required fields
        const { companyInfo, documents, bankInfo } = onboardingData
        
        if (!companyInfo.companyName) throw new Error('Company name is required')
        if (!companyInfo.ownerName) throw new Error('Owner name is required')
        if (!companyInfo.companyAddress) throw new Error('Company address is required')
        if (!companyInfo.taxIdNumber) throw new Error('Tax ID number is required')
        if (!documents.cacNumber) throw new Error('CAC number is required')
        if (!documents.cacImage) throw new Error('CAC document is required')
        if (!bankInfo.bankName) throw new Error('Bank name is required')
        if (!bankInfo.accountNumber) throw new Error('Account number is required')

        const formData = new FormData()

        // Add all required fields
        formData.append('ownerEmail', session.user.email)
        formData.append('companyName', companyInfo.companyName)
        formData.append('ownerName', companyInfo.ownerName)
        formData.append('companyAddress', companyInfo.companyAddress)
        formData.append('tin', companyInfo.taxIdNumber)
        formData.append('cacNumber', documents.cacNumber)
        formData.append('bankName', bankInfo.bankName)
        formData.append('accountNumber', bankInfo.accountNumber)

        // Add optional logo
        if (companyInfo.logo) {
            formData.append('logo', companyInfo.logo)
        }

        // Add required CAC image
        if (documents.cacImage) {
            formData.append('cacImage', documents.cacImage)
        }

        // Add optional other documents
        if (documents.otherDocuments && documents.otherDocuments.length > 0) {
            documents.otherDocuments.forEach((file) => {
                formData.append('otherDocuments', file)
            })
        }

        const result = await logisticsService.onboardCompany(formData)
        
        if (!result.success) {
            throw new Error(result.message)
        }

        return result
    }

    return (
        <OnboardingContext.Provider
            value={{
                onboardingData,
                updateCompanyInfo,
                updateDocuments,
                updateBankInfo,
                submitOnboarding,
                addOtherDocument,
                removeOtherDocument,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    )
}

export function useOnboarding() {
    const context = useContext(OnboardingContext)
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider')
    }
    return context
}