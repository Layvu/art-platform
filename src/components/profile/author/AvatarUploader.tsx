'use client';

import React, { useCallback, useState } from 'react';

import { Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';

import { authorClientService } from '@/services/api/client/author-client.service';
import { isImageData } from '@/shared/guards/image.guard';
import type { Media } from '@/shared/types/payload-types';

interface AvatarUploaderProps {
    value?: number | Media | null;
    onChange: (image: Media | null) => void;
}

export default function AvatarUploader({ value, onChange }: AvatarUploaderProps) {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            setUploading(true);

            try {
                const res = await authorClientService.uploadMedia(file);
                if (res.success && res.media) {
                    onChange(res.media);
                }
            } finally {
                setUploading(false);
            }
        },
        [onChange],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1, // Аватар всегда один
        disabled: uploading,
    });

    const imageUrl = isImageData(value) ? value.url : null;

    return (
        <div className="flex items-center gap-6">
            <div
                {...getRootProps()}
                className={`relative group flex shrink-0 items-center justify-center w-32 h-32 rounded-full border-2 overflow-hidden cursor-pointer transition-colors
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/50 hover:border-primary/50'}
                    ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <input {...getInputProps()} />

                {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary z-10" />
                ) : (
                    <>
                        {imageUrl ? (
                            <Image src={imageUrl} alt="Avatar" fill unoptimized className="object-cover" />
                        ) : (
                            <Camera className="w-8 h-8 text-muted-foreground" />
                        )}

                        {imageUrl && (
                            <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-foreground" />
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="text-sm text-muted-foreground">
                <p>Нажмите или перетащите изображение</p>
            </div>
        </div>
    );
}
