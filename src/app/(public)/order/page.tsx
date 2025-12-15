import { redirect } from 'next/navigation';

import { PAGES } from '@/config/public-pages.config';
import { customerAuthService } from '@/services/api/customer-auth-service';
import { payloadServerAuthService } from '@/services/api/payload-server-auth.service';
import { UserType } from '@/shared/types/auth.interface';

import OrderUI from './OrderUI';

export default async function OrderPage() {
    const user = await payloadServerAuthService.getCurrentUser();

    // Защита роута - страница доступна только авторизованным пользователям
    // TODO: вынести guard для защит роутов
    if (!user?.id || user.role !== UserType.CUSTOMER) {
        redirect(PAGES.LOGIN);
    }

    // Получаем данные покупателя
    const customer = await customerAuthService.getCustomerByUserId(user.id);

    return <OrderUI customer={customer} />;
}
