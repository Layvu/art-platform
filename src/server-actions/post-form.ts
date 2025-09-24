'use server';

import config from '@payload-config';
import { getPayload } from 'payload';

export async function postForm(formData: FormData) {
    const content = formData.get('content') as string;

    const payload = await getPayload({ config });

    await payload.create({
        collection: 'forms',
        data: {
            content,
        },
    });

    console.log('Анкета сохранена:', content);
}
