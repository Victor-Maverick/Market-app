// components/header.tsx
import Image from "next/image";
import headerIcon from "@/../public/assets/images/headerImg.png";
import PendingCallsBadge from "@/components/PendingCallsBadge";


export function Header() {
    return (
        <div className="flex justify-between h-[60px] md:h-[82px] pr-3 md:pr-[20px] w-full pl-3 md:pl-10 items-center border-b-[0.5px] border-[#E7E7E7]">
            <div className="flex items-center">
                <Image src={headerIcon} alt={'icon'} className="w-[32px] h-[32px] md:w-[42px] md:h-[42px]"/>
                <div className="flex justify-center items-center gap-[4px] md:gap-[6px] ml-3 md:ml-[20px] border-[#EDEDED] w-[120px] md:w-[154px] h-[40px] md:h-[48px] border-[0.5px] shadow-sm rounded-[8px]">
                    <span className="bg-[#F2F2F2] rounded-full h-[24px] w-[24px] md:h-[28px] md:w-[28px]"></span>
                    <p className="text-[#022B23] text-[12px] md:text-[14px] font-medium">Admin</p>
                </div>
            </div>
            <PendingCallsBadge className="hidden sm:flex" />
        </div>
    );
}