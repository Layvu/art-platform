import { NextResponse } from 'next/server';

import { authServerService } from '@/services/api/server/auth-server.service';
import { authorServerService } from '@/services/api/server/author-server.service';
import { UserType } from '@/shared/types/auth.interface';

export async function PATCH(req: Request) {
    // Получаем текущего пользователя
    const user = await authServerService.getCurrentUser();

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
        await authorServerService.updateAuthorProfile(id, updates);

        return NextResponse.json({
            success: true,
            message: 'Профиль успешно обновлен',
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ success: false, message: 'Ошибка при обновлении профиля' }, { status: 500 });
    }
}
