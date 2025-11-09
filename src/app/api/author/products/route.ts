import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { authorAuthService } from '@/services/api/author-auth-service';
import { UserType } from '@/shared/types/auth.interface';
import type { IProductCreateInput } from '@/shared/types/product.type';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.type !== UserType.AUTHOR) {
        return NextResponse.json({ error: 'Доступ только для авторов' }, { status: 401 });
    }

    if (!session.user.authorId) {
        return NextResponse.json({ error: 'ID автора не найден' }, { status: 400 });
    }

    try {
        const products = await authorAuthService.getAuthorProducts(session.user.authorId);
        return NextResponse.json({ products: products });
    } catch (error) {
        console.error('Get author products error:', error);
        return NextResponse.json({ error: 'Ошибка загрузки товаров' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.type !== UserType.AUTHOR) {
        return NextResponse.json({ error: 'Доступ только для авторов' }, { status: 401 });
    }

    const body = await req.json();
    try {
        // Передаем authorId при создании товара, чтобы гарантировать, что автор будет задан
        const productData: IProductCreateInput = {
            ...body,
            author: session.user.authorId,
        };
        const newProduct = await authorAuthService.createAuthorProduct(productData);
        return NextResponse.json({ product: newProduct });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json({ error: 'Ошибка создания товара' }, { status: 500 });
    }
}
