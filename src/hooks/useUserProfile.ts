'use client'
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
}

export const useUserProfile = () => {
    const { data: session } = useSession();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserProfile = useCallback(async () => {
        if (!session?.user?.email) {
            setUserProfile(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get<UserProfile>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/get-profile?email=${session.user.email}`
            );
            
            setUserProfile(response.data);
        } catch (err) {
            console.error('Error fetching user profile:', err);
            setError('Failed to fetch user profile');
            // Fallback to session data if API fails
            if (session.user) {
                setUserProfile({
                    id: 0,
                    firstName: session.user.firstName || '',
                    lastName: session.user.lastName || '',
                    email: session.user.email || '',
                    imageUrl: ''
                });
            }
        } finally {
            setLoading(false);
        }
    }, [session?.user?.email, session?.user?.firstName, session?.user?.lastName]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    // Refresh function for when profile is updated
    const refreshProfile = useCallback(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    return {
        userProfile,
        loading,
        error,
        refreshProfile
    };
};