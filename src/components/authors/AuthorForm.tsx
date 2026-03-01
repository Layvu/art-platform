'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { postForm } from '@/server-actions/post-form';
import { authorWelcomeSchema } from '@/shared/validations/schemas';

export function AuthorForm() {
    const form = useForm<z.infer<typeof authorWelcomeSchema>>({
        resolver: zodResolver(authorWelcomeSchema),
        defaultValues: {
            content: '',
        },
    });

    const onSubmit = async (data: z.infer<typeof authorWelcomeSchema>) => {
        const result = await postForm({ content: data.content || '' });

        if (result.success) {
            form.reset({ content: '' });
        } else {
            console.error(result.error);
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full max-w-md p-6 bg-white rounded-xl shadow-md border border-gray-200 space-y-5 mb-10"
            >
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800">Привет, новый автор</h2>
                    <p className="text-sm text-gray-500 mt-1">Расскажи о себе!</p>
                </div>

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Ваше имя</FormLabel>
                            <FormControl>
                                <Input placeholder="Ты кто такой?" className="w-full" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full cursor-pointer">
                    Отправить
                </Button>
            </form>
        </Form>
    );
}
