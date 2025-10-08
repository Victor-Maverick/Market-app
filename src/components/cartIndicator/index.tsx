'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import cartIcon from '../../../public/assets/images/cart.svg';
import { useEffect, useState } from 'react';

const CartIndicator = () => {
    const { cartItems, getTotalItems } = useCart();
    const router = useRouter();
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        // Only show indicator if there are items in cart
        setTotalItems(getTotalItems());
    }, [cartItems, getTotalItems]);

    if (!totalItems) {
        return null;
    }
    return (
        <div
            className="fixed bottom-22 right-7 z-50 flex items-center justify-center cursor-pointer"
            onClick={() => router.push('/cart')}
            aria-label={`Cart with ${totalItems} items`}
        >
            <div className="relative flex items-center justify-center w-12 h-12 bg-[#F9F9F9] rounded-full border-[0.5px] border-[#ededed] hover:bg-[#e5e5e5] transition-colors">
                <Image src={cartIcon} alt="Cart" width={24} height={24} />
                <span className="absolute -top-3 -right-2 bg-[#022B23] text-[#C6EB5F] text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                </span>
            </div>
        </div>
    );
};

export default CartIndicator;