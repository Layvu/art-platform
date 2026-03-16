'use client';

import React, { useState } from 'react';

import { useForm, type UseFormReturn } from 'react-hook-form';

import AuthorInvoiceManager from '@/components/profile/author/AuthorInvoiceManager';
import { AuthorProductCard } from '@/components/profile/author/AuthorProductCard';
import { AuthorProductModal } from '@/components/profile/author/AuthorProductModal';
import AvatarUploader from '@/components/profile/author/AvatarUploader';
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
import { isImageData } from '@/shared/guards/image.guard';
import type {
    AuthorProfileFormValues,
    AuthorProfileUIProps,
    IAuthorAvatar,
    IAuthorUpdateInput,
} from '@/shared/types/author.interface';
import type { Product } from '@/shared/types/payload-types';
import type { IProductFormData, ProductFormValues } from '@/shared/types/product.type';

// Подготовка данных к отправке на сервер
const mapFormDataToPayload = (
    data: ProductFormValues,
    currentPrice: number,
    currentQuantity: number,
): IProductFormData => ({
    ...data,
    price: currentPrice,
    category: data.category ? Number(data.category) : null,
    quantity: currentQuantity,
    gallery: data.gallery.map((item) => {
        let imageId;
        if (typeof item.image === 'number') {
            imageId = item.image;
        } else if (isImageData(item.image)) {
            imageId = item.image.id;
        }
        return {
            id: item.id || null,
            image: imageId,
        };
    }),
});

const extractAvatarId = (avatar: IAuthorAvatar): IAuthorAvatar => {
    if (!avatar) return null;
    if (typeof avatar === 'number' || typeof avatar === 'string') return avatar;
    if (isImageData(avatar)) return avatar.id;
    return null;
};

export default function AuthorProfileUI({
    authorData,
    products: initialProducts,
    latestInvoice,
}: AuthorProfileUIProps) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalProduct, setModalProduct] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    // Products data
    const [products, setProducts] = useState<Product[]>(initialProducts);

    // Форма профиля без валидации
    const profileForm = useForm<AuthorProfileFormValues>({
        defaultValues: {
            name: authorData.name || '',
            bio: authorData.bio || '',
            avatar: authorData.avatar || null,
        },
    });

    const resetAlerts = () => {
        setError('');
        setSuccess('');
    };

    const handleProfileUpdate = async (data: AuthorProfileFormValues) => {
        setLoading(true);
        resetAlerts();

        const updatedData: IAuthorUpdateInput = {
            name: data.name,
            bio: data.bio,
            avatar: extractAvatarId(data.avatar),
        };

        try {
            const result = await authorClientService.updateProfile(updatedData);

            if (result.success) {
                setSuccess('Профиль автора обновлен');
            } else {
                setError(result.error || 'Ошибка обновления профиля автора');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProductSubmit = async (data: ProductFormValues) => {
        setLoading(true);
        resetAlerts();

        try {
            const payloadData = mapFormDataToPayload(data, modalProduct?.price ?? 0, modalProduct?.quantity ?? 0);
            const isCreateMode = !modalProduct;

            const result = isCreateMode
                ? await authorClientService.createProduct(payloadData)
                : await authorClientService.updateProduct(modalProduct.id, payloadData);

            if (result.success && result.product) {
                if (isCreateMode) {
                    setProducts([result.product, ...products]);
                    setSuccess('Товар успешно создан');
                } else {
                    setProducts(products.map((p) => (p.id === modalProduct.id ? result.product! : p)));
                    setSuccess('Товар успешно обновлён');
                }
            } else {
                setError(result.error || 'Ошибка сохранения товара');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;

        setLoading(true);
        resetAlerts();

        try {
            const result = await authorClientService.deleteProduct(productToDelete.id);

            if (result.success) {
                setProducts(products.filter((p) => p.id !== productToDelete.id));
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
                setSuccess('Товар успешно удален');
            } else {
                setError(result.error || 'Ошибка удаления товара');
            }
        } finally {
            setLoading(false);
        }
    };

    // Modals
    const openCreateModal = () => {
        setModalProduct(null);
        setIsProductModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setModalProduct(product);
        setIsProductModalOpen(true);
    };

    const openDeleteModal = (product: Product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
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
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="profile">Профиль</TabsTrigger>
                            <TabsTrigger value="products">Мои товары ({products.length})</TabsTrigger>
                            <TabsTrigger value="invoices">Накладные</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <ProfileTab form={profileForm} onSubmit={handleProfileUpdate} loading={loading} />
                        </TabsContent>

                        <TabsContent value="products">
                            <ProductsTab
                                products={products}
                                onAdd={openCreateModal}
                                onEdit={openEditModal}
                                onDelete={openDeleteModal}
                            />
                        </TabsContent>

                        <TabsContent value="invoices">
                            <AuthorInvoiceManager
                                authorId={authorData.id}
                                products={products}
                                latestInvoice={latestInvoice}
                            />
                        </TabsContent>
                    </Tabs>

                    <AuthorProductModal
                        open={isProductModalOpen}
                        onOpenChange={setIsProductModalOpen}
                        product={modalProduct}
                        onSubmit={handleProductSubmit}
                    />

                    <DeleteProductDialog
                        isOpen={isDeleteModalOpen}
                        productTitle={productToDelete?.title}
                        loading={loading}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDeleteProduct}
                    />

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

// Локальные компоненты UI
// TODO: перенести в отдельные файлы если можно переиспользовать

function ProfileTab({
    form,
    loading,
    onSubmit,
}: {
    form: UseFormReturn<AuthorProfileFormValues>;
    loading: boolean;
    onSubmit: (data: AuthorProfileFormValues) => void;
}) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Фотография профиля</FormLabel>
                            <FormControl>
                                <AvatarUploader value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
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
                    control={form.control}
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
    );
}

function ProductsTab({
    products,
    onAdd,
    onEdit,
    onDelete,
}: {
    products: Product[];
    onAdd: () => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}) {
    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Мои товары</h3>
                <Button onClick={onAdd}>Добавить товар</Button>
            </div>

            {products.length === 0 ? (
                <Card className="p-6 text-center">
                    <p className="text-muted-foreground">У вас пока нет товаров</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {products.map((product) => (
                        <AuthorProductCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </>
    );
}

function DeleteProductDialog({
    isOpen,
    productTitle,
    loading,
    onClose,
    onConfirm,
}: {
    isOpen: boolean;
    productTitle?: string;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Подтверждение удаления</DialogTitle>
                    <DialogDescription>
                        Вы уверены, что хотите удалить товар "{productTitle}"? Это действие нельзя отменить.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm} disabled={loading}>
                        {loading ? 'Удаление...' : 'Удалить'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
