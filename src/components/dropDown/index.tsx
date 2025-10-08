'use client';
import { useState } from "react";
import Image from "next/image";
import agricimg from '../../../public/assets/images/mapIcon.png';
import categoryImg from '../../../public/assets/images/categoryImg.svg';
import electronicIcon from '../../../public/assets/images/electronicIcon.png';
import hospitalIcon from '../../../public/assets/images/hospitalIcon.svg';
import babyIcon from '../../../public/assets/images/homeIcon.png';
import lotionIcon from '../../../public/assets/images/lotionIcon.svg';
import carIcon from '../../../public/assets/images/carIcon.svg';
import mobileIcon from '../../../public/assets/images/mobileIcon.svg';
import fashionIcon from '../../../public/assets/images/fashionIcon.png';
import homeIcon from '../../../public/assets/images/homeIcon.png';
import mapIcon from '../../../public/assets/images/mapIcon.png';
import deviceIcon from '../../../public/assets/images/deviceIcon.svg';

type Category = {
    label: string;
    icon: string;
};

const categories: Category[] = [
    { label: "Agriculture", icon: agricimg },
    { label: "Electronics", icon: electronicIcon },
    { label: "Healthcare", icon: hospitalIcon },
    { label: "Kids", icon: babyIcon },
    { label: "Skincare", icon: lotionIcon },
    { label: "Cars", icon: carIcon },
    { label: "Smartphones", icon: mobileIcon },
    { label: "Fashion", icon: fashionIcon },
    { label: "Home", icon: homeIcon },
    { label: "Travel", icon: mapIcon },
    { label: "Computing", icon: deviceIcon },
];

const Dropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<Category | null>(null);

    return (
        <div className="relative">
            <div
                className="flex items-center h-[52px] bg-[#022B23] w-[246px] px-[10px] rounded-[8px] cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Image src={categoryImg} alt="Dropdown Icon" width={20} height={20} />
                <span className="bg-[#022B23] text-[#ffeebe] pr-1 ml-2">
          {selectedOption ? selectedOption.label : "Categories"}
        </span>
            </div>
            {isOpen && (
                <div className="absolute  w-[246px] bg-[#ffffff] text-black rounded-md shadow-lg z-10">
                    <ul className="py-1">
                        {categories.map((option, index) => (
                            <li
                                key={index}
                                className="flex items-center px-4 py-2 text-black hover:bg-[#ECFDF6] cursor-pointer"
                                onClick={() => {
                                    setSelectedOption(option);
                                    setIsOpen(false);
                                }}
                            >
                                <Image
                                    src={option.icon}
                                    alt={option.label}
                                    width={20}
                                    height={20}
                                    className="mr-2"
                                />
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
export default Dropdown;