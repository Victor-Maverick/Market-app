'use client'
import dynamic from 'next/dynamic';
import { CallPresenceProvider } from '@/providers/CallPresenceProvider';
import VendorShopGuard from '@/components/VendorShopGuard';

const ShopClient = dynamic(() => import('@/components/shopClient'), {
    ssr: false
});

export default function Shop() {
    return (
        <VendorShopGuard showSubHeader={false}>
            <CallPresenceProvider>
                <ShopClient />
            </CallPresenceProvider>
        </VendorShopGuard>
    );
}