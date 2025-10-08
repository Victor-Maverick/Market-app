import Image from 'next/image'
import phoneImage from '../../../public/assets/images/iphone-image.png'
import ButtonWithGreenArrow from "@/components/buttonWithGreenArrow";

const BannerSection = ()=>{
    return (
        <div className="bg-[#FDE3E2] mb-[20px] h-full items-center">
            <div className="flex  justify-between  w-full">
                <div className="pl-[54px] flex-col mt-[115px] items-center ">
                    <h2 className="text-[32px] font-semibold leading-tight">
                        New Devices <br/>at our store
                    </h2>
                    <p className="text-[16px] mb-[50px] mt-2">Smartphones, Accessories
                        <br/>and other gadgets available</p>
                    <ButtonWithGreenArrow name="Visit store" size={165}/>
                </div>
                <div className="flex mt-[10px] items-end">
                    <Image src={phoneImage} alt={'image'} width={530} className="mt-[100px]  h-[420px] object-fit" />
                </div>

            </div>
        </div>
    )
}

export default BannerSection;