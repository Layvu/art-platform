import { DefaultSession } from 'next-auth';

import type { UserRole } from '../auth.interface';

// Расширение типов NextAuth
declare module 'next-auth' {
    interface Session {
        user: {
            id: string; // customerUserId | authorUserId из Payload
            type: UserRole;
            authorId?: number; // только для авторов - связь с коллекцией authors
            // Number - т.к. Payload type Product с authorId = number
        } & DefaultSession['user'];
    }

    interface User {
        id: string;
        type: UserRole;
        authorId?: number; // только для авторов
    }
}
