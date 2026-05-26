import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BannerCarousel } from '@/components/store/BannerCarousel';
import { ProductGrid } from '@/components/store/ProductGrid';
import { getFeaturedProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'CAFÉ STORE | Sites e Web Aplicações',
  description: 'Criação de sites, landing pages, web aplicações e apoios simbolicos ao projeto CAFÉ.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();

  const [featuredProducts, userFavorites] = await Promise.all([
    getFeaturedProducts(8),
    session?.user?.id
      ? prisma.favorite.findMany({ where: { userId: session.user.id }, select: { productId: true } })
      : Promise.resolve([]),
  ]);

  const favoriteIds = userFavorites.map((f) => f.productId);

  return (
    <main className="overflow-hidden bg-[#050505]">
      <section className="hero-tech-grid relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden bg-[#050505]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(220,38,38,0.16),transparent_36%),radial-gradient(ellipse_at_82%_30%,rgba(249,115,22,0.12),transparent_34%),radial-gradient(ellipse_at_26%_72%,rgba(250,204,21,0.08),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_28%,rgba(0,0,0,0.45))]" />
        <div className="hero-led-line absolute left-0 right-0 top-28" />
        <div className="hero-led-line hero-led-line-warm absolute bottom-36 left-0 right-0" />
        <div className="absolute left-0 top-1/3 h-40 w-px bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />
        <div className="absolute right-0 top-1/4 h-40 w-px bg-gradient-to-b from-transparent via-yellow-400/30 to-transparent" />

        <div className="container-page relative grid items-center gap-12 pb-20 pt-28 lg:grid-cols-[1fr_0.92fr] lg:pb-24 lg:pt-32">
          <div className="max-w-3xl animate-slide-in-left text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-1.5 text-xs font-medium text-red-300 shadow-[0_0_30px_rgba(220,38,38,0.12)] backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.75)]" />
              Marketplace Digital — Lançamento em 2026
            </div>

            <h1 className="text-balance text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              <span>TUDO PARA SUA</span>
              <br />
              <span className="hero-gradient-text">IDENTIDADE</span>
              <br />
              <span className="hero-gradient-text">DIGITAL.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-zinc-400 lg:mx-0 lg:text-lg">
              Criação de web-aplicações, agências digitais, sites e landing pages para você e seu negócio.
            </p>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
              <Link
                href="/servicos"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 p-[1px] transition-all duration-500 ease-out hover:scale-[1.03] hover:shadow-[0_0_44px_rgba(249,115,22,0.32)]"
              >
                <span className="block rounded-xl bg-[#050505] px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 group-hover:bg-transparent">
                  Explorar serviços
                </span>
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 px-8 py-3.5 text-sm font-semibold text-zinc-300 transition-all duration-300 ease-out hover:border-zinc-500 hover:text-white hover:shadow-[0_0_22px_rgba(255,255,255,0.06)]"
              >
                Ver apoios
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-[460px] animate-scale-in items-center justify-center lg:min-h-[620px]">
            <div className="hero-mascot-glow absolute h-[min(78vw,620px)] w-[min(78vw,620px)] rounded-full bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-400/15 blur-[120px]" />
            <div className="hero-mascot-float relative -mt-6 flex items-center justify-center lg:-mt-24">
              <div className="relative h-[min(86vw,560px)] w-[min(86vw,560px)]">
                <div className="absolute inset-6 scale-110 rounded-full bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-400/10 blur-[60px]" />
                <Image
                  src="/images/mascot/mascote.png"
                  alt="Mascote CAFÉ STORE"
                  fill
                  priority
                  sizes="(max-width: 1024px) 86vw, 560px"
                  className="object-contain drop-shadow-[0_30px_80px_rgba(249,115,22,0.36)]"
                />
              </div>
            </div>

            <div className="absolute left-0 top-[31%] h-px w-28 bg-gradient-to-r from-transparent via-red-500 to-orange-500 lg:-left-12 lg:w-36" />
            <div className="absolute right-0 top-[24%] h-px w-28 bg-gradient-to-l from-transparent via-yellow-400 to-orange-500 lg:-right-12 lg:w-36" />
            <div className="absolute bottom-10 left-1/2 h-24 w-px bg-gradient-to-t from-red-500/50 via-orange-500/30 to-transparent" />

            <span className="absolute left-[15%] top-[15%] h-1.5 w-1.5 rounded-full bg-red-400/50 shadow-[0_0_16px_rgba(248,113,113,0.7)]" />
            <span className="absolute right-[20%] top-[10%] h-1 w-1 rounded-full bg-yellow-400/50 shadow-[0_0_16px_rgba(250,204,21,0.65)]" />
            <span className="absolute bottom-[20%] left-[20%] h-1 w-1 rounded-full bg-orange-400/40 shadow-[0_0_16px_rgba(251,146,60,0.65)]" />
            <span className="absolute bottom-[15%] right-[15%] h-1.5 w-1.5 rounded-full bg-red-400/40 shadow-[0_0_16px_rgba(248,113,113,0.6)]" />
          </div>
        </div>

        <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 animate-float flex-col items-center gap-2 md:flex">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-600">Scroll</span>
          <div className="h-10 w-px bg-gradient-to-b from-red-500/60 via-orange-500/30 to-transparent" />
        </div>
      </section>

      <BannerCarousel />

      <section className="container-page py-16">
        <div>
          <h2 className="text-3xl font-bold text-white md:text-4xl">Apoios simbólicos</h2>
          <p className="mt-1 text-sm text-white/40">Itens ilustrativos para apoiar o projeto. Nao ha envio fisico.</p>
          <div className="mb-8 mt-3 h-0.5 w-12 rounded-full bg-orange-500" />
        </div>
        <ProductGrid products={featuredProducts} favoriteIds={favoriteIds} />
        <div className="mt-8 text-center">
          <Link href="/products" className="btn-secondary">
            Ver apoios
          </Link>
        </div>
      </section>


      
    </main>
  );
}
