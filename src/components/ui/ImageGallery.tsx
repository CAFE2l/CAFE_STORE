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
      <div className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 bg-background-card">
        <Image
          src={selectedImage.src}
          alt={selectedImage.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-110"
          priority={priority}
        />
        {selectedImage.label ? (
          <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {selectedImage.label}
          </span>
        ) : null}
      </div>
      {safeImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {safeImages.map((image) => (
            <button
              key={image.src}
              type="button"
              className={cn(
                'relative aspect-square overflow-hidden rounded-xl border bg-background-card transition',
                selectedImage.src === image.src
                  ? 'border-accent-primary led-subtle'
                  : 'border-white/10 hover:border-accent-primary/40',
              )}
              aria-label={`Ver imagem: ${image.label ?? image.alt}`}
              onClick={() => setSelectedImage(image)}
            >
              <Image src={image.src} alt={image.alt} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
