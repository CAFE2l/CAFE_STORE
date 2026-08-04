import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/store/ProductGrid';
import { ProductPageWrapper } from '@/components/store/ProductPageWrapper';
import { ProductTabs } from '@/components/store/ProductTabs';
import { RecentlyViewed } from '@/components/store/RecentlyViewed';
import { ProductInfoFooter } from '@/components/store/ProductInfoFooter';
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp';
import ProductGalleryClient from '@/components/store/ProductGalleryClient';
import ErrorBoundaryClient from '@/components/ui/ErrorBoundaryClient';
import { PriceBlock } from '@/components/ui/PriceBlock';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';
import { logger } from '@/lib/logger';

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function getProductMedia(product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>) {
  const media = product.images.map((src, index) => ({
    src,
    alt: `${product.name} - imagem ${index + 1}`,
    label: ['Frente', 'Detalhe', 'Contexto', 'Verso', 'Design', 'Acabamento'][index] ?? `Angulo ${index + 1}`,
  }));

  // Do not add global supplemental images here — only use images that belong to the product
  return media;
}

function getSku(product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>) {
  return product.sku ?? `CAF-${product.slug.slice(0, 3).toUpperCase()}-${product.id.slice(-6).toUpperCase()}`;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug).catch(() => null);
  if (!product) {
    return { title: 'Produto | CAFÉ STORE', description: 'Detalhes do produto CAFÉ STORE.' };
  }
  return {
    title: `${product.name} | CAFÉ STORE`,
    description: product.description ?? 'Detalhes do produto CAFÉ STORE.',
    alternates: { canonical: `${baseUrl}/products/${product.slug}` },
    openGraph: {
      title: `${product.name} | CAFÉ STORE`,
      description: product.description ?? 'Produto oficial CAFÉ STORE.',
      url: `${baseUrl}/products/${product.slug}`,
      siteName: 'CAFÉ STORE',
      images: product.images[0] ? [{ url: `${baseUrl}${product.images[0]}`, alt: product.name }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | CAFÉ STORE`,
      description: product.description ?? 'Produto oficial CAFÉ STORE.',
      images: product.images[0] ? [`${baseUrl}${product.images[0]}`] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product;
  try {
    product = await getProductBySlug(params.slug);
    if (!product) notFound();
  } catch (err) {
    // If fetching fails for any reason, show the not-found page (which displays the 404 image)
    logger.error('products/[slug]', 'Failed to load product', {
      slug: params.slug,
      error: logger.serializeError(err),
    });
    notFound();
  }

  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id;
  } catch (err) {
    logger.error('products/[slug]', 'auth() failed, rendering as guest', {
      slug: params.slug,
      error: logger.serializeError(err),
    });
  }

  let wishlistFavorite: { id: string } | null = null;
  let legacyFavorite: { id: string } | null = null;
  if (userId) {
    try {
      const results = await Promise.all([
        prisma.wishlist.findUnique({
          where: {
            userId_productId: {
              userId,
              productId: product.id,
            },
          },
          select: { id: true },
        }),
        prisma.favorite.findUnique({
          where: {
            userId_productId: {
              userId,
              productId: product.id,
            },
          },
          select: { id: true },
        }),
      ]);
      wishlistFavorite = results[0];
      legacyFavorite = results[1];
    } catch (err) {
      logger.error('products/[slug]', 'Favorite lookup failed, treating product as not favorited', {
        slug: params.slug,
        error: logger.serializeError(err),
      });
    }
  }

  let relatedProducts: Awaited<ReturnType<typeof getRelatedProducts>> = [];
  try {
    relatedProducts = await getRelatedProducts(product);
  } catch (err) {
    logger.error('products/[slug]', 'Failed to load related products', {
      slug: params.slug,
      error: logger.serializeError(err),
    });
  }

  const images = getProductMedia(product);
  const averageRating = product.averageRating.toFixed(1);
  const sku = getSku(product);
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.oldPrice!) * 100) : 0;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images.map((i) => `${baseUrl}${i.src}`),
    description: product.description ?? 'Produto oficial CAFÉ STORE.',
    sku,
    brand: { '@type': 'Brand', name: 'CAFÉ STORE' },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'BRL',
      price: product.price.toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.reviewCount > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRating,
        reviewCount: product.reviewCount,
      },
    } : {}),
  };

  return (
    <main className="relative min-h-screen bg-surface-base px-4 pb-28 pt-20 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-48 top-40 h-[500px] w-[500px] rounded-full bg-brand/4 blur-[160px]" />
        <div className="absolute right-1/3 top-20 h-[500px] w-[500px] rounded-full bg-brand/6 blur-[140px]" />
        <div className="absolute -bottom-32 right-1/4 h-[400px] w-[400px] rounded-full bg-brand/3 blur-[120px]" />
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <FloatingWhatsApp productName={product.name} />

      <div className="mx-auto max-w-7xl">

        {/* Main Grid */}
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: Gallery */}
          <div className="relative">
            {/* client gallery that updates with selected variants */}
            {/* @ts-ignore */}
            <ProductGalleryClient productId={product.id} images={images} variants={product.variants} priority />
          </div>

          {/* Right: Info */}
          <div className="flex animate-fade-up flex-col gap-5 py-2">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-brand/25 bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
                {product.category.name}
              </span>
              {product.featured ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  Destaque
                </span>
              ) : null}
              {hasDiscount ? (
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white">
                  -{discountPercent}%
                </span>
              ) : null}
            </div>
            <h1 className="text-2xl font-bold leading-snug text-white lg:text-3xl">{product.name}</h1>
            <p className="text-sm leading-relaxed text-zinc-400">{product.description ?? 'Produto oficial CAFÉ STORE.'}</p>
            <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-zinc-300 shadow-sm backdrop-blur-md">
              <strong className="text-white">Apoio simbolico:</strong> as imagens sao ilustrativas. Este item nao e um produto real
              para entrega; o valor funciona como doacao para apoiar o projeto CAFÉ STORE.
            </div>

            <div className="h-px bg-zinc-800" />

            {/* Wrap client product UI with ErrorBoundaryClient to capture render errors */}
            <ErrorBoundaryClient
              context={{
                scope: 'products/[slug]',
                slug: params.slug,
                productId: product.id,
              }}
            >
              <ProductPageWrapper product={product} isFavorited={Boolean(wishlistFavorite || legacyFavorite)} />
            </ErrorBoundaryClient>
          </div>
        </section>



        {/* Tabs */}
        <ProductTabs
          category={product.category.name}
          description={product.description}
          productName={product.name}
          reviews={product.reviews}
          productId={product.id}
        />

        {/* Related Products */}
        {relatedProducts.length > 0 ? (
          <section className="mx-auto mt-14 max-w-7xl animate-fade-up px-6" style={{ animationDelay: '300ms' }}>
            <div>
              <h2 className="text-2xl font-bold text-white">Outras formas de apoiar</h2>
              <p className="mt-1 text-sm text-zinc-500">Itens simbolicos relacionados para contribuir com o projeto.</p>
            </div>
            <div className="mt-6">
              <ProductGrid products={relatedProducts} />
            </div>
          </section>
        ) : null}

        <ProductInfoFooter />
      </div>

      <RecentlyViewed />
    </main>
  );
}
