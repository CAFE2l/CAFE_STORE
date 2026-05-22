'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type GalleryImage = {
  src: string;
  alt: string;
  label?: string;
};

type ImageGalleryProps = {
  images: GalleryImage[];
  priority?: boolean;
};

const fallbackImage: GalleryImage = {
  src: '/placeholder-product.svg',
  alt: 'Produto Cafe Store',
};

export function ImageGallery({ images, priority = false }: ImageGalleryProps) {
  const safeImages = images.length > 0 ? images : [fallbackImage];
  const [selectedImage, setSelectedImage] = useState(safeImages[0]);

  return (
    <div className="grid gap-4">
      <div className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-card border border-border-subtle bg-background-card">
        <Image
          src={selectedImage.src}
          alt={selectedImage.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          priority={priority}
        />
        {selectedImage.label ? (
          <span className="absolute left-4 top-4 rounded-badge bg-cafe-dark-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {selectedImage.label}
          </span>
        ) : null}
        {safeImages.length > 1 ? (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-cafe-dark-900/60 px-3 py-1 text-xs text-white/60 backdrop-blur-sm">
            {safeImages.indexOf(selectedImage) + 1}/{safeImages.length}
          </div>
        ) : null}
      </div>
      {safeImages.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {safeImages.map((image) => (
            <button
              key={image.src}
              type="button"
              className={cn(
                'relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-background-card transition-all duration-200',
                selectedImage.src === image.src
                  ? 'border-cafe-red-500 shadow-warm'
                  : 'border-border-subtle hover:border-cafe-orange-500/40',
              )}
              aria-label={`Ver imagem: ${image.label ?? image.alt}`}
              onClick={() => setSelectedImage(image)}
            >
              <Image src={image.src} alt={image.alt} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
