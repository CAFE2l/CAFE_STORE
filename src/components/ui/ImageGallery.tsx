'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const selectedImage = safeImages[selectedIndex] ?? safeImages[0];

  useEffect(() => {
    setSelectedIndex(0);
    setModalIndex(0);
    thumbScrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, [images]);

  const goTo = useCallback((index: number) => {
    const target = (index + safeImages.length) % safeImages.length;
    setIsTransitioning(true);
    setSelectedIndex(target);
    setTimeout(() => setIsTransitioning(false), 200);
    if (thumbScrollRef.current) {
      const thumb = thumbScrollRef.current.children[target] as HTMLElement | undefined;
      thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [safeImages.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(selectedIndex + 1) : goTo(selectedIndex - 1);
    }
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowModal(false);
      if (showModal) {
        if (e.key === 'ArrowLeft') setModalIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
        if (e.key === 'ArrowRight') setModalIndex((i) => (i + 1) % safeImages.length);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, safeImages.length]);

  return (
    <>
      <div className="flex animate-fade-in flex-col gap-4">
        <div
          ref={mainRef}
          className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-surface-2 lg:aspect-[4/3] cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="relative h-full w-full transition-opacity duration-200"
            style={{ opacity: isTransitioning ? 0.5 : 1 }}
          >
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-full w-full object-cover select-none"
              priority={priority}
              draggable={false}
            />
          </div>

          {isZooming && (
            <div
              className="pointer-events-none absolute inset-0 z-10 hidden lg:block"
              style={{
                backgroundImage: `url(${selectedImage.src})`,
                backgroundSize: '200%',
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}

          {selectedImage.label ? (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-surface-1/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {selectedImage.label}
            </span>
          ) : null}

          {safeImages.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-2 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-105 active:scale-95"
                onClick={(e) => { e.stopPropagation(); goTo(selectedIndex - 1); }}
                aria-label="Imagem anterior"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70 hover:scale-105 active:scale-95"
                onClick={(e) => { e.stopPropagation(); goTo(selectedIndex + 1); }}
                aria-label="Proxima imagem"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          ) : null}

          <button
            type="button"
            className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full bg-black/50 text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white"
            onClick={() => { setModalIndex(selectedIndex); setShowModal(true); }}
            aria-label="Ampliar imagem"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
          </button>

          {safeImages.length > 1 ? (
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-surface-1/60 px-3 py-1 text-xs text-white/60 backdrop-blur-sm">
              {selectedIndex + 1}/{safeImages.length}
            </div>
          ) : null}
        </div>

        {safeImages.length > 1 ? (
          <div ref={thumbScrollRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin snap-x snap-mandatory">
            {safeImages.map((image, index) => (
              <button
                key={image.src}
                type="button"
                className={cn(
                  'flex-shrink-0 snap-start overflow-hidden rounded-xl border-2 transition-all duration-200',
                  selectedIndex === index
                    ? 'size-[72px] border-brand opacity-100 shadow-glow-sm'
                    : 'size-[72px] border-transparent opacity-45 hover:border-zinc-600 hover:opacity-75',
                )}
                aria-label={`Ver imagem ${index + 1}: ${image.label ?? image.alt}`}
                onClick={() => goTo(index)}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={72}
                  height={72}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? undefined : 'lazy'}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {showModal ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={() => setShowModal(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={(e) => {
            handleTouchEnd(e);
            if (Math.abs(touchStartX.current - touchEndX.current) > 50) return;
          }}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
            onClick={() => setShowModal(false)}
            aria-label="Fechar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
              onClick={(e) => { e.stopPropagation(); setModalIndex((i) => (i - 1 + safeImages.length) % safeImages.length); }}
              aria-label="Imagem anterior"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
              onClick={(e) => { e.stopPropagation(); setModalIndex((i) => (i + 1) % safeImages.length); }}
              aria-label="Proxima imagem"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div
            className="relative h-[90vh] w-[90vw] animate-scaleIn cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={(safeImages[modalIndex] ?? safeImages[0]).src}
              alt={(safeImages[modalIndex] ?? safeImages[0]).alt}
              fill
              sizes="90vw"
              className="object-contain select-none"
              draggable={false}
              priority
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {safeImages.map((_, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === modalIndex ? 'w-6 bg-brand' : 'w-2 bg-white/30 hover:bg-white/50',
                )}
                onClick={(e) => { e.stopPropagation(); setModalIndex(index); }}
                aria-label={`Imagem ${index + 1}`}
              />
            ))}
          </div>

          <span className="absolute right-14 top-4 text-sm font-medium text-white/60 z-10">
            {modalIndex + 1}/{safeImages.length}
          </span>
        </div>
      ) : null}
    </>
  );
}
