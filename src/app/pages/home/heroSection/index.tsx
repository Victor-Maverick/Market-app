"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import heroImage1 from "../../../../../public/assets/images/heroImage.png";
import heroImage2 from "../../../../../public/assets/images/hero2.png";
import heroImage3 from "../../../../../public/assets/images/hero3.png";
import heroImage4 from "../../../../../public/assets/images/hero4.png";
import heroImage5 from "../../../../../public/assets/images/hero5.png";
import limeArrow from "../../../../../public/assets/images/green arrow.png";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const images = [heroImage1, heroImage2, heroImage3, heroImage4, heroImage5];

const HeroSection = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleRegisterClick = () => {
        router.push("/register/getStarted");
    };

    return (
        <section className="relative w-full pt-[70px] md:pt-[80px] lg:pt-[90px] min-h-[600px] h-[800px] max-h-[900px]">
            <div className="flex h-full w-full justify-between md:flex-row flex-col items-center mx-auto px-0 max-w-[1440px]">
                {/* Text Content - Centered on mobile */}
                <div className="flex flex-col h-full py-8 gap-4 md:gap-6 justify-center md:w-1/2 w-full text-center md:text-left pl-6 md:pl-[100px] pr-6 md:pr-0">
                    {/* Tagline - Centered on mobile, aligned left on desktop */}
                    <div className="w-[340px] h-[40px] border border-[#ffeebe] bg-[#FFFAEB] rounded-lg flex items-center justify-center md:justify-start md:pl-4">
                        <p className="text-[#022B23] font-medium text-sm md:text-base">
                            The future of digital trade is here!
                        </p>
                    </div>

                    {/* Headings - Centered on mobile, left on desktop */}
                    <h1 className="text-[#1E1E1E] font-semibold text-2xl sm:text-4xl md:text-[40px] leading-tight">
                        BDIC Virtual and <br/>
                        Digital Market Space & <br/>Logistics Management System
                    </h1>
                    <p className="text-[#1E1E1E] font-normal text-lg sm:text-xl md:text-2xl leading-tight">
                        Onboard your store, explore trusted vendors,
                        <br className="hidden md:block" />
                        and enjoy seamless logistics.
                    </p>

                    {/* Buttons - Row and centered on mobile */}
                    <div className="flex flex-row gap-[14px] mt-8 md:mt-12 justify-center md:justify-start">
                        {session ? (
                            // Only show Visit Market button if authenticated
                            <button
                                onClick={() => router.push("/marketPlace")}
                                className="bg-[#022B23] cursor-pointer w-[165px] h-[48px] text-[#c6eb5f] rounded-[12px] font-semibold flex items-center justify-center gap-2 p-2 hover:bg-green-900 transition-colors"
                            >
                                <p>Visit Market</p>
                                <Image src={limeArrow} alt="arrow icon" height={18} width={18} />
                            </button>
                        ) : (
                            // Show both buttons if not authenticated
                            <>
                                <button
                                    onClick={handleRegisterClick}
                                    className="bg-[#022B23] cursor-pointer w-[165px] h-[48px] text-[#c6eb5f] rounded-[12px] font-semibold flex items-center justify-center gap-2 p-2 hover:bg-green-900 transition-colors"
                                >
                                    <p>Get started</p>
                                    <Image src={limeArrow} alt="arrow icon" height={18} width={18} />
                                </button>
                                <button
                                    onClick={() => router.push("/marketPlace")}
                                    className="bg-white cursor-pointer border-[2px] border-[#022B23] text-[#022B23] w-[127px] h-[48px] rounded-[12px] font-semibold flex items-center justify-center gap-2 p-2 hover:bg-gray-50 transition-colors"
                                >
                                    <p>Visit Market</p>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Image Slider - Full width on mobile, half on desktop */}
                <div className="relative w-full md:w-1/2 h-full min-h-[300px] overflow-hidden">
                    <div className="flex h-full transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {images.map((img, index) => (
                            <div key={index} className="w-full h-full flex-shrink-0 relative">
                                <Image
                                    src={img}
                                    alt={`Hero image ${index + 1}`}
                                    fill
                                    className="object-cover object-center"
                                    priority={index === 0}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
export default HeroSection;