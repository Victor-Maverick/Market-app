// app/providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/context/CartContext';
import { OnboardingProvider } from '@/context/LogisticsOnboardingContext';

import { UserPresenceProvider } from '@/providers/UserPresenceProvider';
import { EmailVerificationProvider } from '@/providers/EmailVerificationProvider';
import { CallPresenceProvider } from '@/providers/CallPresenceProvider';
import { PusherProvider } from '@/providers/PusherProvider';

import { LogoutProvider } from '@/contexts/LogoutContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import DraggableCartIndicator from "@/components/cartIndicator";

import LogoutSpinner from "@/components/LogoutSpinner";
import NavigationSpinner from "@/components/NavigationSpinner";
import CallManager from "@/components/CallManager";
import NotificationOverlay from "@/components/NotificationOverlay";

import { GlobalLoadingOverlay } from "@/components/GlobalLoadingOverlay";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <LoadingProvider>
                <LogoutProvider>
                    <NavigationProvider>
                        <EmailVerificationProvider>
                            <OnboardingProvider>
                                <CartProvider>
                                    <UserPresenceProvider>
                                        <PusherProvider>
                                            <CallPresenceProvider>
                                                {children}
                                                <DraggableCartIndicator />
                                                <LogoutSpinner />
                                                <NavigationSpinner />
                                                <GlobalLoadingOverlay />
                                                <CallManager />
                                                <NotificationOverlay />
                                            </CallPresenceProvider>
                                        </PusherProvider>
                                    </UserPresenceProvider>
                                </CartProvider>
                            </OnboardingProvider>
                        </EmailVerificationProvider>
                    </NavigationProvider>
                </LogoutProvider>
            </LoadingProvider>
        </SessionProvider>
    );
}