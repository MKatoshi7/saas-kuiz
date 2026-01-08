'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    fill?: boolean;
    sizes?: string;
    quality?: number;
}

export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    fill = false,
    sizes,
    quality = 85,
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
            )}
            <Image
                src={src}
                alt={alt}
                width={fill ? undefined : width}
                height={fill ? undefined : height}
                fill={fill}
                sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
                quality={quality}
                priority={priority}
                className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                onLoadingComplete={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
            />
        </div>
    );
}
