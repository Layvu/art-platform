import { redirect } from 'next/navigation';

import { PAGES } from '@/config/public-pages.config';
import { payloadServerAuthService } from '@/services/api/payload-server-auth.service';
import { UserType } from '@/shared/types/auth.interface';

import AuthorProfileUI from './AuthorProfileUI';
import CustomerProfileUI from './CustomerProfileUI';

export default async function ProfilePage() {
    // Получаем текущего пользователя через серверный метод
    const user = await payloadServerAuthService.getCurrentUser();

    // Если пользователь не авторизован - редирект на логин
    if (!user?.id) {
        redirect(PAGES.LOGIN);
    }

    // Разделяем логику по типу пользователя
    // Для авторов
    if (user.role === UserType.AUTHOR) {
        try {
            const author = await payloadServerAuthService.getAuthorData(user.id);
            if (!author) {
                console.error('Author profile not found');
            }

            const products = await payloadServerAuthService.getAuthorProducts(author.id);

            return <AuthorProfileUI authorData={author} products={products || []} />;
        } catch (error) {
            console.error('Error loading author data:', error);
        }
    }

    // Для покупателей
    if (user.role === UserType.CUSTOMER) {
        try {
            const customer = await payloadServerAuthService.getCustomerData(user.id);
            if (!customer) {
                console.error('Customer profile not found');
            }

            return <CustomerProfileUI customerData={customer} />;
        } catch (error) {
            console.error('Error loading customer data:', error);
        }
    }

    // Если роль неизвестна или это админ
    redirect(PAGES.LOGIN);
}

// TODO: Метатеги
