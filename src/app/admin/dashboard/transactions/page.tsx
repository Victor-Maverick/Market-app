'use client'
import dynamic from 'next/dynamic';

const AdminTransactionClient = dynamic(
    () => import('@/components/adminTransactionClient'),
    {
        ssr: false,
        loading: () => <p>Loading...</p> // Optional loading component
    }
);

export default function Transactions() {
    return <AdminTransactionClient />;
}