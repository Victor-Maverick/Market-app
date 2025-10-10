'use client'
import { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useSession } from 'next-auth/react';

interface ProductReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: number;
    productName: string;
    productImage?: string;
}

const ProductReviewModal = ({ isOpen, onClose, productId, productName, productImage }: ProductReviewModalProps) => {
    const { data: session } = useSession();
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!session?.user?.email) {
            toast.error('Please log in to submit a review');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/reviews/review-product`,
                {
                    email: session.user.email,
                    productId: productId,
                    rating: rating,
                    comment: comment
                }
            );

            toast.success(response.data || 'Review submitted successfully!');
            onClose();
            setRating(0);
            setComment('');
        } catch (error: any) {
            const errorMessage = error.response?.data || error.message || 'Failed to submit review';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
        setRating(0);
        setHoverRating(0);
        setComment('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/20">
            <div className="bg-white rounded-lg p-[30px] w-full max-w-md mx-4">
                <div className="flex border-b-[0.5px] pb-3 border-[#ededed] justify-between items-center">
                    <h2 className="text-[16px] text-[#022B23] font-medium">Review Product</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-xl">
                        &times;
                    </button>
                </div>

                <div className="mt-4">
                    {/* Product Info */}
                    <div className="mb-4 flex items-center gap-3">
                        {productImage && (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                    src={productImage} 
                                    alt={productName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div>
                            <h3 className="text-[14px] font-medium text-gray-900">{productName}</h3>
                        </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="text-2xl focus:outline-none transition-colors"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    {star <= (hoverRating || rating) ? (
                                        <span className="text-yellow-500">★</span>
                                    ) : (
                                        <span className="text-gray-300">★</span>
                                    )}
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-500">
                                {hoverRating || rating > 0 ? `${hoverRating || rating}.0` : 'Rate this product'}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Review (Optional)
                        </label>
                        <textarea
                            id="review-comment"
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#022B23]"
                            placeholder="Share your experience with this product..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0 || isSubmitting}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                                rating === 0 || isSubmitting 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-[#022B23] hover:bg-[#033a30]'
                            }`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductReviewModal;