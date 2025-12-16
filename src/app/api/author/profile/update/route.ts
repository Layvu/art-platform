import { NextResponse } from 'next/server';

import { authorAuthService } from '@/services/api/author-auth-service';
import { payloadServerAuthService } from '@/services/api/payload-server-auth.service';
import { UserType } from '@/shared/types/auth.interface';

export async function PATCH(req: Request) {
    // Получаем текущего пользователя
    const user = await payloadServerAuthService.getCurrentUser();

    if (!user?.id) {
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (user.role !== UserType.AUTHOR) {
        return NextResponse.json({ error: 'Доступ только для авторов' }, { status: 401 });
    }

    const body = await req.json();
    try {
        // Обновляем профиль
        const { id, ...updates } = body;
        await authorAuthService.updateAuthorProfile(id, updates);

        return NextResponse.json({
            success: true,
            message: 'Профиль успешно обновлен',
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ success: false, message: 'Ошибка при обновлении профиля' }, { status: 500 });
    }
}
