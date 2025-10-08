'use client'
import Image from "next/image";
import limeArrow from "../../../public/assets/images/green arrow.png";
import cash from '@/../public/assets/images/cash.svg'

interface PayoutRequestSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PayoutRequestSuccessModal = ({ isOpen, onClose }: PayoutRequestSuccessModalProps) => {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white px-10 pb-20 pt-25 w-[950px] max-h-auto flex flex-col items-center overflow-hidden">
                <div className="w-[530px] h-[447px] gap-[28px] flex flex-col flex-shrink-0 mx-auto items-center justify-center">
                    <Image src={cash} alt={'image'} width={320} className="h-[240px]"/>

                    <div className="flex flex-col gap-[8px] text-center">
                        <p className="text-[#022B23] text-[16px] font-medium">Pay-out request sent</p>
                        <p className="text-[#707070] text-[14px] font-medium leading-tight">Your request has been successfully sent,<br/>
                            expect the money into your account within the next 24-hours</p>
                    </div>
                    <div
                        className="flex w-[528px] mt-8 gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors px-8"
                        onClick={onClose}
                    >
                        <p className="text-[#C6EB5F] font-semibold text-[14px]">Return to transactions</p>
                        <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayoutRequestSuccessModal;