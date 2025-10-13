import { Session } from 'next-auth';
import { toast } from 'react-toastify';

export const validateSessionAndRedirect = (
    session: Session | null | undefined,
    router: any,
    actionDescription: string = 'perform this action'
): boolean => {
    if (!session?.user?.email) {
        toast.error(`Please log in to ${actionDescription}`, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
        
        // Store current URL for redirect after login
        if (typeof window !== 'undefined') {
            localStorage.setItem('preAuthUrl', window.location.pathname);
        }
        
        router.push('/login');
        return false;
    }
    
    return true;
};

export const getSessionEmail = (session: Session | null | undefined): string | null => {
    return session?.user?.email || null;
};