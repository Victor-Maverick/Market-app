'use client'
import Image from "next/image";
import { useEffect } from "react";
import arrow from '../../../../public/assets/images/dashArrow.png'
import vendorStarterPack from '../../../../public/assets/images/starterPack.png'
import limeArrow from "../../../../public/assets/images/green arrow.png";
import DashboardSubHeader from "@/components/dashboardSubHeader";
import dashSlideImg from "../../../../public/assets/images/dashSlideImg.png";
import DashboardHeader from "@/components/dashboardHeader";
import DashboardOptions from "@/components/dashboardOptions";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BackButton from "@/components/BackButton";

const SetupShop = () => {
    const { data: session } = useSession();
    const router = useRouter();

    // Handle navigation in useEffect
    useEffect(() => {
        if (!session) {
            router.push("/login");
        }
    }, [session, router]);

    const handleContinue = () => {
        router.push("/vendor/setup-shop/shop-info");
    };

    return (
        <>
            <DashboardHeader />
            <DashboardSubHeader
                welcomeText={"Hey, welcome"}
                description={"Get started by setting up your shop"}
                background={'#ECFDF6'}
                image={dashSlideImg}
                textColor={'#05966F'}
            />
            <div className="px-4 sm:px-6 lg:px-25 py-3 sm:py-4">
                <BackButton variant="default" text="Back to Dashboard" />
            </div>
            <div className="h-auto sm:h-[65px] bg-[#1E1E1E] px-4 sm:px-6 lg:px-25 flex flex-col sm:flex-row items-start sm:items-center justify-between py-[12px] gap-2 sm:gap-0">
                <div className="flex-col">
                    <p className="text-[14px] sm:text-[16px] text-[#FFFFFF] font-medium">KYC</p>
                    <p className="text-[12px] sm:text-[14px] font-normal text-[#FFFFFF]">Vendor and shop KYC</p>
                </div>
                <div className="flex gap-[6px] sm:gap-[8px] items-center">
                    <p className="text-[#FFEEBE] text-[12px] sm:text-[14px]">Complete KYC</p>
                    <Image src={arrow} alt={'arrow'} width={16} height={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
            </div>
            <div className="flex flex-col justify-start items-center px-4 sm:px-6">
                <div className="mt-[60px] sm:mt-[80px] lg:mt-[120px] w-full max-w-[268px] flex-col flex items-center text-center justify-center">
                    <Image 
                        src={vendorStarterPack} 
                        alt={'pack'} 
                        width={200}
                        height={200}
                        className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] lg:w-[240px] lg:h-[240px]"
                    />
                    <div className="mt-4 sm:mt-6">
                        <p className="mb-[8px] sm:mb-[10px] text-[14px] sm:text-[16px] text-[#022B23] font-medium">
                            Setup shop and complete KYC
                        </p>
                        <p className="font-medium text-[#707070] text-[12px] sm:text-[14px] leading-relaxed">
                            Provide information about your shop and yourself to complete setup
                        </p>
                    </div>
                    <div
                        onClick={handleContinue}
                        className="flex cursor-pointer mt-[25px] sm:mt-[35px] gap-[6px] sm:gap-[9px] w-full max-w-[268px] justify-center items-center bg-[#022B23] rounded-[10px] sm:rounded-[12px] h-[45px] sm:h-[52px] hover:bg-[#033a30] transition-colors"
                    >
                        <p className="text-[#C6EB5F] font-semibold text-[13px] sm:text-[14px]">Setup shop</p>
                        <Image src={limeArrow} alt={'image'} width={16} height={16} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default SetupShop;