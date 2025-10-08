'use client'
import Image from "next/image";
import headerIcon from "../../../../public/assets/images/headerImg.png";
import bottomObjects from '../../../../public/assets/images/bottomObjs.svg'
import leftObjects from '../../../../public/assets/images/OBJECTS.svg'
import gradient from '../../../../public/assets/images/orangeCirlce.png'
import basketImg from '../../../../public/assets/images/marketPlaceBasket.svg'
import limeArrow from '../../../../public/assets/images/green arrow.png'
import {useRouter}  from "next/navigation";
import shadow from "../../../../public/assets/images/shadow.png";
import BackButton from "@/components/BackButton";

const Market =()=>{
    const router = useRouter();
    const handleClick = ()=>{
        router.push("/market/chat");
    }

    return (
        <>
            <div className="flex flex-col relative max-h-[982px] h-[982px]">
                <Image src={leftObjects} alt={'image'} className="absolute pt-[180px] h-[600px] ml-[-37px]"/>
                <Image src={bottomObjects} alt={'image'} className="absolute w-[300px] overflow-hidden mt-[400px] h-[600px]  right-0"/>
                <div className="flex w-full h-[127px] items-center justify-between px-25 ">
                    <div className="flex items-center gap-[4px] w-[85px] h-[42px]">
                        <Image src={headerIcon} alt={'icon'} className="w-[50%] h-full"/>
                        <div className="flex flex-col">
                            <p className="text-[12px] font-semibold text-[#022B23] leading-tight">
                                Market<br/><span className="text-[#C6EB5F]">Go</span>
                            </p>
                        </div>
                    </div>
                    <BackButton variant="default" text="Go back" />
                </div>
                <div className="h-[45px] border-none px- w-full  "
                     style={{
                         backgroundImage: `url(${shadow.src})`,
                         backgroundSize: "cover",
                         backgroundPosition: "center"
                     }}>
                </div>
                <div className="mt-[100px] flex flex-col  items-center ">

                    <div className="flex flex-col w-[496px] h-[96px]">
                        <Image src={gradient} alt={'image'} className="mb-[12px]"/>
                        <p className="mb-[12px] text-[20px] text-[#515151]">Good Morning,</p>
                        <p className="text-[24px] leading-tight text-[#171719] font-medium">Welcome to the Benue Virtual Marketplace,
                            we’re bringing the market to your fingertips</p>
                    </div>
                    <div className="flex items-center mt-[100px]">
                        <Image src={basketImg} alt={'image'}/>
                    </div>

                    <div className="flex flex-col w-[400px] mt-25 gap-[14px] items-center">
                        <div onClick={handleClick} className="w-full cursor-pointer text-[14px] gap-[9px] text-[#C6EB5F] font-semibold bg-[#033228] rounded-[12px] items-center justify-center flex h-[52px]">
                            <p>Let&#39;s go</p>
                            <Image src={limeArrow} alt={'image'}/>
                        </div>
                        <p className="text-[16px] text-[#7C7C7C]">Want to continue with your account? <span className="text-[#001234]">Login</span></p>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Market;