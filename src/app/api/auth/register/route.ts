import { NextResponse } from 'next/server';

import { authService } from '@/services/api/auth-service';

// Нам нужен этот эндпоинт, потому что в Payload имеет доступ к пользовательской сессии только на сервере
// => в эндпоинте Payload работает с правильными правами доступа. Аналогично с profile/update
export async function POST(req: Request) {
    const body = await req.json();
    const { email, password, fullName, phone } = body;

    if (!email || !password) {
        return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 });
    }

    try {
        // Проверяем, существует ли пользователь
        const userExists = await authService.checkUserExists(email);
        if (userExists) {
            return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 });
        }

        // Создаём нового покупателя
        const newCustomer = await authService.createCustomer({
            email,
            password,
            fullName,
            phone,
        });

        return NextResponse.json({
            success: true,
            customer: newCustomer,
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}
