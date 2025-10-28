import { DefaultSession, DefaultUser } from 'next-auth';

// Расширение типов NextAuth
declare module 'next-auth' {
    interface Session {
        user: {
            id: string; // customerId из Payload
        } & DefaultSession['user'];
    }
}
