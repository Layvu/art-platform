import CartUI from '@/components/cart/CartUI';
import { authServerService } from '@/services/api/server/auth-server.service';

export default async function CartPage() {
    // Получаем текущего пользователя через серверный метод
    const user = await authServerService.getCurrentUser();
    const isUserAuthorized = !!user;

    return <CartUI isUserAuthorized={isUserAuthorized} />;
}
