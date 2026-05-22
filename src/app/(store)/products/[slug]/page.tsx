import type { Metadata } from 'next';
import Image from 'next/image';
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
    <main className="container-page grid gap-12 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Breadcrumb
        items={[
          { href: '/', label: 'Inicio' },
          { href: '/products', label: 'Produtos' },
          { href: `/products?category=${product.category.slug}`, label: product.category.name },
          { label: product.name },
        ]}
      />
      <section className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
        <ImageGallery images={images} priority />
        <div className="grid content-start gap-6">
          <div className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={product.stock > 0 ? 'success' : 'error'}>
                {product.stock > 0 ? 'Em estoque' : 'Indisponivel'}
              </Badge>
              {product.featured ? <Badge>Destaque</Badge> : null}
            </div>
            <p className="text-sm text-accent-primary">{product.category.name}</p>
            <h1 className="font-display text-4xl font-semibold leading-tight text-text-primary md:text-5xl">
              {product.name}
            </h1>
            <p className="text-sm leading-7 text-text-secondary">
              {product.description ?? 'Produto personalizado oficial CAFÉ Store.'}
            </p>
            <p className="text-xs text-text-muted">Codigo do produto: {sku}</p>
          </div>
          <PriceBlock price={product.price} oldPrice={product.oldPrice} />
          <p className="text-sm text-text-secondary">
            12x de{' '}
            <span className="font-semibold text-accent-glow">
              {currencyFormatter.format(product.price / 12)}
            </span>{' '}
            sem juros
          </p>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="text-accent-glow">★</span>
            <span>
              {product.reviewCount > 0
                ? `${averageRating} de 5 em ${product.reviewCount} avaliacoes`
                : 'Ainda sem avaliacoes'}
            </span>
          </div>
          <ProductPurchasePanel product={product} />
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-background-card/60 p-5 md:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">Pagamento seguro</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">Pix, cartao, Mercado Pago e PayPal preparados para o checkout.</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">Garantia CAFÉ Store</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">Troca ou devolucao em ate 7 dias apos o recebimento.</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">Loja identificada</p>
          <p className="mt-1 text-xs leading-5 text-text-secondary">CNPJ e dados fiscais entram no rodape antes da publicacao final.</p>
        </div>
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

      <section className="grid gap-5">
        <div>
          <h2 className="font-display text-3xl font-semibold text-text-primary">Avaliacoes</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Experiencias de clientes com compra verificada e moderacao ativa.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Todas', '5 estrelas', '4 estrelas', '3 estrelas', '2 estrelas', '1 estrela', 'Com foto'].map((filter) => (
            <button key={filter} type="button" className="rounded-full border border-white/10 px-3 py-1 text-xs text-text-secondary hover:border-accent-primary/50 hover:text-text-primary">
              {filter}
            </button>
          ))}
        </div>
        {product.reviews.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {product.reviews.map((review) => (
              <article key={review.id} className="card p-5">
                <div className="flex items-center gap-3">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name ?? 'Cliente Cafe Store'}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="grid size-10 place-items-center rounded-full bg-accent-primary/10 text-sm font-semibold text-accent-primary">
                      {(review.user.name ?? 'C').slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <p className="font-semibold text-text-primary">{review.user.name ?? 'Cliente Cafe Store'}</p>
                    <p className="text-xs text-text-muted">
                      {review.verifiedPurchase ? 'Compra verificada' : 'Avaliacao'}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-accent-glow">{'★'.repeat(review.rating)}</p>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {review.comment ?? 'Cliente avaliou este produto.'}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 text-sm text-text-secondary">
            Este produto ainda nao recebeu avaliacoes aprovadas nem fotos reais de clientes.
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="font-display text-3xl font-semibold text-text-primary">Perguntas e respostas</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-background-card/60 p-5">
            <p className="text-sm font-semibold text-text-primary">Tem pronta entrega?</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              O estoque exibido acima indica a disponibilidade atual. Produtos personalizados podem exigir prazo adicional.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-background-card/60 p-5">
            <p className="text-sm font-semibold text-text-primary">Posso trocar tamanho ou modelo?</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Sim, seguindo a politica de devolucao de 7 dias e disponibilidade da variacao desejada.
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-5">
        <div>
          <h2 className="font-display text-3xl font-semibold text-text-primary">Quem viu tambem viu</h2>
          <p className="mt-2 text-sm text-text-secondary">Complete o look, monte um kit ou veja produtos comprados juntos.</p>
        </div>
        <ProductGrid products={relatedProducts} />
      </section>
    </main>
  );
}
