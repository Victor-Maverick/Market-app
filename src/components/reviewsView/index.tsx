'use client'
import { useEffect, useState } from 'react';
import Image, { StaticImageData } from "next/image";
import arrowDown from "../../../public/assets/images/arrow-down.svg";
import iPhone from "../../../public/assets/images/blue14.png";
import axios from "axios";
import { toast } from 'react-hot-toast';
import { ReviewsSkeleton } from '../LoadingSkeletons';

interface ReviewResponse {
    id: number;
    rating: number;
    comment: string;
    productUrl: string;
    productName: string;
    reviewerProfileUrl: string;
    reviewerFirstName: string;
    reviewerLastName: string;
    reviewedAt: string;
}

interface ProductReview {
    id: number;
    image: StaticImageData;
    name: string;
    rating: number;
    comment: string;
    productUrl: string;
    productName: string;
    reviewerProfileUrl: string;
    reviewerFirstName: string;
    reviewerLastName: string;
}

const ProductTableRow = ({
                             product,
                             isLast
                         }: {
    product: ProductReview;
    isLast: boolean;
}) => {
    return (
        <div className={`flex h-[72px] ${!isLast ? 'border-b border-[#EAECF0]' : 'border-b border-[#EAECF0]'}`}>
            <div className="flex items-center w-[480px] pr-[24px] gap-3">
                <div className="bg-[#f9f9f9] h-full w-[70px] overflow-hidden mt-[2px]">
                    <Image
                        src={product.productUrl}
                        alt={product.name}
                        width={70}
                        height={70}
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-[14px] font-medium text-[#101828]">{product.name}</p>
                    <p className="text-[12px] text-[#667085]">Rating: {product.rating}</p>
                </div>
            </div>

            <div className="flex items-center w-[120px] px-[12px]">
                <p className="text-[12px] text-black font-medium">{product.reviewerFirstName} {product.reviewerLastName}</p>
            </div>
            <div className="flex items-center text-[#101828] text-[14px] w-[430px] px-[24px]">
                <p>{product.comment}</p>
            </div>
            <div className="flex items-center text-[#344054] text-[14px] w-[120px] px-[24px]">
                <p>{product.rating}</p>
            </div>
        </div>
    );
};

const ReviewsView = ({ shopId }: { shopId: number }) => {
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://digitalmarket.benuestate.gov.ng/api/review/get-shop?shopId=${shopId}`
                );
                setReviews(response.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
                toast.error('Failed to fetch reviews');
            } finally {
                setLoading(false);
            }
        };

        if (shopId) {
            fetchReviews();
        }
    }, [shopId]);

    // Convert API reviews to product format for display
    const products: ProductReview[] = reviews.map(review => ({
        id: review.id,
        image: iPhone, // You might want to use review.productUrl here if you have actual product images
        name: review.productName,
        rating: review.rating,
        comment: review.comment,
        productUrl: review.productUrl,
        productName: review.productName,
        reviewerProfileUrl: review.reviewerProfileUrl,
        reviewerFirstName: review.reviewerFirstName,
        reviewerLastName: review.reviewerLastName

    }));

    const REVIEWS_PER_PAGE = 5;
    const totalPages = Math.ceil(products.length / REVIEWS_PER_PAGE);
    const currentReviews = products.slice(
        (currentPage - 1) * REVIEWS_PER_PAGE,
        currentPage * REVIEWS_PER_PAGE
    );

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <div className="p-4">
                <ReviewsSkeleton itemCount={5} />
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return <div className="p-4 text-center">No reviews found.</div>;
    }

    return (
        <div className="flex flex-col gap-[50px]">
            <div className="flex flex-col rounded-[24px] border-[1px] border-[#EAECF0]">
                <div className="my-[20px] mx-[25px] flex flex-col">
                    <p className="text-[#101828] font-medium">Reviews ({reviews.length})</p>
                    <p className="text-[#667085] text-[14px]">View reviews on products in your store</p>
                </div>

                <div className="flex h-[44px] bg-[#F9FAFB] border-b-[1px] border-[#EAECF0]">
                    <div className="flex items-center px-[24px] w-[480px] py-[12px] gap-[4px]">
                        <p className="text-[#667085] font-medium text-[12px]">Products</p>
                        <Image src={arrowDown} alt="Sort" width={12} height={12} />
                    </div>
                    <div className="flex items-center px-[24px] w-[120px] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Reviewer</p>
                    </div>
                    <div className="flex items-center px-[15px] w-[430px] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Comment</p>
                    </div>
                    <div className="flex items-center px-[24px] w-[120px] py-[12px]">
                        <p className="text-[#667085] font-medium text-[12px]">Rating</p>
                    </div>
                </div>

                <div className="flex flex-col">
                    {currentReviews.map((product, index) => (
                        <ProductTableRow
                            key={product.id}
                            product={product}
                            isLast={index === currentReviews.length - 1}
                        />
                    ))}
                </div>

                {products.length > 0 && (
                    <div className="flex justify-between items-center mt-4 px-6 pb-6">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-md ${
                                currentPage === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-[#022B23] hover:bg-gray-100'
                            }`}
                        >
                            Previous
                        </button>

                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-8 h-8 rounded-md flex items-center justify-center ${
                                        currentPage === page
                                            ? 'bg-[#022B23] text-white'
                                            : 'text-[#022B23] hover:bg-gray-100'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-md ${
                                currentPage === totalPages
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-[#022B23] hover:bg-gray-100'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsView;