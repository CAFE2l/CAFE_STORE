'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

type ProductFiltersProps = {
  categories: { id: string; name: string; slug: string }[];
};

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qParam = searchParams.get('q') ?? '';
  const categoryParam = searchParams.get('category') ?? '';
  const sortParam = searchParams.get('sort') ?? 'relevance';

  const [search, setSearch] = useState(qParam);
  const [category, setCategory] = useState(categoryParam);
  const [sort, setSort] = useState(sortParam);
  const debouncedSearch = useDebounce(search, 300);

  const buildHref = useCallback(
    (q: string, cat: string, s: string) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (cat) params.set('category', cat);
      if (s && s !== 'relevance') params.set('sort', s);
      const qs = params.toString();
      return `/products${qs ? `?${qs}` : ''}`;
    },
    [],
  );

  useEffect(() => {
    router.replace(buildHref(debouncedSearch, category, sort));
  }, [debouncedSearch, category, sort, router, buildHref]);

  return (
    <div className="mb-8 animate-fade-up rounded-2xl border border-white/[0.08] bg-[rgba(26,26,26,0.6)] p-6 opacity-0 backdrop-blur"
      style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
    >
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px_180px]">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Buscar</label>
          <input
            className="w-full rounded-xl border border-zinc-700 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition-all duration-200 focus:border-[#FF7A00]/60 focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,122,0,0.1)]"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome do apoio"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Categoria</label>
          <select
            className="w-full rounded-xl border border-zinc-700 bg-white/[0.04] px-4 py-3 text-sm text-white transition-all duration-200 focus:border-[#FF7A00]/60 focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,122,0,0.1)]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="" className="bg-[#1a1a1a]">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug} className="bg-[#1a1a1a]">{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Ordenar</label>
          <select
            className="w-full rounded-xl border border-zinc-700 bg-white/[0.04] px-4 py-3 text-sm text-white transition-all duration-200 focus:border-[#FF7A00]/60 focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,122,0,0.1)]"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="relevance" className="bg-[#1a1a1a]">Relevância</option>
            <option value="price-asc" className="bg-[#1a1a1a]">Menor preço</option>
            <option value="price-desc" className="bg-[#1a1a1a]">Maior preço</option>
            <option value="newest" className="bg-[#1a1a1a]">Mais recente</option>
            <option value="bestselling" className="bg-[#1a1a1a]">Mais vendido</option>
            <option value="rating" className="bg-[#1a1a1a]">Melhor avaliado</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/products"
          className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
        >
          Limpar
        </Link>
      </div>
    </div>
  );
}
