'use client';

import React, { useState } from 'react';

import { CircleUserRound, FileText, LogOut, Tag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, type UseFormReturn } from 'react-hook-form';

import AuthorInvoiceManager from '@/components/profile/author/AuthorInvoiceManager';
import { AuthorProductCard } from '@/components/profile/author/AuthorProductCard';
import { AuthorProductModal } from '@/components/profile/author/AuthorProductModal';
import AvatarUploader from '@/components/profile/author/AvatarUploader';
import CoverUploader from '@/components/profile/author/CoverUploader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { PAGES } from '@/config/public-pages.config';
import { authorClientService } from '@/services/api/client/author-client.service';
import { useAuthStore } from '@/services/store/auth/store';
import { isImageData } from '@/shared/guards/image.guard';
import { useFetchCategories } from '@/shared/hooks/useFetchData';
import type {
    AuthorProfileFormValues,
    AuthorProfileUIProps,
    IAuthorAvatar,
    IAuthorCover,
    IAuthorUpdateInput,
} from '@/shared/types/author.interface';
import type { Product } from '@/shared/types/payload-types';
import type { IProductFormData, ProductFormValues } from '@/shared/types/product.type';
import { cn } from '@/shared/utils/tailwind';

type TabType = 'profile' | 'products' | 'invoices';

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
        if (typeof item.image === 'number') imageId = item.image;
        else if (isImageData(item.image)) imageId = item.image.id;
        return { id: item.id || null, image: imageId };
    }),
});

const extractMediaId = (image: IAuthorAvatar | IAuthorCover): IAuthorAvatar => {
    if (!image) return null;
    if (typeof image === 'number' || typeof image === 'string') return image;
    if (isImageData(image)) return image.id;
    return null;
};

export default function AuthorProfileUI({
    authorData,
    products: initialProducts,
    latestInvoice,
}: AuthorProfileUIProps) {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);

    const { data: categoriesData } = useFetchCategories();
    const categories = categoriesData?.docs ?? [];

    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
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
            cover: authorData.cover || null,
        },
    });

    const isProfileDirty = profileForm.formState.isDirty;

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
            avatar: extractMediaId(data.avatar),
            cover: extractMediaId(data.cover),
        };

        try {
            const result = await authorClientService.updateProfile(updatedData);

            if (result.success) {
                setSuccess('Профиль автора обновлен');
                profileForm.reset(data);
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
                : await authorClientService.updateProduct(modalProduct!.id, payloadData);

            if (result.success && result.product) {
                if (isCreateMode) {
                    setProducts((prev) => [result.product!, ...prev]);
                } else {
                    setProducts((prev) => prev.map((p) => (p.id === result.product!.id ? result.product! : p)));
                }
                setSuccess(isCreateMode ? 'Товар создан' : 'Товар обновлен');
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
                setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
                setSuccess('Товар удален');
            } else {
                setError(result.error || 'Ошибка удаления товара');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace(PAGES.LOGIN);
    };

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

    const tabs = [
        { id: 'profile' as const, label: 'Профиль', icon: CircleUserRound },
        { id: 'products' as const, label: 'Товары', icon: Tag },
        { id: 'invoices' as const, label: 'Накладные', icon: FileText },
    ];

    return (
        <div className="wrap px-3 lg:px-0 grid grid-cols-12 gap-16">
            <aside className="col-span-12 md:col-span-3 space-y-6 h-fit bg-gray-50 p-6 pb-4 pt-4 rounded-md">
                <nav className="flex flex-col space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    resetAlerts();
                                }}
                                className={cn(
                                    'flex gap-2 py-2.5 cursor-pointer items-center transition-colors',
                                    isActive ? 'text-my-accent font-medium' : 'hover:text-my-accent',
                                )}
                            >
                                <Icon size={24} strokeWidth={1.5} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                <Separator color="gray-200" />

                <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex gap-2.5 py-1.5 cursor-pointer hover:text-red-500 transition-colors w-full text-left items-center"
                >
                    <LogOut size={24} strokeWidth={1.5} />
                    Выйти
                </button>
            </aside>

            <main className="col-span-12 md:col-span-9 space-y-8">
                {activeTab === 'profile' && (
                    <ProfileSection
                        form={profileForm}
                        loading={loading}
                        isDirty={isProfileDirty}
                        onSubmit={handleProfileUpdate}
                    />
                )}
                {activeTab === 'products' && (
                    <ProductsSection
                        products={products}
                        onAdd={openCreateModal}
                        onEdit={openEditModal}
                        onDelete={openDeleteModal}
                    />
                )}

                {activeTab === 'invoices' && (
                    <AuthorInvoiceManager authorId={authorData.id} products={products} latestInvoice={latestInvoice} />
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}
            </main>

            <AuthorProductModal
                open={isProductModalOpen}
                onOpenChange={setIsProductModalOpen}
                product={modalProduct}
                onSubmit={handleProductSubmit}
                categories={categories}
            />

            <DeleteProductDialog
                isOpen={isDeleteModalOpen}
                productTitle={productToDelete?.title}
                loading={loading}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteProduct}
            />

            <LogoutConfirmDialog
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}

function ProfileSection({
    form,
    loading,
    isDirty,
    onSubmit,
}: {
    form: UseFormReturn<AuthorProfileFormValues>;
    loading: boolean;
    isDirty: boolean;
    onSubmit: (data: AuthorProfileFormValues) => void;
}) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-semibold">Профиль</h1>
                    <Button type="submit" disabled={loading || !isDirty}>
                        {loading ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="flex gap-16 items-start">
                        <div className="flex flex-col gap-6">
                            <span className="text-xl font-semibold text-my-primary">Аватар</span>
                            <FormField
                                control={form.control}
                                name="avatar"
                                render={({ field }) => (
                                    <FormItem className="space-y-0">
                                        <FormControl>
                                            <AvatarUploader value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex flex-col gap-6 flex-1 min-w-0">
                            <span className="text-xl font-semibold text-my-primary">Обложка</span>
                            <FormField
                                control={form.control}
                                name="cover"
                                render={({ field }) => (
                                    <FormItem className="space-y-0">
                                        <FormControl>
                                            <CoverUploader value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <h2 className="text-xl font-semibold">Личные данные</h2>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-my-secondary text-sm">
                                        Имя / никнейм / псевдоним автора
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Введите значение" {...field} />
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
                                    <FormLabel className="text-my-secondary text-sm">Краткое описание</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Расскажите о себе и своем творчестве"
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </form>
        </Form>
    );
}

function ProductsSection({
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
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-semibold">
                    Товары <span className="text-my-disabled font-normal">({products.length})</span>
                </h1>
                <Button onClick={onAdd}>Добавить товар</Button>
            </div>

            {products.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl py-10 px-6 text-center">
                    <p className="text-base font-semibold text-my-primary">Добавьте свой первый товар!</p>
                    <p className="text-sm text-my-tertriary mt-1">
                        Это можно сделать по кнопке выше. После добавления товар отобразится в списке.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {products.map((product) => (
                        <AuthorProductCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ConfirmDialogHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-6 shrink-0">
            <DialogTitle className="text-2xl font-semibold text-my-primary leading-none">{title}</DialogTitle>
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
    );
}

function ConfirmDialogFooter({
    onCancel,
    onConfirm,
    cancelLabel = 'Отмена',
    confirmLabel,
    confirmVariant = 'destructive',
    loading,
    loadingLabel,
}: {
    onCancel: () => void;
    onConfirm: () => void;
    cancelLabel?: string;
    confirmLabel: string;
    confirmVariant?: 'destructive' | 'default' | 'secondary';
    loading?: boolean;
    loadingLabel?: string;
}) {
    return (
        <div className="border-t border-gray-200 p-5 flex items-center justify-between shrink-0">
            <Button
                type="button"
                variant="empty"
                onClick={onCancel}
                disabled={loading}
                className="text-my-accent hover:text-my-accent-hover font-semibold h-auto min-h-0 py-2.5 px-2"
            >
                {cancelLabel}
            </Button>
            <Button
                type="button"
                variant={confirmVariant}
                onClick={onConfirm}
                disabled={loading}
                className="h-auto min-h-0 py-2.5 px-2"
            >
                {loading && loadingLabel ? loadingLabel : confirmLabel}
            </Button>
        </div>
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
            <DialogContent className="sm:max-w-md flex flex-col p-0 gap-0" showCloseButton={false}>
                <ConfirmDialogHeader title="Подтверждение действия" />

                <div className="p-5">
                    <DialogDescription className="text-base font-[450] text-my-primary leading-snug">
                        Вы действительно хотите удалить товар{' '}
                        {productTitle ? <span className="font-semibold">«{productTitle}»</span> : null}? Это действие
                        невозможно отменить.
                    </DialogDescription>
                </div>

                <ConfirmDialogFooter
                    onCancel={onClose}
                    onConfirm={onConfirm}
                    confirmLabel="Удалить"
                    loading={loading}
                    loadingLabel="Удаление..."
                />
            </DialogContent>
        </Dialog>
    );
}

function LogoutConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md flex flex-col p-0 gap-0" showCloseButton={false}>
                <ConfirmDialogHeader title="Выход из аккаунта" />

                <div className="p-5">
                    <DialogDescription className="text-base font-[450] text-my-primary leading-snug">
                        Вы действительно хотите выйти из аккаунта?
                    </DialogDescription>
                </div>

                <ConfirmDialogFooter onCancel={onClose} onConfirm={onConfirm} confirmLabel="Выйти" />
            </DialogContent>
        </Dialog>
    );
}
