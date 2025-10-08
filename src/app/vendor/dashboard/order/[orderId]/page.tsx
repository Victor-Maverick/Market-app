'use client'
import dynamic from 'next/dynamic';
import { CallPresenceProvider } from '@/providers/CallPresenceProvider';
import VendorShopGuard from '@/components/VendorShopGuard';

const VendorOrderDetailsById = dynamic(() => import('@/components/VendorOrderDetailsById'), {
    ssr: false
});

export default function OrderDetails() {
    return (
        <VendorShopGuard showSubHeader={false}>
            <CallPresenceProvider>
                <VendorOrderDetailsById layout="dashboard" />
            </CallPresenceProvider>
        </VendorShopGuard>
    );
}