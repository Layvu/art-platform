import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { customerAuthService } from '@/services/api/customer-auth-service';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await req.json();
    try {
        const updatedCustomer = await customerAuthService.updateCustomerProfile(session.user.id, body);

        return NextResponse.json({
            success: true,
            message: 'Профиль успешно обновлен',
            customer: updatedCustomer,
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ success: false, message: 'Ошибка при обновлении профиля' }, { status: 500 });
    }
}
