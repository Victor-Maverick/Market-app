import Image from "next/image";
import limeArrow from "../../../public/assets/images/green arrow.png";
import handShake from '@/../public/assets/images/Friendly handshake.svg'

interface AddLogMemberSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}
const AddLogMemberSuccessModal = ({ isOpen, onClose }: AddLogMemberSuccessModalProps)=>{
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white px-10 pb-20 pt-25 w-[950px] max-h-[90vh] flex flex-col items-center overflow-hidden">
                <div className="w-[530px] h-[447px] gap-[28px] flex flex-col flex-shrink-0 mx-auto items-center justify-center">
                    <Image src={handShake} alt={'image'} width={320} className="h-[240px]"/>

                    <div className="flex flex-col gap-[8px] text-center">
                        <p className="text-[#022B23] text-[16px] font-medium">Successfully added</p>
                        <p className="text-[#707070] text-[14px] font-medium leading-tight">A new team member has been added successfully</p>
                    </div>
                    <div
                        className="flex w-[528px] mt-2 gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors px-8"
                        onClick={onClose}
                    >
                        <p className="text-[#C6EB5F] font-semibold text-[14px]">Return to transactions</p>
                        <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddLogMemberSuccessModal