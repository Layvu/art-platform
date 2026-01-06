import { authServerService } from '@/services/api/server/auth-server.service';

import CartUI from '../../../components/cart/CartUI';

export default async function CartPage() {
    // Получаем текущего пользователя через серверный метод
    const user = await authServerService.getCurrentUser();
    const isUserAuthorized = !!user;

    return <CartUI isUserAuthorized={isUserAuthorized} />;
}
