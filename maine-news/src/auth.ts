import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID,
            clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const adminEmail = process.env.ADMIN_EMAIL;
                const adminPassword = process.env.ADMIN_PASSWORD;

                if (credentials?.email === adminEmail && credentials?.password === adminPassword) {
                    return {
                        id: "1",
                        name: "Admin User",
                        email: adminEmail,
                    };
                }
                return null;
            }
        })
    ],
    secret: process.env.AUTH_SECRET,
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');

            // If the user is on an admin page, they must be logged in
            if (isOnAdmin) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            }

            return true;
        },
    },
    pages: {
        signIn: '/admin/login',
    }
});
