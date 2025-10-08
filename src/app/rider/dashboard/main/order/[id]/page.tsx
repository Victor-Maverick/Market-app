'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardHeader from "@/components/dashboardHeader";
import Image from "next/image";
import arrowBack from '../../../../../../../public/assets/images/arrow-right.svg';
import iPhone from "../../../../../../../public/assets/images/blue14.png";
import mapImg from '../../../../../../../public/assets/images/Basemap image.svg';
import profileImg from '../../../../../../../public/assets/images/profile-circle.png';
import callIcon from '../../../../../../../public/assets/images/callIcon.svg';
import arrowRight from '../../../../../../../public/assets/images/green arrow.png';
import RiderDashboardOptions from "@/components/riderDashboardOptions";

export default function OrderPage() {
    const searchParams = useSearchParams();
    const productDataParam = searchParams.get('data');
    const product = productDataParam ? JSON.parse(decodeURIComponent(productDataParam)) : null;
    const router = useRouter();

    const handleBackClick = () => {
        router.push('/rider/dashboard/main');
    };

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader />
            <RiderDashboardOptions />

            <div className="flex flex-col py-[20px] mt-[10px] px-25 gap-[10px]">
                <div onClick={handleBackClick} className="flex cursor-pointer text-[#6B718C] text-[14px] items-center gap-[2px]">
                    <Image src={arrowBack} alt="Back" width={20} height={20} />
                    <p>Back to orders</p>
                </div>
                <p className="text-[#1E1E1E] my-[10px] text-[14px] font-medium">Order details</p>
                <div className="flex gap-[20px]">
                    <div className="w-[30%] flex flex-col h-[686px] rounded-[24px] border-[0.5px] bg-[#f9f9f9] border-[#ededed]">
                        <div className="bg-[#ffffff] rounded-tr-[24px] rounded-tl-[24px] h-[364px] w-full flex justify-center items-end">
                            <Image src={iPhone} alt="Product" height={360} width={300} className="h-[360px]" />
                        </div>
                        <div className="flex flex-col mt-[10px] gap-[8px]">
                            <div className="h-[48px] w-full px-[20px] py-[4px] justify-between items-center flex">
                                <div className="flex flex-col">
                                    <p className="text-[#101828] text-[16px] font-medium">{product?.name}</p>
                                    <p className="text-[#667085] text-[12px]">Order ID: {product?.productId}</p>
                                </div>
                                <span className={`w-[62px] h-[26px] p-[2px] text-[12px] font-medium rounded-[8px] flex items-center justify-center ${
                                    product?.status === "Delivered"
                                        ? "bg-[#ECFDF3] text-[#027A48]"
                                        : "bg-[#FEF3F2] text-[#FF5050]"
                                }`}>
                                    {product?.status}
                                </span>
                            </div>
                            <div className="h-[48px] w-full px-[20px] py-[4px] justify-center flex-col flex">
                                <p className="text-[#667085] text-[12px]">Customer</p>
                                <p className="text-[#101828] text-[16px] font-medium">{product?.customerId}</p>
                            </div>
                            <div className="h-[48px] w-full px-[20px] py-[4px] justify-center flex-col flex">
                                <p className="text-[#667085] text-[12px]">Delivery method</p>
                                <p className="text-[#101828] text-[16px] font-medium">{product?.deliveryMethod}</p>
                            </div>
                            <div className="h-[48px] w-full px-[20px] py-[4px] justify-center flex-col flex">
                                <p className="text-[#667085] text-[12px]">Delivery address</p>
                                <p className="text-[#101828] text-[16px] font-medium">{product?.deliveryAddress}</p>
                            </div>
                            <div className="h-[48px] w-full px-[20px] py-[4px] justify-center flex-col flex">
                                <p className="text-[#667085] text-[12px]">Fee</p>
                                <p className="text-[#101828] text-[16px] font-medium">{product?.fee}</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-[70%] flex flex-col h-[686px] rounded-[24px] border-[0.5px] border-[#ededed] relative">
                        <Image
                            src={mapImg}
                            alt="Map background"
                            layout="fill"
                            objectFit="cover"
                            className="absolute top-0 left-0 w-full h-full z-[-1] rounded-[24px]"
                        />
                        <div className="w-[263px] flex flex-col gap-[10px] h-[130px] border border-[#DCDCDC] bg-[#ffffff] p-[20px] rounded-[24px] mt-75 ml-[24px]">
                            <div className="flex items-center gap-[12px] w-[223px] px-[6px] py-[8px] h-[40px] text-[#414142] text-[14px] font-medium">
                                <Image src={profileImg} alt="Vendor Profile" />
                                <p>Call vendor</p>
                            </div>
                            <div className="flex items-center w-[223px] px-[6px] py-[8px] h-[40px] gap-[12px] text-[#414142] text-[14px] font-medium">
                                <Image src={callIcon} alt="Customer Call" />
                                <p>Call customer on phone</p>
                            </div>
                        </div>
                        <div className="flex justify-between mr-[15px]">
                            <div className="w-[519px] flex mt-[10px] flex-col gap-[10px] h-[224px] border border-[#DCDCDC] bg-[#ffffff] p-[20px] rounded-[24px] ml-[24px]">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col leading-tight">
                                        <p className="text-[#6A6C6E] text-[14px] font-medium">Vendor location</p>
                                        <p className="text-[#141415] text-[16px] font-medium">Abba technologies</p>
                                        <p className="text-[#141415] text-[16px] font-medium">Shop 2B, Lagos line, Wurukum Market</p>
                                    </div>
                                    <span className="bg-[#022B23] cursor-pointer hover:shadow-sm flex items-center justify-center w-[73px] h-[43px] rounded-[8px] text-[#C6EB5F] text-[12px] font-medium">
                                        30 mins
                                    </span>
                                </div>
                                <div className="h-[32px] w-[2px] bg-[#ededed]"></div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col leading-tight">
                                        <p className="text-[#6A6C6E] text-[14px] font-medium">Customer address</p>
                                        <p className="text-[#141415] text-[16px] font-medium">
                                            No. 4 Ioryua Akpen Street<br />
                                            New GRA, Makurdi
                                        </p>
                                    </div>
                                    <span className="bg-[#022B23] flex items-center leading-tight justify-center cursor-pointer hover:shadow-sm w-[149px] h-[58px] rounded-[14px] text-[#C6EB5F] text-[12px] font-medium">
                                        15Mins <br />from vendor location
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col justify-end">
                                <div className="bg-[#022B23] flex items-center justify-center leading-tight gap-[4px] cursor-pointer hover:shadow-sm w-[174px] h-[52px] rounded-[14px] text-[#C6EB5F] text-[12px] font-semibold">
                                    Begin trip
                                    <Image src={arrowRight} alt="Begin Trip" width={16} height={16} className="h-[16px] w-[16px]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
