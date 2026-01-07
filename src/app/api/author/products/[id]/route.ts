import { NextResponse } from 'next/server';

import { authServerService } from '@/services/api/server/auth-server.service';
import { authorServerService } from '@/services/api/server/author-server.service';
import { UserType } from '@/shared/types/auth.interface';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    // Получаем текущего пользователя
    const user = await authServerService.getCurrentUser();

    if (!user?.id) {
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (user.role !== UserType.AUTHOR) {
        return NextResponse.json({ error: 'Доступ только для авторов' }, { status: 401 });
    }

    const { id } = await params;

    const productId = Number(id);
    const body = await req.json();

    try {
        const updatedProduct = await authorServerService.updateAuthorProduct(productId, body);
        return NextResponse.json({ product: updatedProduct });
    } catch (error) {
        console.error('Update product error:', error);
        return NextResponse.json({ error: 'Ошибка обновления товара' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    // Получаем текущего пользователя
    const user = await authServerService.getCurrentUser();

    if (!user?.id) {
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    if (user.role !== UserType.AUTHOR) {
        return NextResponse.json({ error: 'Доступ только для авторов' }, { status: 401 });
    }

    const { id } = await params;

    const productId = Number(id);

    try {
        await authorServerService.deleteAuthorProduct(productId);
        return NextResponse.json({ success: true, message: 'Товар удален' });
    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json({ error: 'Ошибка удаления товара' }, { status: 500 });
    }
}
