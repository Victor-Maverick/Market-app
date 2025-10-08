'use client'
import dynamic from 'next/dynamic';

const AdminSettingsClient = dynamic(() => import('@/components/AdminSettingsClient'), {
    ssr: false
});

export default function Transactions() {
    return <AdminSettingsClient />;
}
