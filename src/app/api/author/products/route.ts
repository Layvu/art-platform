import { NextResponse } from 'next/server';

import { authorAuthService } from '@/services/api/author-auth-service';
import { payloadServerAuthService } from '@/services/api/payload-server-auth.service';
import { UserType } from '@/shared/types/auth.interface';
import type { IProductCreateInput } from '@/shared/types/product.type';

export async function POST(req: Request) {
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
        // Ищем автора по Id пользователя
        const author = await payloadServerAuthService.getAuthorData(user.id);

        const productData: IProductCreateInput = {
            ...body,
            author: author.id,
        };

        const newProduct = await authorAuthService.createAuthorProduct(productData);
        return NextResponse.json({ product: newProduct });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json({ error: 'Ошибка создания товара' }, { status: 500 });
    }
}
