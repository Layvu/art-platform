import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { PAGES } from '@/config/public-pages.config';
import { authOptions } from '@/lib/auth';
import { authorAuthService } from '@/services/api/author-auth-service';
import { customerAuthService } from '@/services/api/customer-auth-service';
import { UserType } from '@/shared/types/auth.interface';

import AuthorProfileUI from './AuthorProfileUI';
import CustomerProfileUI from './CustomerProfileUI';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    // Если пользователь не авторизован - редирект на логин
    if (!session?.user?.id) {
        redirect(PAGES.LOGIN);
    }

    // Разделяем логику по типу пользователя
    // Для авторов
    if (session.user.type === UserType.AUTHOR) {
        if (!session.user.authorId) {
            console.error('Author ID not found in session');
            redirect(PAGES.LOGIN);
        }

        try {
            const author = await authorAuthService.getAuthorById(session.user.authorId);
            const products = await authorAuthService.getAuthorProducts(session.user.authorId);

            return <AuthorProfileUI authorData={author} products={products || []} />;
        } catch (error) {
            console.error('Error loading author data:', error);
            redirect(PAGES.LOGIN);
        }
    }

    // Для покупателей
    if (!session.user.id) {
        console.error('Customer ID not found in session');
        redirect(PAGES.LOGIN);
    }

    try {
        const customer = await customerAuthService.getCustomerById(session.user.id);

        return <CustomerProfileUI customerData={customer} />;
    } catch (error) {
        console.error('Error loading customer data:', error);
        redirect(PAGES.LOGIN);
    }
}

// TODO: Метатеги
