import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/store/ProductGrid';
import { ProductPageWrapper } from '@/components/store/ProductPageWrapper';
import { ProductTabs } from '@/components/store/ProductTabs';
import { RecentlyViewed } from '@/components/store/RecentlyViewed';
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { PriceBlock } from '@/components/ui/PriceBlock';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';

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

  const supplemental = [
    { src: '/images/banners/Produtos.png', alt: `${product.name} em contexto CAFÉ STORE`, label: 'Contexto real' },
    { src: '/images/mascote.png', alt: 'Mascote oficial CAFÉ STORE', label: 'Identidade CAFÉ' },
    { src: '/images/produtos/banner.png', alt: 'Produto CAFÉ STORE em uso', label: 'Lifestyle' },
  ];

  for (const item of supplemental) {
    if (media.length >= 8) break;
    if (!media.some((image) => image.src === item.src)) {
      media.push(item);
    }
  }

  return media.slice(0, 8);
}

function getSku(product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>) {
  return `CAF-${product.slug.slice(0, 3).toUpperCase()}-${product.id.slice(-6).toUpperCase()}`;
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
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product);
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
    <main className="relative min-h-screen bg-surface-base px-6 pb-28 pt-20">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute right-1/3 top-20 h-[500px] w-[500px] rounded-full bg-brand/6 blur-[140px]" />
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <FloatingWhatsApp productName={product.name} />

      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8 flex animate-fade-in flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="transition-colors hover:text-zinc-300">Home</Link>
          <span className="text-zinc-700">&gt;</span>
          <Link href="/products" className="transition-colors hover:text-zinc-300">Produtos</Link>
          <span className="text-zinc-700">&gt;</span>
          <Link href={`/products?category=${product.category.slug}`} className="transition-colors hover:text-zinc-300">{product.category.name}</Link>
          <span className="text-zinc-700">&gt;</span>
          <span className="text-zinc-300">{product.name}</span>
        </nav>

        {/* Main Grid */}
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: Gallery */}
          <div className="relative">
            <ImageGallery images={images} priority />
          </div>

          {/* Right: Info */}
          <div className="flex animate-fade-up flex-col gap-5 py-2">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-brand/25 bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
                {product.category.name}
              </span>
              {product.featured ? (
                <span className="rounded-full bg-[#FFD000]/15 px-3 py-1 text-xs font-semibold text-[#FFD000]">
                  🔥 Mais Vendido
                </span>
              ) : null}
              {hasDiscount ? (
                <span className="rounded-full border border-[#FF3C38]/30 bg-[#FF3C38]/15 px-3 py-1 text-xs font-bold text-[#FF3C38]">
                  -{discountPercent}%
                </span>
              ) : null}
            </div>

            <p className="text-xs font-medium uppercase tracking-wider text-brand">{product.category.name}</p>
            <h1 className="text-2xl font-bold leading-snug text-white lg:text-3xl">{product.name}</h1>
            <p className="text-sm leading-relaxed text-zinc-400">{product.description ?? 'Produto oficial CAFÉ STORE.'}</p>
            <div className="rounded-xl border border-brand/30 bg-brand/10 p-4 text-sm leading-6 text-zinc-300">
              <strong className="text-white">Apoio simbolico:</strong> as imagens sao ilustrativas. Este item nao e um produto real
              para entrega; o valor funciona como doacao para apoiar o projeto CAFÉ STORE.
            </div>

            <div className="h-px bg-zinc-800" />

            <ProductPageWrapper product={product} />
          </div>
        </section>

        {/* Trust signals */}
        <div className="mx-auto mt-10 max-w-7xl animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: '🔒', title: 'Pagamento seguro', desc: 'Pix, cartao, Mercado Pago e PayPal.' },
              { icon: '💛', title: 'Doacao simbolica', desc: 'O valor apoia o projeto CAFÉ STORE.' },
              { icon: 'ℹ', title: 'Sem envio fisico', desc: 'As imagens sao ilustrativas e nao ha entrega.' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-1.5 rounded-xl border border-zinc-800 bg-surface-2/50 p-5 transition-all duration-300 hover:border-brand/20 hover:bg-surface-2">
                <span className="mb-1 text-xl">{item.icon}</span>
                <span className="text-sm font-semibold text-white">{item.title}</span>
                <span className="text-xs leading-relaxed text-zinc-500">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <ProductTabs
          category={product.category.name}
          description={product.description}
          productName={product.name}
          reviews={product.reviews}
        />

        {/* Related Products */}
        <section className="mx-auto mt-14 max-w-7xl px-6">
          <div>
            <h2 className="text-2xl font-bold text-white font-display">Outras formas de apoiar</h2>
            <p className="mt-1 text-sm text-zinc-500">Itens simbolicos relacionados para contribuir com o projeto.</p>
          </div>
          <div className="mt-6">
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      </div>

      <RecentlyViewed />
    </main>
  );
}
