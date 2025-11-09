import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { authorAuthService } from '@/services/api/author-auth-service';
import { UserType } from '@/shared/types/auth.interface';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id || session.user.type !== UserType.AUTHOR) {
        return NextResponse.json({ error: 'Доступ только для авторов' }, { status: 401 });
    }

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
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id || session.user.type !== UserType.AUTHOR) {
        return NextResponse.json({ error: 'Доступ только для авторов' }, { status: 401 });
    }

    const productId = id;

    try {
        await authorAuthService.deleteAuthorProduct(productId);
        return NextResponse.json({ success: true, message: 'Товар удален' });
    } catch (error) {
        console.error('Delete product error:', error);
        return NextResponse.json({ error: 'Ошибка удаления товара' }, { status: 500 });
    }
}
