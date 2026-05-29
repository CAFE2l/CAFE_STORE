'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkLabel: string | null;
};

type BannerCarouselProps = {
  banners: Banner[];
};

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const banner = banners[current];

  return (
    <section className="relative h-[50vh] min-h-[320px] w-full overflow-hidden bg-[#050505] lg:h-[60vh]">
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto flex w-full max-w-7xl items-end justify-between px-6 pb-12 lg:pb-16">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {banner.title && (
                  <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                    {banner.title}
                  </h2>
                )}
                {banner.subtitle && (
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-300 drop-shadow sm:text-base">
                    {banner.subtitle}
                  </p>
                )}
                {banner.linkUrl && (
                  <Link
                    href={banner.linkUrl}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-400 active:scale-[0.97]"
                  >
                    {banner.linkLabel || 'Ver mais'}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Banner ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 bg-orange-500'
                  : 'h-2 w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
