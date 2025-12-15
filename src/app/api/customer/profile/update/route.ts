import { NextResponse } from 'next/server';

import { customerAuthService } from '@/services/api/customer-auth-service';
import { payloadServerAuthService } from '@/services/api/payload-server-auth.service';
import { type ICredentials, UserType } from '@/shared/types/auth.interface';

export async function PATCH(req: Request) {
    // Получаем текущего пользователя
    const user = await payloadServerAuthService.getCurrentUser();

    if (!user?.id) {
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (user.role !== UserType.CUSTOMER) {
        return NextResponse.json({ error: 'Доступ только для покупателей' }, { status: 401 });
    }

    const body = await req.json();
    try {
        // Обновляем профиль
        const { id, ...updates } = body;
        const { password, email } = updates;

        // Обновляем данные покупателя в коллекции customers
        await customerAuthService.updateCustomerProfile(id, updates);

        // Если есть пароль или email, обновляем запись в коллекции users
        if (password || email) {
            const userCredentialsUpdates: ICredentials = {};

            if (email) userCredentialsUpdates.email = email;
            if (password) userCredentialsUpdates.password = password;

            await payloadServerAuthService.updateUserCredentials(user.id, userCredentialsUpdates);
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
