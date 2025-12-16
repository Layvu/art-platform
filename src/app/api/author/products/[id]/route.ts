import { NextResponse } from 'next/server';

import { authorAuthService } from '@/services/api/author-auth-service';
import { payloadServerAuthService } from '@/services/api/payload-server-auth.service';
import { UserType } from '@/shared/types/auth.interface';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    // Получаем текущего пользователя
    const user = await payloadServerAuthService.getCurrentUser();

    if (!user?.id) {
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (user.role !== UserType.AUTHOR) {
        return NextResponse.json({ error: 'Доступ только для авторов' }, { status: 401 });
    }

    const { id } = await params;

    const productId = id;
    const body = await req.json();

    try {
        const updatedProduct = await authorAuthService.updateAuthorProduct(productId, body);
        return NextResponse.json({ product: updatedProduct });
    } catch (error) {
        console.error('Update product error:', error);
        return NextResponse.json({ error: 'Ошибка обновления товара' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    // Получаем текущего пользователя
    const user = await payloadServerAuthService.getCurrentUser();

    if (!user?.id) {
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (user.role !== UserType.AUTHOR) {
        return NextResponse.json({ error: 'Доступ только для авторов' }, { status: 401 });
    }

    const { id } = await params;

    const productId = id;

    try {
        await authorAuthService.deleteAuthorProduct(productId);
        return NextResponse.json({ success: true, message: 'Товар удален' });
    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json({ error: 'Ошибка удаления товара' }, { status: 500 });
    }
}
