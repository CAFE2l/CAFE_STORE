'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkLabel: string | null;
};

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/banners')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBanners(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (loading || banners.length === 0) return null;

  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl px-6">
      <div className="relative aspect-[21/9] overflow-hidden rounded-2xl">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-700',
              i === current ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
          >
            {banner.linkUrl ? (
              <Link href={banner.linkUrl} className="block h-full w-full">
                <Image src={banner.imageUrl} alt={banner.title} fill sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg font-display">{banner.title}</h2>
                  {banner.subtitle ? <p className="mt-1 text-sm text-zinc-300 drop-shadow">{banner.subtitle}</p> : null}
                </div>
              </Link>
            ) : (
              <>
                <Image src={banner.imageUrl} alt={banner.title} fill sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg font-display">{banner.title}</h2>
                  {banner.subtitle ? <p className="mt-1 text-sm text-zinc-300 drop-shadow">{banner.subtitle}</p> : null}
                </div>
              </>
            )}
          </div>
        ))}

        {banners.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === current ? 'w-6 bg-brand' : 'w-2 bg-white/40 hover:bg-white/60',
                )}
                onClick={() => setCurrent(i)}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
