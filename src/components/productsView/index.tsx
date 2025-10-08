import Image from "next/image";
import vendorImg from "../../../public/assets/images/vendorImg.svg";
import verify from "../../../public/assets/images/verify.svg";
import locationImg from "../../../public/assets/images/location.png";
import shopImg from "../../../public/assets/images/shop.png";
import barCodeImg from "../../../public/assets/images/barcode.png";
import { Key, useEffect, useState } from "react";
import arrow from '../../../public/assets/images/grey right arrow.png'
import { useSession } from "next-auth/react";
import axios from "axios";
import { ProductListSkeleton } from '../LoadingSkeletons';

interface ShopData {
    id: number;
    name: string;
    address: string;
    logoUrl: string;
    phone: string;
    shopNumber: string;
    homeAddress: string;
    streetName: string;
    cacNumber: string;
    taxIdNumber: string;
    nin: number;
    bankName: string;
    accountNumber: string;
    firstName: string;
    status: string;
    vendorName?: string;
    market?: string;
    marketSection?: string;
}

interface Product {
    id: number;
    name: string;
    price: string;
    mainImageUrl: string;

}

interface ShopInformationProps {
    shopData: ShopData | null;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const MarketProductCard = ({image,name,price, height,imageHeight})=>{

    return (
        <div  style={{height: height}} className="cursor-pointer w-full rounded-[14px] bg-[#FFFFFF] border border-[#ededed]">
            <Image src={image} width={400} alt={'image'}  height={imageHeight} className="w-full object-cover rounded-t-[14px]" style={{height:imageHeight}}/>
            <div className="mt-4 px-4 flex-col gap-[2px]">
                <p className="font-normal  text-[#1E1E1E]">{name}</p>
                <p className="font-semibold text-[20px]text-[#1E1E1E] mb-4 mt-1">₦{price}.00</p>
            </div>
        </div>
    )

}

const ProductGrid = ({ products }: { products: Product[] }) => {
    if (products.length === 0) {
        return (
            <div className="grid grid-cols-3 gap-x-[15px] gap-y-[15px] py-6">
                <p className="text-[#3F3E3E] text-[14px] font-medium">No products found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-x-[15px] gap-y-[15px] py-6">
            {products.map((product, index: Key) => (
                <MarketProductCard
                    key={index}
                    height={303}
                    name={product.name}
                    image={product.mainImageUrl}
                    price={product.price}
                    imageHeight={215}
                />
            ))}
        </div>
    );
};

export default function ShopInformation({ shopData }: ShopInformationProps) {
    const { data: session } = useSession();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const fullName = session?.user?.firstName && session?.user?.lastName ? `${session.user.firstName} ${session.user.lastName}`
        : "Vendor Name";
    const userEmail = session?.user?.email;

    useEffect(() => {
        if (!userEmail) return;

        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/getByUser?email=${userEmail}`
                );
                setProducts(response.data);
            } catch (err) {
                setError("Failed to fetch products");
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [userEmail]);

    if (!shopData || loading) {
        return (
            <div className="p-4">
                <ProductListSkeleton itemCount={6} />
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="flex gap-[15px] pt-[40px]">
            <div className="flex flex-col">
                <div className="border border-[#ededed] w-[513px] rounded-[24px] h-[180px] ">
                    <div className="flex items-center border-b border-[#ededed] px-[20px] pt-[10px] justify-between">
                        <div className="flex gap-[8px] pb-[10px] items-center">
                            <Image
                                src={shopData.logoUrl?.trim() ? shopData.logoUrl : vendorImg}
                                alt="shop logo"
                                width={40}
                                height={40}
                            />

                            <p className="text-[16px] font-normal mt-[-4px]">{shopData.name}</p>
                        </div>
                        <div className="w-[74px] p-[6px] gap-[4px] h-[30px] bg-[#C6EB5F] rounded-[8px] flex items-center">
                            <Image src={verify} alt={'image'}/>
                            <p className="text-[12px]">verified</p>
                        </div>
                    </div>
                    <div className="px-[20px] flex items-center gap-[4px] mt-[20px]">
                        <Image src={locationImg} alt={'image'} width={18} height={18}/>
                        <p className="text-[14px] font-light">{shopData.address}</p>
                    </div>
                    <div className="flex px-[20px] mt-[15px] gap-[18px]">
                        <div className="flex items-center gap-[4px]">
                            <Image src={shopImg} alt={'image'} width={18} height={18}/>
                            <p className="text-[14px] font-light">{shopData.name} Shop No: {shopData.shopNumber}</p>
                        </div>
                        <div className="flex items-center gap-[4px]">
                            <Image src={barCodeImg} alt={'image'} width={18} height={18}/>
                            <p className="text-[14px] font-light">{shopData.marketSection}</p>
                        </div>
                    </div>

                </div>
                <div className="flex flex-col gap-[20px]  mt-[30px]">
                    <div className="flex flex-col gap-y-[10px] gap-[4px]">
                        <div className="flex px-[18px] gap-[4px] justify-center  w-[513px] border-[0.5px] border-[#E4E4E4] rounded-[14px] h-[56px] bg-[#F7F7F7] flex-col ">
                            <p className="text-[12px] text-[#6D6D6D] font-medium">Vendor name</p>
                            <p className="text-[#121212] text-[14px] font-medium">{fullName}</p>
                        </div>
                        <div className="flex px-[18px] gap-[4px] justify-center  w-[513px] border-[0.5px] border-[#E4E4E4] rounded-[14px] h-[56px] bg-[#F7F7F7] flex-col ">
                            <p className="text-[12px]  text-[#6D6D6D] font-medium">Shop name</p>
                            <p className="text-[#121212] text-[14px] font-medium">{shopData.name}</p>
                        </div>
                        <div className="flex px-[18px] gap-[4px] justify-center  w-[513px] border-[0.5px] border-[#E4E4E4] rounded-[14px] h-[56px] bg-[#F7F7F7] flex-col ">
                            <p className="text-[12px] text-[#6D6D6D] font-medium">Business phone number</p>
                            <p className="text-[#121212] text-[14px] font-medium">{shopData.phone}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-[10px] gap-[4px]">
                        <div className="flex px-[18px] gap-[4px] justify-center  w-[513px] border-[0.5px] border-[#E4E4E4] rounded-[14px] h-[56px] bg-[#F7F7F7] flex-col ">
                            <p className="text-[12px]  text-[#6D6D6D] font-medium">Market</p>
                            <p className="text-[#121212] text-[14px] font-medium">{shopData.market}</p>
                        </div>
                        <div className="flex px-[18px] gap-[4px] justify-center  w-[513px] border-[0.5px] border-[#E4E4E4] rounded-[14px] h-[56px] bg-[#F7F7F7] flex-col ">
                            <p className="text-[12px] text-[#6D6D6D] font-medium">Shop line</p>
                            <p className="text-[#121212] text-[14px] font-medium">{shopData.marketSection}</p>
                        </div>
                        <div className="flex px-[18px] gap-[4px] justify-center  w-[513px] border-[0.5px] border-[#E4E4E4] rounded-[14px] h-[56px] bg-[#F7F7F7] flex-col ">
                            <p className="text-[12px] text-[#6D6D6D] font-medium">Shop number</p>
                            <p className="text-[#121212] text-[14px] font-medium">{shopData.shopNumber}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-[10px] gap-[4px]">
                        <div className="flex px-[18px] gap-[4px] justify-center  w-[513px] border-[0.5px] border-[#E4E4E4] rounded-[14px] h-[56px] bg-[#F7F7F7] flex-col ">
                            <p className="text-[12px] text-[#6D6D6D] font-medium">CAC number</p>
                            <p className="text-[#121212] text-[14px] font-medium">{shopData.cacNumber}</p>
                        </div>
                        <div className="flex px-[18px] gap-[4px] justify-center  w-[513px] border-[0.5px] border-[#E4E4E4] rounded-[14px] h-[56px] bg-[#F7F7F7] flex-col ">
                            <p className="text-[12px]  text-[#6D6D6D] font-medium">TIN</p>
                            <p className="text-[#121212] text-[14px] font-medium">{shopData.taxIdNumber}</p>
                        </div>
                    </div>
                </div>

            </div>
            <div className="flex flex-col">
                <div className="flex flex-col gap-[8px] h-[44px]">
                    <p className="text-[#022B23] text-[16px] font-medium">Products({products.length})</p>
                    <p className="font-medium text-[14px] text-[#707070]">Get a preview of products listed on your shop</p>
                </div>
                <ProductGrid products={products} />
                {products.length > 0 && (
                    <div className="flex w-[143px] h-[24px] justify-between items-center">
                        <p className="text-[#3F3E3E] text-[14px] font-medium">View all products</p>
                        <Image src={arrow} height={20} width={20} alt={'arrow'}/>
                    </div>
                )}
            </div>
        </div>
    );
}