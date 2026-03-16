'use client';

import { ImageIcon, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { isImageData } from '@/shared/guards/image.guard';
import type { Product } from '@/shared/types/payload-types';

interface AuthorProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

export function AuthorProductCard({ product, onEdit, onDelete }: AuthorProductCardProps) {
    const firstImage = product.gallery?.[0]?.image;
    const thumbUrl = isImageData(firstImage) ? firstImage.url : null;

    const { title, description, article1C, price, quantity } = product;

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row">
                {/* Изображения */}
                <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-muted flex items-center justify-center">
                    {thumbUrl ? (
                        <Image
                            src={thumbUrl}
                            alt={title}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 192px"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-8 w-8 mb-1" />
                            <span className="text-xs">Нет фото</span>
                        </div>
                    )}
                </div>

                {/* Основной контент */}
                <div className="flex-1 p-4">
                    <CardHeader className="p-0 pb-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <CardTitle className="text-lg">{title}</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(product)}
                                    className="h-8 px-2"
                                >
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Редактировать
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onDelete(product)}
                                    className="h-8 px-2"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Удалить
                                </Button>
                            </div>
                        </div>
                        {description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
                        )}
                    </CardHeader>

                    <Separator className="my-3" />

                    {/* Информационные блоки */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Артикул 1С</span>
                                <span className="font-medium">{article1C}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Цена</span>
                                <span className="font-medium">{price ? `${price} ₽` : undefined}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Остаток</span>
                                <span className="font-medium">{quantity != null ? `${quantity} шт.` : undefined}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
