'use server';

import { getPayload } from 'payload';
import type z from 'zod';

import config from '@/payload.config';
import type { authorWelcomeSchema } from '@/shared/validations/schemas';

export async function postForm(data: z.infer<typeof authorWelcomeSchema>) {
    try {
        console.log('Анкета сохранена:', data);

        const payload = await getPayload({ config });
        await payload.create({
            collection: 'forms',
            data: { content: data.content ?? '' },
        });

        return { success: true, message: 'Form submitted successfully' };
    } catch (error) {
        console.error('Form submission error:', error);
        return { success: false, error: 'Failed to submit form' };
    }
}
