'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type z from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { authorFullSchema, type AuthorWelcomeValues } from '@/shared/validations/schemas';

import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const shelfOptions = [
    { id: '6', label: '6 уровень (верхняя полка) - 1100 р.' },
    { id: '5', label: '5 уровень (верхний уровень глаз) - 2500 р.' },
    { id: '4', label: '4 уровень (нижний уровень глаз) - 2500 р.' },
    { id: '3', label: '3 уровень (средняя полка) - 1500 р.' },
    { id: '2', label: '2 уровень (нижняя полка) - 1100 р.' },
    { id: '1', label: '1 уровень (нижняя полка) - 900 р.' },
];

export default function Step3Shelves({
    defaultValues,
    onSubmit,
    onBack,
}: {
    defaultValues: Partial<AuthorWelcomeValues>;
    onSubmit: (values: Partial<AuthorWelcomeValues>) => Promise<void>;
    onBack: () => void;
}) {
    const form = useForm<z.infer<typeof authorFullSchema>>({
        resolver: zodResolver(authorFullSchema),
        defaultValues,
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-3">
                    <FormLabel className="font-semibold text-xl">Выбор полочки</FormLabel>

                    {shelfOptions.map((shelf) => (
                        <FormField
                            name="shelves"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <div key={shelf.id} className="flex gap-2">
                                        <Checkbox
                                            checked={field.value?.includes(shelf.id)}
                                            onCheckedChange={(checked) =>
                                                checked
                                                    ? field.onChange([...field.value, shelf.id])
                                                    : field.onChange(field.value.filter((v: string) => v !== shelf.id))
                                            }
                                        />
                                        <FormLabel
                                            className={`font-normal leading-tight ${field.value?.includes(shelf.id) && 'text-my-accent'}`}
                                        >
                                            {shelf.label}
                                        </FormLabel>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>

                <FormField
                    name="needRail"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-normal leading-tight text-my-secondary">
                                Нyжен ли рейл?
                            </FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value}>
                                    <div className="flex gap-2 items-center cursor-pointer">
                                        <RadioGroupItem value="yes" /> Да
                                    </div>
                                    <div className="flex gap-2 items-center cursor-pointer">
                                        <RadioGroupItem value="no" /> Нет
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-between">
                    <Button type="button" variant="secondary" onClick={onBack}>
                        <ChevronLeft /> Назад
                    </Button>

                    <Button type="submit">Завершить</Button>
                </div>
            </form>
        </Form>
    );
}
