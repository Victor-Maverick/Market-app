import Image from "next/image";
import limeArrow from "../../../public/assets/images/green arrow.png";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error

const ButtonWithGreenArrow = ({name, size})=>{
    return(
        <button style={{color:"#C6EB5F", width: size}}
                className="bg-[#022B23] h-[48px] gap-[9px] text-[#c6eb5f] rounded-[12px] font-semibold flex items-center justify-center"
        >
            {name}
            <Image src={limeArrow} alt="img" height={18} width={18} />
        </button>
    )
}

export default ButtonWithGreenArrow;