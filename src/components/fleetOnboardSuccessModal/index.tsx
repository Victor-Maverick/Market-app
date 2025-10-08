import Image from "next/image";
import limeArrow from "@/../public/assets/images/green arrow.png";
import fleetSuccessImg from '@/../public/assets/images/fleetSuccessImg.svg'

interface FleetOnboardSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FleetOnboardSuccessModal({ isOpen, onClose }: FleetOnboardSuccessModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white px-10 pb-25 w-[950px] h-[620px] pt-[100px] flex flex-col items-center gap-[60px]">
                <Image src={fleetSuccessImg} alt={'image'} width={350} height={200}/>

                <div className="flex flex-col gap-[32px] text-center">
                    <div className="flex flex-col gap-[5px]">
                        <p className="text-[#022B23] text-[16px] font-medium">Fleet onboarded successfully</p>
                        <p className="text-[#707070] text-[14px]">You’ve added new vehicles to your fleet</p>
                    </div>

                    <button
                        className="flex w-[500px] gap-2 justify-center cursor-pointer items-center bg-[#022B23] rounded-[12px] h-[52px] hover:bg-[#033a30] transition-colors mt-4"
                        onClick={onClose}
                    >
                        <p className="text-[#C6EB5F] font-semibold text-[14px]">
                            View fleet dashboard
                        </p>
                        <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}