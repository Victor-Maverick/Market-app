


import Image from "next/image";
import limeArrow from '../../../public/assets/images/green arrow.png'
import greenTick from '../../../public/assets/images/green tick.png'
import successTick from '../../../public/assets/images/successtick.svg'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const PaymentSuccessModal = ({ isOpen, onClose, deliveryOption, location }) => {
    if (!isOpen) return null;

    return (
        <div style={{ backdropFilter: "blur(3px)" }}
             className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10" >
            <div className="bg-white max-w-[900px] w-full h-[90vh] p-[100px]  border-[0.5px] rounded-[24px] border-[#ededed] flex flex-col justify-center relative">
                <div className="flex justify-center items-center">
                    <div className="flex-col w-[387px] flex gap-[20px] items-center">
                        <Image src={successTick} alt={'image'} className="h-[120px] w-[120px]"/>
                        <div className="w-full flex justify-center items-center flex-col">
                            <h2 className="text-[20px] font-medium text-[#000B38]">Your order has been placed successfully</h2>
                            <p className="text-[#6B718C] text-[14px]">You can pick up at the shop address selected:</p>
                        </div>

                        <div className="bg-[#ECFDF6] w-full border-[0.5px] border-[#C6EB5F] text-[#022B23] p-[10px]  rounded-[18px] ">
                            <div className="flex items-start justify-center gap-[8px]">
                                <Image src={greenTick} alt={'tick'}/>
                                <div>
                                    <p className="text-[#022B23] font-medium text-[14px]">{deliveryOption}</p>
                                    <p className="w-[190px] font-normal text-[12px]">{location}</p>
                                </div>
                            </div>
                        </div>

                        <p className="font-semibold text-[#022B23] text-[20px] ">Order No: #01234567</p>

                        <div
                            onClick={onClose}
                            className="flex justify-center items-center gap-[9px] mt-6 w-[251px] h-[54px] bg-[#033228] text-white rounded-[12px] ">
                            <p className="text-[#C6EB5F] text-[14px] font-bold">Go to order history</p>
                            <Image src={limeArrow} alt={'arrow'} width={18} height={18} className="h-[16px] w-[16px]"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessModal;
