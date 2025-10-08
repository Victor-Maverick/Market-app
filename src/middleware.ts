// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

interface CustomToken {
    id?: string;
    email?: string;
    accessToken?: string;
    roles?: string[];
}

// Define protected routes and their required roles
const protectedRoutes: Record<string, string[]> = {
    '/admin': ['ADMIN'],
    '/vendor': ['VENDOR', 'ADMIN'], // Admins can access vendor routes
    '/logistics': ['LOGISTICS', 'ADMIN'], // Admins can access logistics
    '/rider': ['RIDER', 'ADMIN'], // Admins can access rider routes
    '/marketplace': ['BUYER', 'VENDOR', 'ADMIN', 'LOGISTICS', 'RIDER'], // All roles can access
    '/cart': ['BUYER', 'VENDOR', 'ADMIN'] // Buyers, vendors and admins can access
};

export async function middleware(req: NextRequest) {
    const token = (await getToken({ req, secret: process.env.NEXTAUTH_SECRET })) as CustomToken | null;

    // Redirect to login if not authenticated
    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check if the user has at least one role
    if (!token.roles || token.roles.length === 0) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    // Find the matching protected route (if any)
    const matchedRoute = Object.keys(protectedRoutes).find(route =>
        req.nextUrl.pathname.startsWith(route)
    );

    if (matchedRoute) {
        const requiredRoles = protectedRoutes[matchedRoute];
        const hasRequiredRole = token.roles.some(role =>
            requiredRoles.includes(role)
        );

        if (!hasRequiredRole) {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
    }
    // Continue if all checks pass or route isn't protected
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/vendor/:path*',
        '/logistics/:path*',
        '/rider/:path*',
        '/marketplace/:path*'
    ],
};