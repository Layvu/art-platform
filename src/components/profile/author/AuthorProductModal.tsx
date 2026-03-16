'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFetchCategories } from '@/shared/hooks/useFetchData';
import type { Product } from '@/shared/types/payload-types';
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
    product?: Product | null; // null = создание
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ProductFormValues) => Promise<void>;
}

export function AuthorProductModal({ open, onOpenChange, product, onSubmit }: AuthorProductModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: DEFAULT_PRODUCT_VALUES,
    });

    const { data, isFetching } = useFetchCategories();
    const categories = data?.docs || [];
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

    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
    };

    const handleSubmitForm = form.handleSubmit(async (formData) => {
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            handleOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Редактировать товар' : 'Создать новый товар'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Внесите изменения' : 'Цена и количество придут позже из 1С'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={handleSubmitForm} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название товара</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Введите название" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Категория</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value ? String(field.value) : undefined}
                                        disabled={isFetching}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={isFetching ? 'Загрузка...' : 'Выберите категорию'}
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Описание</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Опишите товар"
                                            rows={3}
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="gallery"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Галерея изображений</FormLabel>
                                    <FormControl>
                                        <GalleryUploader value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                                Отмена
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? isEditing
                                        ? 'Сохранение...'
                                        : 'Создание...'
                                    : isEditing
                                      ? 'Сохранить'
                                      : 'Создать товар'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
