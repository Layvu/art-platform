import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { authorAuthService } from '@/services/api/author-auth-service';
import { UserType } from '@/shared/types/auth.interface';

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.type !== UserType.AUTHOR) {
        return NextResponse.json({ error: 'Доступ только для авторов' }, { status: 401 });
    }
    if (!session.user.authorId) {
        return NextResponse.json({ error: 'ID автора не найден' }, { status: 400 });
    }

    const body = await req.json();
    try {
        const updatedAuthor = await authorAuthService.updateAuthorProfile(session.user.authorId, body);

        return NextResponse.json({
            success: true,
            message: 'Профиль успешно обновлен',
            author: updatedAuthor,
        });
    } catch (error) {
        console.error('Author profile update error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Ошибка при обновлении профиля автора',
            },
            { status: 500 },
        );
    }
}
