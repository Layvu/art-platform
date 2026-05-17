'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
} from '@/components/ui/combobox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Category, Product } from '@/shared/types/payload-types';
import type { ProductFormValues } from '@/shared/types/product.type';
import { productSchema } from '@/shared/validations/schemas';

import GalleryUploader from './GalleryUploader';

const DEFAULT_PRODUCT_VALUES: ProductFormValues = {
    title: '',
    description: '',
    gallery: [],
    category: null,
};

interface AuthorProductModalProps {
    open: boolean;
    product?: Product | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ProductFormValues) => Promise<void>;
    categories: Category[];
}

const SECTION_TITLE_CLS =
    'text-base font-semibold text-my-primary leading-none [font-variant-numeric:lining-nums_tabular-nums_stacked-fractions]';

const LABEL_CLS =
    'text-base font-[450] text-my-primary leading-none [font-variant-numeric:lining-nums_tabular-nums_stacked-fractions]';

const INPUT_CLS =
    'text-base md:text-base font-[450] placeholder:text-base placeholder:font-[450] placeholder:text-muted-foreground [font-variant-numeric:lining-nums_tabular-nums_stacked-fractions]';

export function AuthorProductModal({ open, onOpenChange, product, onSubmit, categories }: AuthorProductModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: DEFAULT_PRODUCT_VALUES,
    });

    const isEditing = !!product;

    useEffect(() => {
        if (open) {
            if (product) {
                form.reset({
                    title: product.title,
                    description: product.description || '',
                    category: typeof product.category === 'object' ? product.category?.id : product.category,
                    gallery: product.gallery ?? [],
                });
            } else {
                form.reset(DEFAULT_PRODUCT_VALUES);
            }
        }
    }, [open, product, form]);

    const handleSubmitForm = form.handleSubmit(async (formData) => {
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    });

    const labels = isEditing
        ? {
              title: 'Редактирование товара',
              submit: 'Сохранить',
              submitting: 'Сохранение...',
              infoText: 'Цена и количество отобразятся после подтверждения накладной по факту поставки.',
          }
        : {
              title: 'Добавление товара',
              submit: 'Добавить',
              submitting: 'Добавление...',
              infoText: 'Цена и количество отобразятся после добавления товара в 1С по факту поставки.',
          };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col max-h-[92vh] p-0 gap-0 overflow-hidden" showCloseButton={false}>
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-6 shrink-0">
                    <DialogTitle className="text-2xl font-semibold text-my-primary leading-none">
                        {labels.title}
                    </DialogTitle>

                    <DialogClose asChild>
                        <button
                            type="button"
                            aria-label="Закрыть"
                            className="flex items-center justify-center w-6 h-6 shrink-0 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <X size={24} strokeWidth={1.5} />
                        </button>
                    </DialogClose>
                </div>

                <DialogDescription className="sr-only">
                    Форма {isEditing ? 'редактирования' : 'добавления'} товара
                </DialogDescription>

                <Form {...form}>
                    <form onSubmit={handleSubmitForm} className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 overflow-y-auto p-5">
                            <div className="flex flex-col gap-6">
                                <p className={SECTION_TITLE_CLS}>Основная информация</p>

                                <Alert variant="infoBlue" className="py-3">
                                    <AlertDescription className="text-base font-[450] text-my-secondary leading-none [font-variant-numeric:lining-nums_tabular-nums_stacked-fractions]">
                                        {labels.infoText}
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col gap-2 space-y-0">
                                                <FormLabel className={LABEL_CLS}>Название товара</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Введите название товара"
                                                        className={INPUT_CLS}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col gap-2 space-y-0">
                                                <FormLabel className={LABEL_CLS}>Категория товара</FormLabel>
                                                <FormControl>
                                                    <CategoryCombobox
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        categories={categories}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col gap-2 space-y-0">
                                            <FormLabel className={LABEL_CLS}>Описание товара</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Введите описание товара"
                                                    rows={4}
                                                    className="text-base md:text-base font-[450] resize-none placeholder:text-base placeholder:font-[450] placeholder:text-muted-foreground [font-variant-numeric:lining-nums_tabular-nums_stacked-fractions]"
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="mt-3">
                                    <p className={SECTION_TITLE_CLS}>Фотографии товара</p>
                                    <div className="mt-6">
                                        <FormField
                                            control={form.control}
                                            name="gallery"
                                            render={({ field }) => (
                                                <FormItem className="space-y-0">
                                                    <FormControl>
                                                        <GalleryUploader
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 p-5 flex items-center justify-between shrink-0">
                            <Button
                                type="button"
                                variant="empty"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                                className="text-my-accent hover:text-my-accent-hover text-base font-semibold h-auto min-h-0 py-2.5 px-2"
                            >
                                Отмена
                            </Button>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="text-base font-[600] h-auto min-h-0 py-2.5 px-2"
                            >
                                {isSubmitting ? labels.submitting : labels.submit}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function CategoryCombobox({
    value,
    onChange,
    categories,
}: {
    value: number | string | null | undefined;
    onChange: (val: number | null) => void;
    categories: Category[];
}) {
    const numericValue = value != null ? Number(value) : null;
    const selectedLabel = categories.find((c) => c.id === numericValue)?.label || '';

    return (
        <Combobox
            items={categories.map((c) => c.label)}
            value={selectedLabel}
            onValueChange={(label) => {
                const category = categories.find((c) => c.label === label);
                onChange(category ? category.id : null);
            }}
        >
            <div className="relative w-full">
                <ComboboxInput placeholder="Выберите категорию товара" />
                <ComboboxTrigger />
            </div>

            <ComboboxContent>
                <ComboboxEmpty>Категория не найдена</ComboboxEmpty>
                <ComboboxList>
                    {(label) => (
                        <ComboboxItem
                            key={label}
                            value={label}
                            className="px-3 py-3 rounded-md data-highlighted:bg-gray-50"
                        >
                            {label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
