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
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product);
  const images = product.images.map((src) => ({
    src,
    alt: product.name,
  }));
  const averageRating = product.averageRating.toFixed(1);

  return (
    <main className="container-page grid gap-12 py-10">
      <Breadcrumb
        items={[
          { href: '/', label: 'Inicio' },
          { href: '/products', label: 'Produtos' },
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
              {product.description ?? 'Cafe premium Cafe Store para preparo especial.'}
            </p>
          </div>
          <PriceBlock price={product.price} oldPrice={product.oldPrice} />
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

      <ProductTabs description={product.description} />

      <section className="grid gap-5">
        <div>
          <h2 className="font-display text-3xl font-semibold text-text-primary">Avaliacoes</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Experiencias de clientes com compra verificada e moderacao ativa.
          </p>
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
            Este produto ainda nao recebeu avaliacoes aprovadas.
          </div>
        )}
      </section>

      <section className="grid gap-5">
        <div>
          <h2 className="font-display text-3xl font-semibold text-text-primary">Relacionados</h2>
          <p className="mt-2 text-sm text-text-secondary">Outras escolhas na mesma categoria.</p>
        </div>
        <ProductGrid products={relatedProducts} />
      </section>
    </main>
  );
}
