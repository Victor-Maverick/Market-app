'use client'
import dynamic from 'next/dynamic';
import { CallPresenceProvider } from '@/providers/CallPresenceProvider';
import VendorShopGuard from '@/components/VendorShopGuard';

const OrderClient = dynamic(() => import('@/components/orderClient'), {
    ssr: false
});

export default function Orders() {
    return (
        <VendorShopGuard showSubHeader={false}>
            <CallPresenceProvider>
                <OrderClient />
            </CallPresenceProvider>
        </VendorShopGuard>
    );
}
