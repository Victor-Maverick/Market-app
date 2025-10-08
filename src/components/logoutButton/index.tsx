// app/components/LogoutButton.tsx
'use client';
import { useLogoutHandler } from '@/hooks/useLogoutHandler';

const LogoutButton = () => {
    const { handleLogout } = useLogoutHandler();
    
    return (
        <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
        >
            Sign Out
        </button>
    );
};

export default LogoutButton;