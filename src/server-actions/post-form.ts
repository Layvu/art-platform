'use server';

import { getPayload } from 'payload';
import config from '@payload-config';

export async function postForm(formData: FormData) {
    const content = formData.get('content');

    // TODO: Добавить сохранение письма в Payload
    // const payload = await getPayload({ config });

    // await payload.create({
    //     collection: 'forms',
    //     data: {
    //         content,
    //     },
    // });

    console.log('На бэк отправляем заявку:', content);
}
