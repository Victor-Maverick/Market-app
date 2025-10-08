import { useNavigationLoader } from '@/hooks/useNavigationLoader';

// Common navigation messages for different page types
export const NavigationMessages = {
  DASHBOARD: 'Loading dashboard...',
  MARKETPLACE: 'Loading marketplace...',
  PROFILE: 'Loading profile...',
  SETTINGS: 'Loading settings...',
  LOGIN: 'Redirecting to login...',
  REGISTER: 'Loading registration...',
  FORGOT_PASSWORD: 'Loading password reset...',
  VERIFICATION: 'Redirecting to verification...',
  ADMIN: 'Loading admin panel...',
  VENDOR: 'Loading vendor dashboard...',
  BUYER: 'Loading buyer dashboard...',
  LOGISTICS: 'Loading logistics dashboard...',
  RIDER: 'Loading rider dashboard...',
  ORDERS: 'Loading orders...',
  PRODUCTS: 'Loading products...',
  CART: 'Loading cart...',
  CHECKOUT: 'Loading checkout...',
  DEFAULT: 'Loading...'
} as const;

// Helper function to get appropriate message based on path
export const getNavigationMessage = (path: string): string => {
  if (path.includes('/admin')) return NavigationMessages.ADMIN;
  if (path.includes('/vendor')) return NavigationMessages.VENDOR;
  if (path.includes('/buyer')) return NavigationMessages.BUYER;
  if (path.includes('/logistics')) return NavigationMessages.LOGISTICS;
  if (path.includes('/rider')) return NavigationMessages.RIDER;
  if (path.includes('/dashboard')) return NavigationMessages.DASHBOARD;
  if (path.includes('/marketplace') || path.includes('/marketPlace')) return NavigationMessages.MARKETPLACE;
  if (path.includes('/login')) return NavigationMessages.LOGIN;
  if (path.includes('/register')) return NavigationMessages.REGISTER;
  if (path.includes('/forgot-password')) return NavigationMessages.FORGOT_PASSWORD;
  if (path.includes('/verification') || path.includes('/emailVerification')) return NavigationMessages.VERIFICATION;
  if (path.includes('/profile')) return NavigationMessages.PROFILE;
  if (path.includes('/settings')) return NavigationMessages.SETTINGS;
  if (path.includes('/orders')) return NavigationMessages.ORDERS;
  if (path.includes('/products')) return NavigationMessages.PRODUCTS;
  if (path.includes('/cart')) return NavigationMessages.CART;
  if (path.includes('/checkout')) return NavigationMessages.CHECKOUT;
  
  return NavigationMessages.DEFAULT;
};

// Hook for smart navigation with automatic message detection
export const useSmartNavigation = () => {
  const { navigateWithLoader, replaceWithLoader, showLoader, hideLoader } = useNavigationLoader();

  const smartNavigate = (path: string, customMessage?: string) => {
    const message = customMessage || getNavigationMessage(path);
    navigateWithLoader(path, message);
  };

  const smartReplace = (path: string, customMessage?: string) => {
    const message = customMessage || getNavigationMessage(path);
    replaceWithLoader(path, message);
  };

  return {
    smartNavigate,
    smartReplace,
    showLoader,
    hideLoader,
    navigateWithLoader,
    replaceWithLoader
  };
};