// app/unauthorized/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';

const Unauthorized = () => {
    const router = useRouter();
    return (
        <div className="h-screen">
            <div className="p-6">
                <BackButton variant="default" text="Go back" />
            </div>
            <div className="flex flex-col items-center justify-center h-full -mt-20">
                <h1 className="text-2xl font-bold">Unauthorized Access</h1>
                <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => router.back()}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-[#033228] text-[#C6EB5F] px-4 py-2 rounded hover:bg-[#044d35] transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;