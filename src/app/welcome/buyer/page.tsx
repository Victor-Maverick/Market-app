'use client'
import farmGoLogo from "../../../../public/assets/images/farmGoLogo.png";
import Image from "next/image";
import welcomeImg from '../../../../public/assets/images/welcomeImg.png'
import verify from '../../../../public/assets/images/limeFilledVerify.png'
import limeArrow from "../../../../public/assets/images/green arrow.png";
import {useRouter} from "next/navigation";

const Welcome = ()=>{
    const router = useRouter();
    const handleClick = ()=>{
        router.push("/login");
    }
    return(
        <div >
            <Image src={farmGoLogo} alt={'logo'} className="md:mt-[60px] mt-[20px] ml-[20px] md:ml-[102px]"/>
            <div className="flex items-center px-[10px] justify-center mb-[20px] md:mb-[41px]">
                <div className="md:w-[800px] px-[10px] w-full mt-[40px] md:mt-[100px] bg-[#F9FDE8] flex justify-center items-center h-[295px] rounded-[14px]">
                    <Image src={welcomeImg} alt={'image'} className="h-[295px] w-full md:w-[450px]"/>
                </div>
            </div>
            <div className="flex items-center justify-center">
                <div className="flex-col items-center w-full md:w-[800px] h-[280px] justify-center">
                    <div className="flex items-center justify-center gap-[8px]">
                        <Image src={verify} alt={'image'} className="h-[24px] w-[24px]"/>
                        <p className="text-[#182753] text-[20px] font-semibold">Welcome to MarketGo</p>
                    </div>
                    <div className="flex justify-center md:ml-[20px] px-[15px] mt-[10px]">
                        <div className="flex-col mb-[68px] w-full md:w-[400px]">
                            <p className="md:text-[16px] text-[14px] text-[#6D6D6D] mb-[28px]">Congratulations! you’ve successfully onboarded <br/>your company on MarketGo</p>
                            <p className="text-[#121212] md:text-[16px] text-[14px] font-medium">Continue to setup shop as a vendor or go to the <br/>marketplace to start buying products</p>

                            <div onClick={handleClick} className="w-full  cursor-pointer flex mt-[35px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px]">
                                <p className="text-[#C6EB5F] font-semibold text-[14px]">Go to marketplace</p>
                                <Image src={limeArrow} alt={'image'} className="h-[18px] w-[18px]"/>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Welcome