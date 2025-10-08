'use client'
import Image from "next/image";
import {useRouter} from "next/navigation";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const MarketProductCard = ({image,name,price, height,imageHeight,id})=>{
    const router = useRouter();
    const handleOpen = ()=>{
        router.push(`/marketPlace/productDetails/${id}`);
    }

    return (
        <div onClick={handleOpen} style={{height: height}} className="cursor-pointer w-full rounded-[14px] bg-[#FFFFFF] border border-[#ededed]">
            <Image src={image} width={400} alt={'image'}  height={imageHeight} className="w-full object-cover rounded-t-[14px]" style={{height:imageHeight}}/>
            <div className="mt-4 px-4 flex-col gap-[2px]">
                <p className="font-normal  text-[#1E1E1E]">{name}</p>
                <p className="font-semibold text-[20px]text-[#1E1E1E] mb-4 mt-1">₦{price}.00</p>
            </div>
        </div>
    )

}
export default MarketProductCard