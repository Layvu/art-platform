'use client';

import React, { useState } from 'react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { authorAuthService } from '@/services/api/author-auth-service';
import type { IAuthorUpdateInput } from '@/shared/types/author.interface';
import type { Author, Product } from '@/shared/types/payload-types';
import type { IProductFormData } from '@/shared/types/product.type';

interface AuthorProfileUIProps {
    authorData: Author;
    products: Product[];
}

const initialProductForm = {
    title: '',
    price: 0,
    description: '',
};

export default function AuthorProfileUI({ authorData, products: initialProducts }: AuthorProfileUIProps) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    // Author data
    const [name, setName] = useState(authorData.name || '');
    const [bio, setBio] = useState(authorData.bio || '');

    // Products data
    const [products, setProducts] = useState<Product[]>(initialProducts);

    // Product forms
    const [createProductForm, setCreateProductForm] = useState<IProductFormData>(initialProductForm);
    const [editProductForm, setEditProductForm] = useState<IProductFormData>(initialProductForm);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const updated: IAuthorUpdateInput = {
            id: authorData.id,
            name,
            bio,
        };

        try {
            const result = await authorAuthService.updateProfile(updated);

            if (result.success) {
                setSuccess('Профиль автора обновлен');
            } else {
                setError('Ошибка обновления профиля автора');
                console.error('Update profile error:', result.error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await authorAuthService.createProduct(createProductForm);

            if (result.success && result.product) {
                // Добавляем новый товар в начало списка
                setProducts([result.product, ...products]);
                setIsCreateModalOpen(false);
                setCreateProductForm(initialProductForm);
                setSuccess('Новый товар успешно создан');
            } else {
                setError('Ошибка создания товара');
                console.error('Create product error:', result.error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await authorAuthService.updateProduct(editingProduct.id, editProductForm);

            if (result.success && result.product) {
                setProducts(products.map((p) => (p.id === editingProduct.id ? result.product! : p)));
                setEditingProduct(null);
                setEditProductForm(initialProductForm);
                setSuccess('Товар успешно обновлен');
            } else {
                setError('Ошибка обновления товара');
                console.error('Update product error:', result.error);
            }
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
            const result = await authorAuthService.deleteProduct(productToDelete.id);

            if (result.success) {
                setProducts(products.filter((p) => p.id !== productToDelete.id));
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
                setSuccess('Товар успешно удален');
            } else {
                setError('Ошибка удаления товара');
                console.error('Delete product error:', result.error);
            }
        } finally {
            setLoading(false);
        }
    };

    // Modals
    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setEditProductForm({
            title: product.title,
            price: product.price,
            description: product.description || '',
            // category: product.category || '', // TODO: добавить остальные поля, когда станет известен полный список
            image: product.image || '',
        });
    };

    const openDeleteModal = (product: Product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    // Обработчики закрытия модальных окон
    const handleCreateModalClose = () => {
        setIsCreateModalOpen(false);
        setCreateProductForm(initialProductForm);
    };

    const handleEditModalClose = () => {
        setEditingProduct(null);
        // Сброс формы только после того как модалка уже закроется
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
    };

    // Обработчик для onOpenChange
    const handleDeleteModalOpenChange = (open: boolean) => {
        if (!open) {
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        }
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
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Имя автора</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ваше имя"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Биография</Label>
                                    <Textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Расскажите о себе..."
                                        rows={4}
                                    />
                                </div>

                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Сохранение...' : 'Обновить профиль'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="products" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Мои товары</h3>
                                <Button onClick={() => setIsCreateModalOpen(true)}>Добавить товар</Button>
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
                                                    {product.category && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Категория: {product.category}
                                                        </p>
                                                    )}
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
                                                        onClick={() => openDeleteModal(product)}
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

                    {/* Модальное окно создания товара */}
                    <Dialog
                        open={isCreateModalOpen}
                        onOpenChange={(open) => {
                            if (!open) {
                                setIsCreateModalOpen(false);
                                // TODO: timeout тут - это не адекватно
                                setTimeout(() => setCreateProductForm(initialProductForm), 150);
                            }
                        }}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Создать новый товар</DialogTitle>
                                <DialogDescription>Заполните информацию о новом товаре</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateProduct} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Название товара</Label>
                                    <Input
                                        id="title"
                                        value={createProductForm.title}
                                        onChange={(e) =>
                                            setCreateProductForm({ ...createProductForm, title: e.target.value })
                                        }
                                        placeholder="Введите название товара"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Цена</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={createProductForm.price}
                                        onChange={(e) =>
                                            setCreateProductForm({
                                                ...createProductForm,
                                                price: Number(e.target.value),
                                            })
                                        }
                                        placeholder="Введите цену"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Описание</Label>
                                    <Textarea
                                        id="description"
                                        value={createProductForm.description || ''}
                                        onChange={(e) =>
                                            setCreateProductForm({ ...createProductForm, description: e.target.value })
                                        }
                                        placeholder="Опишите товар"
                                        rows={3}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={handleCreateModalClose}>
                                        Отмена
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Создание...' : 'Создать товар'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Модальное окно редактирования товара */}
                    <Dialog
                        open={!!editingProduct}
                        onOpenChange={(open) => {
                            if (!open) {
                                // дождались закрытия модалки — теперь сбрасываем форму
                                setTimeout(() => {
                                    setEditProductForm(initialProductForm);
                                }, 150); // 150ms соответствует анимации закрытия Dialog
                                handleEditModalClose();
                            }
                        }}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Редактировать товар</DialogTitle>
                                <DialogDescription>Внесите изменения в информацию о товаре</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpdateProduct} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-title">Название товара</Label>
                                    <Input
                                        id="edit-title"
                                        value={editProductForm.title}
                                        onChange={(e) =>
                                            setEditProductForm({ ...editProductForm, title: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-price">Цена</Label>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        value={editProductForm.price}
                                        onChange={(e) =>
                                            setEditProductForm({ ...editProductForm, price: Number(e.target.value) })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-description">Описание</Label>
                                    <Textarea
                                        id="edit-description"
                                        value={editProductForm.description || ''}
                                        onChange={(e) =>
                                            setEditProductForm({ ...editProductForm, description: e.target.value })
                                        }
                                        rows={3}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={handleEditModalClose}>
                                        Отмена
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? 'Сохранение...' : 'Сохранить изменения'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Модальное окно подтверждения удаления */}
                    <Dialog open={isDeleteModalOpen} onOpenChange={handleDeleteModalOpenChange}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Подтверждение удаления</DialogTitle>
                                <DialogDescription>
                                    Вы уверены, что хотите удалить товар "{productToDelete?.title}"? Это действие нельзя
                                    отменить.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleDeleteModalClose}>
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
