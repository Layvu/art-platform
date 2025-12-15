import { payloadServerAuthService } from '@/services/api/payload-server-auth.service';

import CartUI from '../../../components/cart/CartUI';

export default async function CartPage() {
    // Получаем текущего пользователя через серверный метод
    const user = await payloadServerAuthService.getCurrentUser();
    const isUserAuthorized = !!user;

    return <CartUI isUserAuthorized={isUserAuthorized} />;
}
