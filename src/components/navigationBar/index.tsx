import Image from 'next/image'
import backArrow from '../../../public/assets/images/arrow-right.svg'
import {useRouter} from "next/navigation";


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const NavigationBar = ({page,name})=>{
    const router = useRouter();
    return(
        <div className="h-[44px] border-[0.5px] border-[#EDEDED] py-[10px] px-[100px] flex">
            <div onClick={()=>{router.push("/marketPlace")}} className="flex items-center gap-[8px]">
                <Image src={backArrow} alt={'image'} width={20} height={20} className="cursor-pointer"/>
                <p className="text-[14px] cursor-pointer">Go back </p>
            </div>
            <p className="text-[14px] font-normal cursor-pointer">  {page} <span className="font-medium"> {name}</span></p>
        </div>
    )
}
export default NavigationBar;