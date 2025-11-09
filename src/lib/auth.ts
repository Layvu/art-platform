import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { PAGES } from '@/config/public-pages.config';
import { authorAuthService } from '@/services/api/author-auth-service';
import { customerAuthService } from '@/services/api/customer-auth-service';
import { type UserRole, UserType } from '@/shared/types/auth.interface';
import type { IAuthorSession } from '@/shared/types/author.interface';
import type { ICustomerSession } from '@/shared/types/customer.interface';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'customer',
            name: 'Customer',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const result = await customerAuthService.authenticate(credentials.email, credentials.password);
                if (!result.success || !result.user) {
                    return null;
                }

                // Для работы с сессией нам достаточно хранить только Id и тип пользователя
                return result.user as ICustomerSession;
            },
        }),
        CredentialsProvider({
            id: 'author',
            name: 'Author',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const result = await authorAuthService.authenticate(credentials.email, credentials.password);
                if (!result.success || !result.user) {
                    return null;
                }

                // Минимум данных для сохранения в сессии
                return result.user as IAuthorSession;
            },
        }),
    ],

    callbacks: {
        // Вызывается при создании/обновлении JWT токена
        async jwt({ token, user, trigger }) {
            // Принудительно обновляем токен при signIn
            if (trigger === 'signIn' || trigger === 'signUp') {
                return { ...token, ...user };
            }

            if (user) {
                token.id = user.id;

                token.type = user.type;
                if (user.type === UserType.AUTHOR) {
                    token.authorId = user.authorId;
                }
            }
            return token; // Этот token будет сохранен в cookie
        },

        // Вызывается при каждом запросе сессии
        async session({ session, token }) {
            // Передаем id из JWT в сессию

            if (session.user) {
                // Расширяем сессию данными из JWT
                session.user.id = token.id as string;

                session.user.type = token.type as UserRole;
                if (token.type === UserType.AUTHOR) {
                    session.user.authorId = token.authorId as number;
                }
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
