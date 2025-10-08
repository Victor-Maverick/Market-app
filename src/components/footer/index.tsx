'use client'
import Image from "next/image";
import footerImg from "../../../public/assets/images/footerImg.png";
import marketPlaceIcon from '../../../public/assets/images/footerFire.png'
import bdicLogo from '../../../public/assets/images/BDIC logo.svg'
import {useRouter} from "next/navigation";

const Footer = () => {
    const router = useRouter();

    return (
        <div className="flex-col flex justify-between bg-[#001E18] py-8 sm:py-12 lg:py-25 min-h-[400px] sm:min-h-[500px] lg:h-[614px]">
            {/* Main Footer Content */}
            <div className="flex flex-col lg:flex-row justify-between px-4 sm:px-6 lg:px-25 gap-8 lg:gap-0">

                {/* Left Section - Logo and Navigation */}
                <div className="flex flex-col sm:flex-row lg:flex-row justify-between items-start gap-8 sm:gap-12 lg:gap-20">

                    {/* Logo Section */}
                    <div className="flex items-start gap-2 w-full sm:w-auto">
                        <Image src={footerImg} alt="FarmGo Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
                        <p className="text-sm sm:text-base font-semibold text-white leading-tight">
                            Farm
                            <span style={{ color: "#c6eb5f" }}>Go</span> <br />
                            <span className="block">Benue</span>
                        </p>
                    </div>

                    {/* Navigation Section */}
                    <div className="flex flex-col items-start w-full sm:w-auto">
                        <p style={{ color: "#667874" }} className="font-normal mb-3 text-xs sm:text-sm">NAVIGATION</p>

                        <div className="flex items-center w-full">
                            <p className="cursor-pointer text-gray-100 text-xs sm:text-sm mb-1.5 w-full sm:w-[100px]">Home</p>
                        </div>

                        <div onClick={()=>{router.push("/marketPlace")}} className="flex items-center w-full">
                            <p className="cursor-pointer text-xs sm:text-sm flex items-center gap-x-2 mb-1.5 w-full sm:w-[100px]">
                                <Image src={marketPlaceIcon} alt="Marketplace Icon" width={12} height={14} className="flex-shrink-0" />
                                <span style={{ color: "#ffeebe" }}>MarketPlace</span>
                            </p>
                        </div>

                        <div className="flex items-center w-full">
                            <p className="cursor-pointer text-gray-100 text-xs sm:text-sm w-full sm:w-[100px]">About us</p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Contact and Find Us */}
                <div className="flex flex-col sm:flex-row justify-between gap-8 sm:gap-12 lg:gap-20">

                    {/* Contact Us Section */}
                    <div className="flex flex-col">
                        <p style={{ color: "#667874" }} className="font-normal mb-3 text-xs sm:text-sm">CONTACT US</p>
                        <p className="cursor-pointer text-xs sm:text-sm text-white flex items-center gap-x-2 mb-1.5">+234 912 3456 789</p>
                        <p className="cursor-pointer text-xs sm:text-sm text-white flex items-center gap-x-2">hello@farmgobenue.com</p>
                    </div>

                    {/* Find Us Section */}
                    <div className="flex flex-col">
                        <p style={{ color: "#667874" }} className="font-normal mb-3 text-xs sm:text-sm">FIND US</p>
                        <p className="cursor-pointer text-xs sm:text-sm text-white flex items-start gap-x-2 mb-1.5 leading-relaxed">
                            No.1 BDIC Ave. Opp.<br/>
                            Railway Market, Makurdi,<br/>
                            Benue State<br/>
                            Nigeria.
                        </p>
                        <p style={{ color: "#667874" }} className="cursor-pointer text-xs flex items-center gap-x-2 mt-2">
                            Everyday from 8 AM - 8:00 PM
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Copyright and Legal */}
            <div className="px-4 sm:px-6 lg:px-25 mt-8 lg:mt-0">

                {/* Copyright and Legal Links */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-white text-xs sm:text-sm pb-3.5 gap-4 sm:gap-0">
                    <p>© 2025 — Copyright</p>
                    <div className="flex items-center gap-4 sm:gap-8">
                        <p className="cursor-pointer hover:text-gray-300 transition-colors">Privacy</p>
                        <p className="cursor-pointer hover:text-gray-300 transition-colors">Terms of use</p>
                        <p className="cursor-pointer hover:text-gray-300 transition-colors">Legal</p>
                    </div>
                </div>

                {/* Divider and BDIC Section */}
                <div>
                    <div className="w-full border-t border-gray-500"></div>
                    <div className="mt-4 sm:mt-6 lg:mt-8 flex items-center sm:items-end gap-2 sm:gap-[14px] cursor-pointer"
                         onClick={() => window.open("https://bdic.ng/", "_blank")}>
                        <p className="text-xs sm:text-sm font-normal text-[#ffffff] hover:text-gray-300 transition-colors">
                            Powered by BDIC
                        </p>
                        <Image src={bdicLogo} alt="BDIC Logo" className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;