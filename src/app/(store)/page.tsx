import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BannerCarousel } from '@/components/store/BannerCarousel';
import { ProductGrid } from '@/components/store/ProductGrid';
import { getFeaturedProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'CAFÉ STORE | Sites e Web Aplicações',
  description: 'Criação de sites, landing pages, web aplicações e apoios simbolicos ao projeto CAFÉ.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featuredProducts] = await Promise.all([getFeaturedProducts(8)]);

  return (
    <main>
      <section className="relative container-page grid min-h-[calc(100vh-5rem)] items-center gap-10 py-12 lg:grid-cols-[1fr_0.9fr]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2b0b0b] text-sm text-cafe-orange-300 border border-[#4a1a14]">Sites, landing pages e web aplicações</span>
          </div>
          <h1 className="mt-6 font-display text-6xl font-bold leading-tight sm:text-7xl lg:text-[5.5rem]">
            <div className="text-white">TUDO PARA</div>
            <div className="text-white">SUA</div>
            <div className="text-gradient-fire text-glow">IDENTIDADE DIGITAL.</div>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-text-secondary">Criação de web-aplicações, agências digitais, sites e landing pages para você e seu negócio</p>
          <div className="mt-8 flex gap-4">
          <Link href="/servicos" className="btn-primary">Ver serviços</Link>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="relative w-[420px] h-[420px] lg:w-[520px] lg:h-[520px]">
            <Image src="/images/mascote.png" alt="Mascote" fill className="object-contain drop-shadow-[0_20px_60px_rgba(230,126,34,0.45)]" />
          </div>
        </div>
      </section>

      <BannerCarousel />

      <section className="container-page py-16">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold text-text-primary">Apoios simbólicos</h2>
          <p className="mt-2 text-sm text-text-muted">Itens ilustrativos para apoiar o projeto. Nao ha envio fisico.</p>
        </div>
        <ProductGrid products={featuredProducts} />
        <div className="mt-8 text-center">
          <Link href="/products" className="btn-secondary">
            Ver apoios
          </Link>
        </div>
      </section>


      
    </main>
  );
}
