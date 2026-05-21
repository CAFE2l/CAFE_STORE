import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ProductGrid } from '@/components/store/ProductGrid';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getCategories, getFeaturedProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Cafe Store | Cafe premium',
  description: 'Cafe premium, acessorios e experiencias para preparo especial.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([getFeaturedProducts(8), getCategories()]);

  return (
    <main>
      <section className="container-page grid min-h-[calc(100vh-5rem)] items-center gap-10 py-12 lg:grid-cols-[1fr_0.85fr]">
        <div className="max-w-3xl">
          <Badge>Torra premium</Badge>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-tight text-text-primary sm:text-6xl lg:text-7xl">
            Cafe especial para rotina, presente e ritual.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-text-secondary">
            Graos selecionados, kits de preparo e curadoria para quem quer extrair mais aroma,
            textura e consistencia em cada xicara.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary">
              Comprar cafes
            </Link>
            <Link href="/services" className="btn-secondary">
              Ver servicos
            </Link>
          </div>
        </div>
        <div className="relative min-h-[26rem] overflow-hidden rounded-2xl border border-white/10 bg-background-card shadow-warm">
          <Image
            src="/placeholder-product.svg"
            alt="Cafe premium Cafe Store"
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="border-y border-border-subtle bg-background-surface py-14">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-text-primary">Categorias</h2>
              <p className="mt-2 text-sm text-text-secondary">Escolha por perfil de preparo.</p>
            </div>
            <Link href="/products" className="btn-ghost">
              Ver tudo
            </Link>
          </div>
          {categories.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.slice(0, 4).map((category) => (
                <Link key={category.id} href={`/products?category=${category.slug}`} className="card p-5">
                  <p className="font-semibold text-text-primary">{category.name}</p>
                  <p className="mt-2 text-sm text-text-secondary">{category._count.products} produtos</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="Categorias em preparo" subtitle="Cadastre categorias no admin para popular esta area." />
          )}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-semibold text-text-primary">Destaques</h2>
          <p className="mt-2 text-sm text-text-secondary">Produtos selecionados para a vitrine principal.</p>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>

      <section className="bg-background-surface py-16">
        <div className="container-page grid gap-5 md:grid-cols-3">
          {['Assinatura mensal', 'Presentes corporativos', 'Consultoria de preparo'].map((service) => (
            <article key={service} className="card p-5">
              <h3 className="text-lg font-semibold text-text-primary">{service}</h3>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Atendimento sob medida para transformar cafe em experiencia consistente.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="glass-light rounded-2xl p-8 text-center shadow-warm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-primary">Cafe Store</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-text-primary">
            Receba novidades e lotes especiais.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Acompanhe lancamentos, reposicoes e recomendacoes de preparo para comprar no ponto certo.
          </p>
        </div>
      </section>
    </main>
  );
}
