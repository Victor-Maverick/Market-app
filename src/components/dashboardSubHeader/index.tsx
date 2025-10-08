import Image from "next/image";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const DashboardSubHeader =({welcomeText, description, background, image, textColor})=>{
    return (
        <>
            <div style={{background:background}} className="h-[90px]  px-25  flex items-center justify-between ">
                <div className="flex-col flex ">
                    <p className="text-[#171719] text-[20px] font-medium">{welcomeText}</p>
                    <p style={{color:textColor}} className="text-[14px]">{description}</p>
                </div>
                <Image src={image} alt={'image'} width={137} className="h-[90px] w-[137px]"/>
            </div>
        </>
    )
}

export default DashboardSubHeader;
