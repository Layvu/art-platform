import type { TypedUser } from 'payload';

export const isAdmin = (user: TypedUser | null) => {
    return user?.role === 'admin';
};
