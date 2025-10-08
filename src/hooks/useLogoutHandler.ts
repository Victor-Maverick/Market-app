'use client';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import axios from 'axios';
import { useLogout } from '@/contexts/LogoutContext';

export const useLogoutHandler = () => {
  const router = useRouter();
  const { setIsLoggingOut } = useLogout();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // First call the backend logout endpoint
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('BDICAuthToken')}`,
          },
        }
      );
    } catch (error) {
      console.error('Backend logout failed:', error);
    }

    try {
      // Clear client-side authentication
      await signOut({ redirect: false });
      localStorage.removeItem('BDICAuthToken');
      localStorage.removeItem('userEmail');
      
      // Add a small delay to show the spinner
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force a hard redirect to ensure complete logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Client logout failed:', error);
      // Fallback to router if window.location fails
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { handleLogout };
};