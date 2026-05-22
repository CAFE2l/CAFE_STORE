import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/store/ProductGrid';
import { ProductPurchasePanel } from '@/components/store/ProductPurchasePanel';
import { ProductTabs } from '@/components/store/ProductTabs';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
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
    { src: '/images/banners/Produtos.png', alt: `${product.name} em contexto CAFÉ Store`, label: 'Contexto real' },
    { src: '/images/mascote.png', alt: 'Mascote oficial CAFÉ Store', label: 'Identidade CAFÉ' },
    { src: '/images/produtos/banner.png', alt: 'Produto CAFÉ Store em uso', label: 'Lifestyle' },
  ];

  for (const item of supplemental) {
    if (media.length >= 6) break;
    if (!media.some((image) => image.src === item.src)) {
      media.push(item);
    }
  }

  return media.slice(0, 6);
}

function getSku(product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>) {
  return `CAF-${product.slug.slice(0, 3).toUpperCase()}-${product.id.slice(-6).toUpperCase()}`;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug).catch(() => null);

  if (!product) {
    return {
      title: 'Produto | Cafe Store',
      description: 'Detalhes do produto Cafe Store.',
    };
  }

  return {
    title: `${product.name} | Cafe Store`,
    description: product.description ?? 'Detalhes do produto Cafe Store.',
    alternates: {
      canonical: `${baseUrl}/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | Cafe Store`,
      description: product.description ?? 'Produto oficial CAFÉ Store.',
      url: `${baseUrl}/products/${product.slug}`,
      siteName: 'CAFÉ Store',
      images: product.images[0] ? [{ url: `${baseUrl}${product.images[0]}`, alt: product.name }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Cafe Store`,
      description: product.description ?? 'Produto oficial CAFÉ Store.',
      images: product.images[0] ? [`${baseUrl}${product.images[0]}`] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product);
  const images = getProductMedia(product);
  const averageRating = product.averageRating.toFixed(1);
  const sku = getSku(product);
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images.map((image) => `${baseUrl}${image.src}`),
    description: product.description ?? 'Produto oficial CAFÉ Store.',
    sku,
    brand: {
      '@type': 'Brand',
      name: 'CAFÉ Store',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'BRL',
      price: product.price.toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: averageRating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  return (
    <main className="container-page grid gap-12 py-10 animate-fadeIn">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <nav className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
        <Link href="/" className="transition hover:text-cafe-orange-500">Home</Link>
        <span>&gt;</span>
        <Link href="/products" className="transition hover:text-cafe-orange-500">Produtos</Link>
        <span>&gt;</span>
        <Link href={`/products?category=${product.category.slug}`} className="transition hover:text-cafe-orange-500">{product.category.name}</Link>
        <span>&gt;</span>
        <span className="text-text-primary">{product.name}</span>
      </nav>

      <section className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
        <ImageGallery images={images} priority />
        <div className="grid content-start gap-6">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={product.stock > 0 ? 'success' : 'error'}>
                {product.stock > 0 ? 'Em estoque' : 'Indisponível'}
              </Badge>
              {Number(product.oldPrice) > Number(product.price) ? (
                <Badge variant="sale">-{Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)}%</Badge>
              ) : null}
              {product.featured ? <Badge variant="hot">Destaque</Badge> : null}
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-cafe-orange-500">{product.category.name}</p>
            <h1 className="font-display text-3xl font-bold leading-tight text-text-primary md:text-4xl">
              {product.name}
            </h1>
            <p className="text-sm leading-7 text-text-secondary">
              {product.description ?? 'Produto oficial CAFÉ Store.'}
            </p>
            <p className="text-xs text-text-muted">SKU: {sku}</p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-cafe-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < Math.round(Number(averageRating)) ? '★' : '☆'}</span>
              ))}
            </div>
            <span className="text-text-muted">
              {product.reviewCount > 0
                ? `${averageRating} (${product.reviewCount} avaliações)`
                : 'Ainda sem avaliações'}
            </span>
          </div>

          <PriceBlock price={product.price} oldPrice={product.oldPrice} showInstallments />
          <ProductPurchasePanel product={product} />
        </div>
      </section>

      <section className="grid gap-4 rounded-card border border-border-subtle bg-cafe-dark-800 p-5 md:grid-cols-3">
        {[
          { title: '🔒 Pagamento seguro', desc: 'Pix, cartão, Mercado Pago e PayPal.' },
          { title: '🔄 Garantia CAFÉ Store', desc: 'Troca ou devolução em até 7 dias.' },
          { title: '📦 Frete rápido', desc: 'Enviamos para todo o Brasil.' },
        ].map((item) => (
          <div key={item.title}>
            <p className="text-sm font-semibold text-text-primary">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-text-muted">{item.desc}</p>
          </div>
        ))}
      </section>

      <ProductTabs
        category={product.category.name}
        description={product.description}
        productName={product.name}
      />

      <section className="grid gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-text-primary">Video do produto</h2>
          <p className="mt-2 text-sm text-text-secondary">Espaco reservado para demonstracao curta em uso real.</p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-background-card">
          <Image src={images[0].src} alt={`${product.name} em video demonstrativo`} fill sizes="100vw" className="object-cover opacity-70" />
          <div className="absolute inset-0 grid place-items-center bg-black/35">
            <span className="rounded-full border border-white/20 bg-black/70 px-5 py-3 text-sm font-semibold text-white">
              Video curto em producao
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary">Avaliações</h2>
          <p className="mt-1 text-sm text-text-muted">O que nossos clientes estão dizendo.</p>
        </div>
        {product.reviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {product.reviews.map((review) => (
              <article key={review.id} className="rounded-card border border-border-subtle bg-cafe-dark-800 p-5">
                <div className="flex items-center gap-3">
                  {review.user.image ? (
                    <Image src={review.user.image} alt={review.user.name ?? 'Cliente'} width={40} height={40} className="rounded-full" />
                  ) : (
                    <span className="grid size-10 place-items-center rounded-full bg-cafe-orange-500/10 text-sm font-semibold text-cafe-orange-500">
                      {(review.user.name ?? 'C').slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{review.user.name ?? 'Cliente'}</p>
                    <p className="text-xs text-text-muted">{review.verifiedPurchase ? '✓ Compra verificada' : 'Avaliação'}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-cafe-yellow-500 text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                  ))}
                </div>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{review.comment ?? 'Cliente avaliou este produto.'}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-border-subtle bg-cafe-dark-800 p-8 text-center text-sm text-text-muted">
            Este produto ainda não recebeu avaliações.
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-2xl font-bold text-text-primary">Perguntas frequentes</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <article className="rounded-card border border-border-subtle bg-cafe-dark-800 p-5">
            <p className="text-sm font-semibold text-text-primary">Tem pronta entrega?</p>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              O estoque exibido indica a disponibilidade atual.
            </p>
          </article>
          <article className="rounded-card border border-border-subtle bg-cafe-dark-800 p-5">
            <p className="text-sm font-semibold text-text-primary">Posso trocar?</p>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Sim, seguindo a política de devolução de 7 dias.
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary">Você também pode gostar</h2>
          <p className="mt-1 text-sm text-text-muted">Produtos relacionados para completar seu pedido.</p>
        </div>
        <ProductGrid products={relatedProducts} />
      </section>
    </main>
  );
}
