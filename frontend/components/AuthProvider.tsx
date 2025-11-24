'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Skip auth check for login page
        if (pathname === '/login') return;

        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [pathname, router]);

    return <>{children}</>;
}
