'use client';

import React, { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { authorClientService } from '@/services/api/client/author-client.service';
import type { IAuthorUpdateInput } from '@/shared/types/author.interface';
import type { Author, Product } from '@/shared/types/payload-types';
import { productSchema } from '@/shared/validations/schemas';

interface AuthorProfileUIProps {
    authorData: Author;
    products: Product[];
}

interface ProfileFormValues {
    name: string;
    bio: string;
}

const emptyProduct = { title: '', price: 0, description: '' };

export default function AuthorProfileUI({ authorData, products: initialProducts }: AuthorProfileUIProps) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    // Products data
    const [products, setProducts] = useState<Product[]>(initialProducts);

    // Форма профиля без валидации
    const profileForm = useForm<ProfileFormValues>({
        defaultValues: { name: authorData.name || '', bio: authorData.bio || '' },
    });

    // Формы с валидацией
    const createProductForm = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: emptyProduct,
    });
    const editProductForm = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: emptyProduct,
    });

    const handleProfileUpdate = async (data: ProfileFormValues) => {
        setLoading(true);
        setError('');
        setSuccess('');

        const updated: IAuthorUpdateInput = {
            name: data.name,
            bio: data.bio,
        };

        try {
            const result = await authorClientService.updateProfile(updated);

            if (result.success) setSuccess('Профиль автора обновлен');
            else setError(result.error || 'Ошибка обновления профиля автора');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (data: z.infer<typeof productSchema>) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await authorClientService.createProduct(data);

            if (result.success && result.product) {
                // Добавляем новый товар в начало списка
                setProducts([result.product, ...products]);
                setIsCreateModalOpen(false);
                setSuccess('Новый товар успешно создан');
            } else setError(result.error || 'Ошибка создания товара');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProduct = async (data: z.infer<typeof productSchema>) => {
        if (!editingProduct) return;
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await authorClientService.updateProduct(editingProduct.id, data);
            if (result.success && result.product) {
                setProducts(products.map((p) => (p.id === editingProduct.id ? result.product! : p)));
                setEditingProduct(null);
                setSuccess('Товар успешно обновлен');
            } else setError(result.error || 'Ошибка обновления товара');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await authorClientService.deleteProduct(productToDelete.id);
            if (result.success) {
                setProducts(products.filter((p) => p.id !== productToDelete.id));
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
                setSuccess('Товар успешно удален');
            } else setError(result.error || 'Ошибка удаления товара');
        } finally {
            setLoading(false);
        }
    };

    // Modals
    const openCreateModal = () => {
        createProductForm.reset(emptyProduct);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        editProductForm.reset({
            title: product.title,
            price: product.price,
            description: product.description || '',
        });
        setEditingProduct(product);
    };

    return (
        <div className="container max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Профиль автора</CardTitle>
                    <CardDescription>Управление вашим профилем и товарами</CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="profile" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="profile">Профиль</TabsTrigger>
                            <TabsTrigger value="products">Мои товары ({products.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-4">
                            <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                                    <FormField
                                        control={profileForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Имя автора</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ваше имя" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={profileForm.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Биография</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Расскажите о себе..." rows={4} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Сохранение...' : 'Обновить профиль'}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="products" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Мои товары</h3>
                                <Button onClick={openCreateModal}>Добавить товар</Button>
                            </div>

                            {products.length === 0 ? (
                                <Card className="p-6 text-center">
                                    <p className="text-muted-foreground">У вас пока нет товаров</p>
                                </Card>
                            ) : (
                                <div className="grid gap-4">
                                    {products.map((product) => (
                                        <Card key={product.id} className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-lg">{product.title}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Цена: {product.price} ₽
                                                    </p>
                                                    {product.description && (
                                                        <p className="text-sm mt-2 text-muted-foreground">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditModal(product)}
                                                    >
                                                        Редактировать
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setProductToDelete(product);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                    >
                                                        Удалить
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Модалка: Создать */}
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Создать новый товар</DialogTitle>
                                <DialogDescription>Заполните информацию о новом товаре</DialogDescription>
                            </DialogHeader>
                            <Form {...createProductForm}>
                                <form
                                    onSubmit={createProductForm.handleSubmit(handleCreateProduct)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={createProductForm.control}
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
                                        control={createProductForm.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Цена</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="Введите цену"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={createProductForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Описание</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Опишите товар" rows={3} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsCreateModalOpen(false)}
                                        >
                                            Отмена
                                        </Button>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? 'Создание...' : 'Создать товар'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    {/* Модалка: Редактировать */}
                    <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Редактировать товар</DialogTitle>
                                <DialogDescription>Внесите изменения в информацию о товаре</DialogDescription>
                            </DialogHeader>
                            <Form {...editProductForm}>
                                <form
                                    onSubmit={editProductForm.handleSubmit(handleUpdateProduct)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={editProductForm.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Название товара</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={editProductForm.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Цена</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={editProductForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Описание</FormLabel>
                                                <FormControl>
                                                    <Textarea rows={3} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                                            Отмена
                                        </Button>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? 'Сохранение...' : 'Сохранить изменения'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    {/* Модалка: Удалить */}
                    <Dialog open={isDeleteModalOpen} onOpenChange={(open) => !open && setIsDeleteModalOpen(false)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Подтверждение удаления</DialogTitle>
                                <DialogDescription>
                                    Вы уверены, что хотите удалить товар "{productToDelete?.title}"? Это действие нельзя
                                    отменить.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                                    Отмена
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDeleteProduct}
                                    disabled={loading}
                                >
                                    {loading ? 'Удаление...' : 'Удалить'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Алерт ошибок и успеха */}
                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert className="mt-4">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
