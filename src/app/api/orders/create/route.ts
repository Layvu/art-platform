import { NextResponse } from 'next/server';

import { authServerService } from '@/services/api/server/auth-server.service';
import { customerServerService } from '@/services/api/server/customer-server.service';
import { orderServerService } from '@/services/api/server/order-server.service';
import { UserType } from '@/shared/types/auth.interface';
import type { IOrderCreateRequest } from '@/shared/types/order.interface';

export async function POST(req: Request) {
    try {
        // Получаем текущего пользователя
        const user = await authServerService.getCurrentUser();

        if (!user?.id) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        if (user.role !== UserType.CUSTOMER) {
            return NextResponse.json(
                { error: 'Заказы могут оформлять только авторизованные покупатели' },
                { status: 403 },
            );
        }

        // Пересчитываем данные заказа для безопасности
        const body = (await req.json()) as IOrderCreateRequest;

        // Находим профиль покупателя (Customer) по ID пользователя (User)
        const customer = await customerServerService.getCustomerByUserId(user.id);

        // Сервис сам подготивит данные заказа: запросит товары, проверит их актуальные данные и посчитает общую сумму
        // Необходимо, чтобы защититься от подмены запроса со стороны клиента
        const preparedOrderData = await orderServerService.prepareOrder(customer.id, body);
        const newOrder = await orderServerService.createOrder(preparedOrderData);

        return NextResponse.json({
            success: true,
            order: newOrder,
        });
    } catch (error) {
        console.error('Order creation error:', error);
        // Если ошибка пришла из сервиса (например "Товар не найден") - отправляем её клиенту
        const message = error instanceof Error ? error.message : 'Ошибка при создании заказа';
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}
