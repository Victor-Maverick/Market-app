'use client';
import { useRouter } from "next/navigation";
import Image from "next/image";
import verify from "../../../public/assets/images/limeFilledVerify.png";
import limeArrow from "../../../public/assets/images/green arrow.png";
import welcomeImg from "../../../public/assets/images/welcomeImg.png";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OnboardMarketSuccessModal = ({ isOpen, onClose }: SuccessModalProps) => {
    const router = useRouter();

    const handleGoToMarketplace = () => {
        onClose(); // Call onClose to close the modal
        router.push("/admin/dashboard/markets");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white h-[95vh] w-[950px]  flex justify-center items-center px-[60px] py-[40px]">
                <div className="flex flex-col w-full">
                    <div className="flex w-full items-center px-[10px] justify-center mb-[20px] md:mb-[21px]">
                        <div className="md:w-full px-[10px] w-full mt-[40px] md:mt-[100px] bg-[#FFFAEB] flex justify-center items-center h-[295px] ">
                            <Image src={welcomeImg} alt={'image'} className="h-[295px] w-full md:w-[450px]"/>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="flex flex-col w-[400px] justify-center ">
                            <div className="flex  items-center  gap-[8px]">
                                <Image src={verify} alt={'image'} className="h-[24px] w-[24px]"/>
                                <p className="text-[#182753] text-[20px] font-semibold">Market added successfully</p>
                            </div>
                            <div className="flex justify-center ">
                                <div className="flex-col mb-[68px] w-full md:w-[400px]">
                                    <p className="md:text-[16px] text-[14px] text-[#6D6D6D] mb-[28px]">You have successfully added, Modern market to the <br/>market database</p>

                                    <div
                                        onClick={handleGoToMarketplace}
                                        className="w-full cursor-pointer flex mt-[35px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px]"
                                    >
                                        <p className="text-[#C6EB5F] font-semibold text-[14px]">Go to marketplace</p>
                                        <Image src={limeArrow} alt={'image'} className="h-[18px] w-[18px]"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardMarketSuccessModal;