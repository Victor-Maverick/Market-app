// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                try {
                    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
                        email: credentials.email,
                        password: credentials.password,
                    });

                    const loginData = response.data.data;
                    console.log('Login response data:', loginData);

                    if (loginData && loginData.token) {
                        return {
                            id: loginData.id || credentials.email,
                            email: credentials.email,
                            accessToken: loginData.token,
                            roles: loginData.roles || [],
                            firstName: loginData.firstName || '',
                            lastName: loginData.lastName || '',
                        };
                    }
                    throw new Error('Invalid login response from server');
                } catch (error) {
                    console.error('Authorize error:', error);
                    throw new Error(
                        axios.isAxiosError(error)
                            ? error.response?.data?.message || 'Invalid email or password'
                            : 'An unexpected error occurred'
                    );
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.accessToken = user.accessToken;
                token.roles = user.roles;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.accessToken = token.accessToken;
                session.user.roles = token.roles;
                session.user.firstName = token.firstName;
                session.user.lastName = token.lastName;
            }
            return session;
        },
    },
    // events: {
    //     async signOut({ token }) {
    //         // Call logout API when user signs out
    //         try {
    //             await axios.post('https://digitalmarket.benuestate.gov.ng/api/auth/logout', {}, {
    //                 headers: {
    //                     Authorization: `Bearer ${token.accessToken}`
    //                 }
    //             });
    //         } catch (error) {
    //             console.error('Logout error:', error);
    //         }
    //     },
    // },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };