import NextAuth from 'next-auth';

import { authOptions } from '@/lib/auth';

// Необходим для работы с Session
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
