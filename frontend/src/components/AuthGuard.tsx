'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, memo } from 'react';
import { getCurrentUser } from '@/services/authService';

const AuthGuard = memo(({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const user = getCurrentUser();
            if (!user) {
                router.push('/login');
            } else {
                setIsAuthenticated(true);
            }
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <>{children}</>;
});

AuthGuard.displayName = 'AuthGuard';

export default AuthGuard;
