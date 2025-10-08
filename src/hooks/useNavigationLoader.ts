'use client';
import { useNavigation } from '@/contexts/NavigationContext';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useNavigationLoader = () => {
  const { setIsNavigating, setNavigationMessage } = useNavigation();
  const router = useRouter();

  const navigateWithLoader = useCallback((
    path: string, 
    message: string = 'Loading...',
    delay: number = 100
  ) => {
    setNavigationMessage(message);
    setIsNavigating(true);
    
    // Small delay to ensure spinner shows before navigation
    setTimeout(() => {
      router.push(path);
      // Hide spinner after a short delay to allow page to start loading
      setTimeout(() => {
        setIsNavigating(false);
      }, 500);
    }, delay);
  }, [router, setIsNavigating, setNavigationMessage]);

  const replaceWithLoader = useCallback((
    path: string, 
    message: string = 'Loading...',
    delay: number = 100
  ) => {
    setNavigationMessage(message);
    setIsNavigating(true);
    
    setTimeout(() => {
      router.replace(path);
      setTimeout(() => {
        setIsNavigating(false);
      }, 500);
    }, delay);
  }, [router, setIsNavigating, setNavigationMessage]);

  const showLoader = useCallback((message: string = 'Loading...') => {
    setNavigationMessage(message);
    setIsNavigating(true);
  }, [setIsNavigating, setNavigationMessage]);

  const hideLoader = useCallback(() => {
    setIsNavigating(false);
  }, [setIsNavigating]);

  return {
    navigateWithLoader,
    replaceWithLoader,
    showLoader,
    hideLoader
  };
};