import { z } from 'zod';

// Базовые переиспользуемые правила
export const emailSchema = z.string().min(1, 'Email обязателен').pipe(z.email('Введите корректный email адрес'));

export const passwordSchema = z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/[a-zA-Z]/, 'Пароль должен содержать хотя бы одну букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру');

export const phoneSchema = z
    .string()
    .min(18, 'Введите полный номер телефона') // Длина маски "+7 (000) 000 00-00"
    .refine((val) => !val.includes('_'), 'Введите полный номер телефона');

export const fullNameSchema = z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Слишком длинное имя');

const mediaSchema = z
    .object({
        id: z.number(),
    })
    .catchall(z.any());

export const productSchema = z.object({
    title: z.string().min(1, 'Введите название товара'),
    description: z.string().optional().nullable(),
    category: z.union([z.number(), z.string()]).optional().nullable(),
    gallery: z.array(
        z.object({
            id: z.string().nullable().optional(),
            // Может быть id (number) при создании или объектом Media при редактировании
            image: z.union([z.number(), mediaSchema]).nullable().optional(),
        }),
    ),
});

// TODO: Пока не валидируем строго, тк не знаем всех полей
export const authorWelcomeSchema = z.object({
    content: z.string().optional(),
});
