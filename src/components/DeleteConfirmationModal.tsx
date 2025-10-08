"use client"
import type React from "react"

// Define the prop types for the DeleteConfirmationModal
export interface DeleteConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onDelete: () => void
    title?: string
    message?: string
    confirmText?: string
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
                                                                             isOpen,
                                                                             onClose,
                                                                             onDelete,
                                                                             title = "Sure you want to delete?",
                                                                             message = "Be sure you want to delete as this action cannot be undone",
                                                                             confirmText = "Delete",
                                                                         }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
            <div className="relative bg-white h-[268px] rounded-[12px] shadow-lg w-[400px] z-50">
                <div className="p-6 flex flex-col gap-[20px]">
                    <div className="flex flex-col gap-[10px]">
                        <div className="w-[48px] h-[48px] p-1.5 rounded-full border-[8px] border-[#FFFAEB] bg-[#FEF0C7] flex items-center justify-center mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 9V14M12 21.41H5.94C2.47 21.41 1.02 18.93 2.7 15.9L5.82 10.28L8.76 5.01C10.54 1.79 13.46 1.79 15.24 5.01L18.18 10.29L21.3 15.91C22.98 18.94 21.52 21.42 18.06 21.42H12V21.41Z"
                                    stroke="#DC6803"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M11.995 17H12.004"
                                    stroke="#DC6803"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-[#101828] text-[18px]">{title}</p>
                            <p className="text-[14px] text-[#667085]">{message}</p>
                        </div>
                    </div>
                    <div className="flex w-[352px] h-[44px] gap-[12px]">
                        <div
                            onClick={onClose}
                            className="flex w-[170px] h-full justify-center items-center border text-[16px] border-[#D0D5DD] text-[#344054] font-medium rounded-[8px] cursor-pointer"
                        >
                            Cancel
                        </div>
                        <div
                            onClick={onDelete}
                            className="flex w-[170px] h-full justify-center items-center bg-[#FF5050] text-white font-medium rounded-[8px] border border-[#FF5050] cursor-pointer"
                        >
                            {confirmText}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeleteConfirmationModal
