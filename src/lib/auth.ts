import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { PAGES } from '@/config/public-pages.config';
import { authService } from '@/services/api/auth-service';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                try {
                    const result = await authService.authenticate(credentials.email, credentials.password);

                    if (!result.success || !result.user) {
                        return null;
                    }

                    // Для работы с сессией нам достаточно хранить только Id
                    return {
                        id: result.user.id,
                    };
                } catch (err) {
                    console.error('Error authorizing:', err);
                    return null;
                }
            },
        }),
    ],

    callbacks: {
        // Вызывается при создании/обновлении JWT токена
        async jwt({ token, user, account, profile }) {
            if (user) {
                token.id = user.id;
            }
            return token; // Этот token будет сохранен в cookie
        },

        // Вызывается при каждом запросе сессии
        async session({ session, token }) {
            // Передаем id из JWT в сессию

            if (session.user) {
                // Расширяем сессию данными из JWT
                session.user.id = token.id as string;
            }
            return session;
        },
    },

    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 дней
    },

    secret: process.env.NEXTAUTH_SECRET,

    pages: {
        signIn: PAGES.LOGIN,
    },
};

// При логине:
// authorize() из authOptions -> получаем user = { id: "123" } -> jwt() -> возвращает token = { id: "123" } ->
// session() -> возвращает session = { user: { id: "123" } }

// При последующих запросах:
// jwt() получает token = { id: "123" }, без user -> возвращает тот же token ->
// session() получает token = { id: "123" } -> возвращает session = { user: { id: "123" } }
