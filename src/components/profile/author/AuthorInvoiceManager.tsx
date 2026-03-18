'use client';

import React, { useMemo, useState } from 'react';

import { Download, FileText, Plus, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiUrl } from '@/services/api/api-url-builder';
import { authorClientService } from '@/services/api/client/author-client.service';
import {
    type AuthorInvoiceManagerProps,
    type IInvoiceItemKey,
    type IInvoiceItems,
    INVOICE_ITEM_CONDITION,
} from '@/shared/types/invoice.interface';
import type { Product } from '@/shared/types/payload-types';

const INVOICE_FIELDS = {
    QUANTITY: 'quantity',
    PRICE: 'price',
    CONDITION: 'condition',
} as const;

const CONDITION_LABELS = {
    [INVOICE_ITEM_CONDITION.NEW]: 'Новый (Н)',
    [INVOICE_ITEM_CONDITION.OLD]: 'Старый (С)',
    [INVOICE_ITEM_CONDITION.REVALUATION]: 'Переоценка (П)',
};

export default function AuthorInvoiceManager({ authorId, products, latestInvoice }: AuthorInvoiceManagerProps) {
    const router = useRouter();

    // Если есть последняя накладная, загружаем её товары, иначе пустой массив
    const [invoiceItems, setInvoiceItems] = useState<IInvoiceItems>(
        latestInvoice?.items.map((item) => ({
            orderNumber: item.orderNumber,
            product: item.product,
            quantity: item.quantity,
            price: item.price ?? (item.product as Product).price ?? 0,
            condition: item.condition,
        })) || [],
    );

    const [savedInvoiceId, setSavedInvoiceId] = useState<number | null>(latestInvoice?.id || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const filteredProductsByTitleAndArticle = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return products.filter(
            (p) => p.title.toLowerCase().includes(query) || (p.article1C && p.article1C.toLowerCase().includes(query)),
        );
    }, [products, searchQuery]);

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    const handleAddProduct = (product: Product) => {
        // Проверяем, нет ли уже такого товара в списке
        if (invoiceItems.some((item) => (item.product as Product).id === product.id)) {
            setError('Этот товар уже добавлен в накладную');
            return;
        }

        // TODO: enum и const статусов НСП
        const price = product.price || 0;
        // Если цена есть, значит старый
        const condition = price > 0 ? INVOICE_ITEM_CONDITION.OLD : INVOICE_ITEM_CONDITION.NEW;

        setInvoiceItems((prev) => [
            ...prev,
            {
                orderNumber: prev.length + 1,
                product,
                quantity: 0,
                condition,
                price,
            },
        ]);

        setSearchQuery('');
        clearMessages();
    };

    const handleRemoveItem = (productId: number) => {
        setInvoiceItems((prev) => prev.filter((item) => (item.product as Product).id !== productId));
        clearMessages();
    };

    const handleItemChange = (productId: number, field: IInvoiceItemKey, value: string | number) => {
        setInvoiceItems((prev) =>
            prev.map((item) => {
                const product = item.product as Product;
                if (product.id === productId) {
                    const updatedItem = { ...item, [field]: value };

                    if (field === INVOICE_FIELDS.CONDITION) {
                        if (value === INVOICE_ITEM_CONDITION.REVALUATION) {
                            updatedItem.quantity = product.quantity || 0;
                        } else if (value === INVOICE_ITEM_CONDITION.OLD) {
                            updatedItem.price = product.price || 0;
                        }
                    }

                    return updatedItem;
                }
                return item;
            }),
        );
        clearMessages();
    };

    const handleSaveInvoice = async () => {
        if (invoiceItems.length === 0) {
            setError('Добавьте товар');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Пересчёт номеров
            // Иначе, если автор добавит 3 товара, удалит 2-й и добавит новый, порядковые номера собьются (1,3,3)
            const itemsToSave = invoiceItems.map((item, idx) => ({ ...item, orderNumber: idx + 1 }));

            let result;
            if (savedInvoiceId) {
                // Обновляем существующую накладную
                result = await authorClientService.updateInvoice(savedInvoiceId, itemsToSave);
            } else {
                // Создаём новую
                result = await authorClientService.saveInvoice(authorId, itemsToSave);
            }

            if (result.success && result.invoice) {
                setSuccess('Накладная успешно сохранена');
                setSavedInvoiceId(result.invoice.id);
            } else {
                setError(result.error || 'Ошибка сохранения');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Save Invoice Error:', errorMessage);
            setError('Системная ошибка при сохранении');
        } finally {
            setLoading(false);
        }
    };

    const handleStartNew = () => {
        setInvoiceItems([]);
        setSavedInvoiceId(null);
        clearMessages();
    };

    const handleDownload = () => {
        if (!savedInvoiceId) return;
        // Формирование и скачивание накладной находится на эндпоинте, то есть в серверной среде
        router.replace(apiUrl.invoice.export(savedInvoiceId));
    };

    const renderTable = () => (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">№</TableHead>
                        <TableHead>Артикул</TableHead>
                        <TableHead>Наименование</TableHead>
                        <TableHead className="w-32">Кол-во</TableHead>
                        <TableHead className="w-32">Состояние</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead className="w-12" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoiceItems.map((item, index) => {
                        const product = item.product as Product;
                        const hasInitialPrice = (product.price ?? 0) > 0;

                        // Логика блокировок
                        const isPriceDisabled = item.condition === INVOICE_ITEM_CONDITION.OLD;
                        const isQuantityDisabled = item.condition === INVOICE_ITEM_CONDITION.REVALUATION;

                        // Формирование списка доступных условий
                        const conditionsToShow = Object.values(INVOICE_ITEM_CONDITION).filter((cond) => {
                            if (!hasInitialPrice) {
                                return cond === INVOICE_ITEM_CONDITION.NEW;
                            } else {
                                return cond !== INVOICE_ITEM_CONDITION.NEW;
                            }
                        });

                        return (
                            <TableRow key={product.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{product.article1C || '000001'}</TableCell>
                                <TableCell className="font-medium">{product.title}</TableCell>

                                <TableCell>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={item.quantity}
                                        disabled={isQuantityDisabled}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            handleItemChange(product.id, INVOICE_FIELDS.QUANTITY, val);
                                        }}
                                        className={`w-20 ${isQuantityDisabled ? 'bg-muted cursor-not-allowed' : ''}`}
                                    />
                                </TableCell>

                                <TableCell>
                                    <Select
                                        value={item.condition}
                                        disabled={!hasInitialPrice}
                                        onValueChange={(val) =>
                                            handleItemChange(product.id, INVOICE_FIELDS.CONDITION, val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {conditionsToShow.map((condition) => (
                                                <SelectItem key={condition} value={condition}>
                                                    {CONDITION_LABELS[condition]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>

                                <TableCell>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={item.price ?? 0}
                                        disabled={isPriceDisabled}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            handleItemChange(product.id, INVOICE_FIELDS.PRICE, val);
                                        }}
                                        className={`w-24 ${isPriceDisabled ? 'bg-muted cursor-not-allowed' : ''}`}
                                    />
                                </TableCell>

                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(product.id)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Формирование накладной</h3>
                    <p className="text-sm text-muted-foreground">
                        Найдите свои товары и добавьте их в акт приема-передачи
                    </p>
                </div>
                {savedInvoiceId && (
                    <Button variant="outline" onClick={handleStartNew}>
                        <Plus className="w-4 h-4 mr-2" /> Новая накладная
                    </Button>
                )}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Поиск товара по названию или артикулу..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {filteredProductsByTitleAndArticle.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md max-h-60 overflow-y-auto">
                        {filteredProductsByTitleAndArticle.map((product) => (
                            <div
                                key={product.id}
                                className="flex justify-between items-center p-3 hover:bg-muted cursor-pointer border-b last:border-0"
                                onClick={() => handleAddProduct(product)}
                            >
                                <div>
                                    <p className="font-medium">{product.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Артикул: {product.article1C || '000001'}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold">{product.price} ₽</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {invoiceItems.length > 0 ? (
                renderTable()
            ) : (
                <div className="text-center p-8 border border-dashed rounded-md bg-muted/20">
                    <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                        В накладной пока нет товаров. Используйте поиск выше, чтобы добавить их.
                    </p>
                </div>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {success && (
                <Alert>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <div className="flex justify-end gap-3 mt-4">
                <Button variant="default" onClick={handleSaveInvoice} disabled={invoiceItems.length === 0 || loading}>
                    {loading ? 'Сохранение...' : savedInvoiceId ? 'Обновить накладную' : 'Сохранить накладную'}
                </Button>
                <Button variant="secondary" onClick={handleDownload} disabled={!savedInvoiceId}>
                    <Download className="w-4 h-4 mr-2" />
                    Скачать Word (.docx)
                </Button>
            </div>
        </div>
    );
}
