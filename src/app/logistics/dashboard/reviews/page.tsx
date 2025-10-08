'use client'
import LogisticsCompanyGuard from "@/components/LogisticsCompanyGuard";
import DashboardHeader from "@/components/dashboardHeader";
import LogisticsDashboardOptions from "@/components/logisticsDashboardOptions";
import bike from "../../../../../public/assets/images/bike.svg";
import truckIcon from "../../../../../public/assets/images/truckIcon.svg";
import Image from "next/image";
import arrowDown from "../../../../../public/assets/images/arrow-down.svg";
import arrowBack from "../../../../../public/assets/images/arrowBack.svg";
import arrowFoward from "../../../../../public/assets/images/arrowFoward.svg";
import {useState} from "react";
import iPhone from "../../../../../public/assets/images/blue14.png";

const products = [
    { id: 1, productId: "1234567887654", productImage: iPhone, productName: "iPhone 14 pro max", vehicleId: "01234567", image: bike, name: "TVS Bike", status: "Good", rating: 4.2, comment: "Delivery was fast, great service" },
    { id: 2, productId: "1234567887654", productImage: iPhone, productName: "iPhone 14 pro max", vehicleId: "01234567", image: truckIcon, name: "TVS Bike", status: "Normal", rating: 4.2, comment: "fair" },
    { id: 3, productId: "1234567887654", productImage: iPhone, productName: "iPhone 14 pro max", vehicleId: "01234567", image: bike, status: "Bad", name: "TVS Bike", rating: 4.2, comment: "Not well handled, carton had dents" },
    { id: 4, productId: "1234567887654", productImage: iPhone, productName: "iPhone 14 pro max", vehicleId: "01234567", image: truckIcon, status: "Good", name: "TVS Bike", rating: 4.2, comment: "Fast delivery" },
    { id: 5, productId: "1234567887654", productImage: iPhone, productName: "iPhone 14 pro max", vehicleId: "01234567", image: bike, name: "TVS Bike", status: "Normal", rating: 4.2, comment: "Fast delivery, and polite dispatch rider" },
    { id: 6, productId: "1234567887654", productImage: iPhone, productName: "iPhone 14 pro max", vehicleId: "01234567", image: truckIcon, name: "TVS Bike", status: "Good", rating: 4.2, comment: "Fast delivery, and polite dispatch rider" },
    { id: 7, productId: "1234567887654", productImage: iPhone, productName: "iPhone 14 pro max", vehicleId: "01234567", image: bike, name: "TVS Bike", status: "Bad", rating: 4.2, comment: "Fast delivery, and polite dispatch rider"},
    { id: 8, productId: "1234567887654", productImage: iPhone, productName: "iPhone 14 pro max", vehicleId: "01234567", image: truckIcon, name: "TVS Bike", status: "Good", rating: 4.2, comment: "Fast delivery, and polite dispatch rider"},
    { id: 9, productId: "1234567887654", productImage: iPhone, productName: "iPhone 14 pro max", vehicleId: "01234567", image: bike, name: "TVS Bike", status: "Normal", rating: 4.2, comment: "Fast delivery, and polite dispatch rider"},
    { id: 10, productId: "1234567887654", productImage: iPhone, productName: "iPhone 14 pro max", vehicleId: "01234567", image: truckIcon, name: "TVS Bike", status: "Bad", rating: 4.2, comment: "Fast delivery, and polite dispatch rider"},
    { id: 11, productId: "1234567887654", productImage: iPhone, productName: "iPhone 14 pro max", vehicleId: "01234567", image: bike, name: "TVS Bike", status: "Good", rating: 4.2, comment: "Fast delivery, and polite dispatch rider"},
    { id: 12, productId: "1234567887654", productImage: iPhone, productName: "iPhone 14 pro max", vehicleId: "01234567", image: truckIcon, name: "TVS Bike", status: "Normal", rating: 4.2, comment: "Fast delivery, and polite dispatch rider"},
];

const ProductTableRow = ({ product, isLast }: { product: typeof products[0]; isLast: boolean }) => {
    return (
        <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : ''}`}>
            <div className="flex items-center w-[33%] pr-[24px] gap-3">
                <div className="bg-[#f9f9f9] h-full w-[70px] overflow-hidden mt-[2px]">
                    <Image
                        src={product.productImage}
                        alt={product.productName}
                        width={70}
                        height={70}
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-[14px] font-medium text-[#101828]">{product.productName}</p>
                    <p className="text-[12px] text-[#667085]">ID: #{product.vehicleId}</p>
                </div>
            </div>

            <div className="flex items-center w-[12%]  px-[10px]">
                <div className={`w-[55px] h-[22px] rounded-[8px] flex items-center justify-center ${
                    product.status === 'Good'
                        ? 'bg-[#ECFDF3] text-[#027A48]'
                        : product.status === 'Normal'
                            ? 'bg-[#FFFAEB] text-[#FFB320]'
                            : 'bg-[#FEF3F2] text-[#FF5050]'
                }`}>
                    <p className="text-[12px] font-medium">{product.status}</p>
                </div>
            </div>

            <div className="flex items-center w-[25%] px-[16px]">
                <p className="text-[12px] w-[176px] leading-tight text-[#667085]">
                    {product.comment}
                </p>
            </div>

            <div className="flex w-[20%] gap-[10px] items-center">
                <div className="flex items-center  justify-center rounded-full h-[40px] bg-[#EDEDED] w-[40px]">
                    <Image src={product.image} alt={'image'}/>
                </div>
                <div className="flex flex-col">
                    <p className="text-[#101828] text-[14px] font-medium">{product.name}</p>
                    <p className="text-[#667085] text-[14px]">ID: {product.vehicleId}</p>
                </div>
            </div>

            <div className="flex items-center w-[10%] px-[28px]">
                <p className="text-[14px] font-medium  text-[#344054]">{product.rating}</p>
            </div>
        </div>
    )
}

const Reviews = ()=>{
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    // Calculate the items to display on the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = products.slice(startIndex, startIndex + itemsPerPage);

    return(
        <LogisticsCompanyGuard>
            <DashboardHeader />
            <LogisticsDashboardOptions />
            <div className="flex flex-col py-[30px] px-25">
                <div className="flex flex-col mt-[10px] rounded-[24px] border-[1px] border-[#EAECF0]">
                    <div className="flex flex-col py-[20px] px-[24px]">
                        <p className="text-[#101828] text-[18px] font-medium">Reviews (34)</p>
                        <p className="text-[#667085] text-[14px]">View reviews on products in your dispatch riders</p>
                    </div>
                    <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                        <div className="flex items-center px-[24px] w-[33%] py-[12px] gap-[4px]">
                            <p className="text-[#667085] font-medium text-[12px]">Products</p>
                            <Image src={arrowDown} alt="Sort" width={12} height={12} />
                        </div>
                        <div className="flex items-center px-[24px] w-[12%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Status</p>
                        </div>
                        <div className="flex items-center px-[24px] w-[25%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Comment</p>
                        </div>
                        <div className="flex items-center px-[24px] w-[20%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Vehicle</p>
                        </div>
                        <div className="flex items-center px-[24px] w-[10%] py-[12px]">
                            <p className="text-[#667085] font-medium text-[12px]">Rating</p>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        {currentItems.map((product, index) => (
                            <ProductTableRow
                                key={product.id}
                                product={product}
                                isLast={index === currentItems.length - 1}
                            />
                        ))}
                    </div>
                    <div className="h-[68px] border-t-[1px] justify-between flex items-center border-[#EAECF0] px-[24px] py-[12px]">
                        <div
                            onClick={handlePrevious}
                            className={`flex text-[#344054] text-[14px] font-medium gap-[8px] justify-center items-center border-[#D0D5DD] border-[1px] cursor-pointer hover:shadow-md shadow-sm w-[114px] rounded-[8px] px-[14px] py-[8px] h-[36px] ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Image src={arrowBack} alt={'image'} />
                            <p>Previous</p>
                        </div>
                        <div className="flex gap-[2px]">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <div
                                    key={index + 1}
                                    onClick={() => handlePageClick(index + 1)}
                                    className={`flex justify-center items-center w-[36px] h-[36px] rounded-[8px] text-[14px] font-medium cursor-pointer ${
                                        currentPage === index + 1
                                            ? 'bg-[#ecfdf6] text-[#022B23]'
                                            : 'bg-white text-[#022B23]  hover:shadow-md'
                                    }`}
                                >
                                    {index + 1}
                                </div>
                            ))}
                        </div>
                        <div
                            onClick={handleNext}
                            className={`flex text-[#344054] text-[14px] gap-[8px] font-medium justify-center items-center border-[#D0D5DD] border-[1px] cursor-pointer hover:shadow-md shadow-sm w-[88px] rounded-[8px] px-[14px] py-[8px] h-[36px] ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <p>Next</p>
                            <Image src={arrowFoward} alt={'image'} />
                        </div>
                    </div>
                </div>
            </div>
        </LogisticsCompanyGuard>
    )
}

export default Reviews;