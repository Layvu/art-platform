import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { PAGES } from '@/config/public-pages.config';
import { authOptions } from '@/lib/auth';
import { authService } from '@/services/api/auth-service';

import ProfileUI from './ProfileUI';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    // Если пользователь не авторизован - редирект на логин
    if (!session?.user?.id) {
        redirect(PAGES.LOGIN);
    }

    const customer = await authService.getCustomerById(session.user.id);

    return <ProfileUI customerData={customer} />;
}

// TODO: Метатеги
