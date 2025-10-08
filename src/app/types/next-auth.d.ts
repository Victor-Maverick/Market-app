// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        email: string;
        accessToken: string;
        roles: string[];
        firstName: string;
        lastName: string;
    }

    interface Session {
        user: User;
        accessToken: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        accessToken: string;
        roles: string[];
        firstName: string;
        lastName: string;
    }
}