import { NextResponse } from 'next/server';

import { authServerService } from '@/services/api/server/auth-server.service';
import { customerServerService } from '@/services/api/server/customer-server.service';
import { type ICredentials, UserType } from '@/shared/types/auth.interface';

export async function PATCH(req: Request) {
    // Получаем текущего пользователя
    const user = await authServerService.getCurrentUser();

    if (!user?.id) {
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (user.role !== UserType.CUSTOMER) {
        return NextResponse.json({ error: 'Доступ только для покупателей' }, { status: 401 });
    }

    const body = await req.json();
    try {
        // Обновляем профиль
        const { password, email } = body;

        // Получаем профиль покупателя для обновления
        const customer = await customerServerService.getCustomerByUserId(user.id);

        // Обновляем данные покупателя в коллекции customers
        await customerServerService.updateCustomerProfile(customer.id, body);

        // Если есть пароль или email, обновляем запись в коллекции users
        if (password || email) {
            const userCredentialsUpdates: ICredentials = {};

            if (email) userCredentialsUpdates.email = email;
            if (password) userCredentialsUpdates.password = password;

            await authServerService.updateUserCredentials(user.id, userCredentialsUpdates);
        }

        return NextResponse.json({
            success: true,
            message: 'Профиль успешно обновлен',
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ success: false, message: 'Ошибка при обновлении профиля' }, { status: 500 });
    }
}
