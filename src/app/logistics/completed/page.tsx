'use client'
import DashboardHeader from "@/components/dashboardHeader";
import DashboardSubHeader from "@/components/dashboardSubHeader";
import dashImg from "../../../../public/assets/images/Logistics-rafiki.svg";
import Image from "next/image";
import arrow from "../../../../public/assets/images/arrow-right.svg";
import doneImg from "../../../../public/assets/images/logDashImg.png";
import limeArrow from "../../../../public/assets/images/green arrow.png";
import {useRouter} from "next/navigation";

const  Completed =()=>{
    const router = useRouter();
    const handleContinue = ()=>{
        router.push("dashboard");
    }
    return(
        <>
            <DashboardHeader />
            <DashboardSubHeader
                welcomeText="Manage your logistics company"
                description="Get started by setting up your company"
                image={dashImg}
                textColor="#DD6A02"
                background="#FFFAEB"
            />
            <div className="h-[44px] gap-[8px] border-b-[0.5px] px-25 border-[#ededed] flex items-center">
                <Image src={arrow} alt="arrow image" className="cursor-pointer" />
                <p className="text-[14px] font-normal text-[#707070]">
                    <span className="cursor-pointer text-[#022B23]">Logistics company //</span>
                    <span className="cursor-pointer text-[#022B23]"> License //</span>
                    <span className="cursor-pointer text-[#022B23]"> Fleet onboarding // </span>
                    <span className="cursor-pointer text-[#022B23]">Bank Details //</span>
                    <span className="cursor-pointer text-[#022B23]"> Completed</span>
                </p>
            </div>
            <div className="flex ml-[366px] w-auto mt-16 gap-25">
                <div className="flex flex-col w-[268px] h-[67px] gap-[10px]">
                    <p className="text-[#022B23] text-[16px] font-medium">Setup complete</p>
                    <p className="text-[#707070] font-medium text-[14px]">
                        Your setup is complete and pending approval, you’ll be notified when approved.
                    </p>
                </div>
                <div className="flex flex-col w-[400px] h-auto gap-[38px]">
                    <div className="flex flex-col items-center h-[218px] w-full justify-center">
                        <Image src={doneImg} alt={'image'}/>
                    </div>
                    <div
                        className="flex mb-[20px] gap-[9px] justify-center items-center bg-[#022B23] rounded-[12px] h-[52px] cursor-pointer hover:bg-[#033a30] transition-colors"
                         onClick={handleContinue}
                    >
                        <p className="text-[#C6EB5F] font-semibold text-[14px]">Continue to dashboard</p>
                        <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />
                    </div>
                </div>
            </div>
        </>
    )
}
export default Completed;