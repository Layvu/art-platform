'use client';

import React, { useCallback, useState } from 'react';

import { Loader2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';

import { authorClientService } from '@/services/api/client/author-client.service';
import { isImageData } from '@/shared/guards/image.guard';
import type { IGalleryItem } from '@/shared/types/product.type';

interface GalleryUploaderProps {
    value?: IGalleryItem[] | null;
    onChange: (items: IGalleryItem[]) => void;
}

export default function GalleryUploader({ value = [], onChange }: GalleryUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const images = value || [];

    const uploadFiles = async (files: File[]) => {
        setUploading(true);
        const uploadedItems = [...images];

        for (const file of files) {
            const res = await authorClientService.uploadMedia(file);

            if (res.success && res.media) {
                uploadedItems.push({ image: res.media });
            }
        }

        onChange(uploadedItems);
        setUploading(false);
    };

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            uploadFiles(acceptedFiles);
        },
        [images, onChange],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        disabled: uploading,
    });

    const handleRemoveImage = (indexToRemove: number) => {
        if (uploading) return;
        onChange(images.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                    ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Загрузка изображений...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Перетащите изображения сюда или кликните для выбора
                        </p>
                    </div>
                )}
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                    {images.map((item, idx) => {
                        const imgObj = isImageData(item.image) ? item.image : null;

                        return (
                            <div key={idx} className="relative group aspect-square rounded-md overflow-hidden border">
                                {imgObj?.url ? (
                                    <Image
                                        src={imgObj.url}
                                        alt="Gallery item"
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-center p-2">
                                        Нет превью
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    disabled={uploading}
                                    className="absolute top-1 right-1 bg-background/80 hover:bg-destructive hover:text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
