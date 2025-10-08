import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import displayImg from "../../../public/assets/images/iphone14Img.svg";
import productTick from '../../../public/assets/images/addproducttick.svg';
import limeArrow from "../../../public/assets/images/green arrow.png";

type ProductAddedModalProps = {
    isOpen: boolean;
    onClose: () => void;
    productImage?: string | StaticImageData | null;
    onGoToProducts?: () => void;
};

export const ProductAddedModal = ({
                                      isOpen,
                                      onClose,
                                      productImage,
                                      onGoToProducts,
                                  }: ProductAddedModalProps) => {
    const router = useRouter();

    if (!isOpen) return null;

    const handleGoToProducts = () => {
        if (onGoToProducts) {
            onGoToProducts();
        } else {
            router.push("/vendor/dashboard/shop?tab=product");
        }
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#808080]/20"
            onClick={onClose}
        >
            <div
                className="bg-white max-w-[900px] items-center gap-[25px] w-full h-[420px] p-[24px] border-[0.5px] rounded-[24px] border-[#ededed] flex relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Product Image Display - Only uses productImage prop */}
                <div className="flex justify-center items-center bg-[#F9F9F9] rounded-[20px] w-[47%] h-[380px] overflow-hidden">
                    <Image
                        src={productImage || displayImg}
                        alt={productImage ? "Uploaded product" : "Default product display"}
                        width={300}
                        height={300}
                        className="object-contain w-full h-full"
                        priority
                    />
                </div>

                {/* Success Content */}
                <div className="flex-col flex justify-center gap-[36px] items-center w-[53%]">
                    <div className="flex justify-center items-center">
                        <Image
                            src={productTick}
                            alt="Success tick"
                            width={55}
                            height={55}
                            priority
                        />
                    </div>
                    <div className="flex flex-col justify-center items-center text-center">
                        <p className="text-[#000B38] font-medium">
                            Product has been published to your shop successfully
                        </p>
                        <p className="text-[#6B718C] text-[14px]">
                            Your product has been listed in your shop and ready for sales
                        </p>
                    </div>
                    <button
                        onClick={handleGoToProducts}
                        className="flex gap-[9px] p-[4px] justify-center items-center w-[207px] bg-[#022B23] rounded-[12px] h-[46px] cursor-pointer hover:bg-[#033a30] transition-colors"
                    >
                        <p className="text-[#C6EB5F] font-semibold text-[14px]">Go to products</p>
                        <Image src={limeArrow} alt="Continue arrow" width={18} height={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};