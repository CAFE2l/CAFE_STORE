import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ProductGrid } from '@/components/store/ProductGrid';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getCategories, getFeaturedProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'CAFÉ Store | Produtos personalizados',
  description: 'Produtos personalizados da marca CAFÉ para quem vive o digital.',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([getFeaturedProducts(8), getCategories()]);

  return (
    <main>
      <section className="container-page grid min-h-[calc(100vh-5rem)] items-center gap-10 py-12 lg:grid-cols-[1fr_0.85fr]">
        <div className="max-w-3xl">
          <Badge>Limited Edition</Badge>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-tight text-text-primary sm:text-6xl lg:text-7xl">
            Lifestyle, tech e produtos para quem vive o digital.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-text-secondary">
            Camisetas, moletons, canecas e acessorios personalizados com a identidade CAFÉ:
            energia, velocidade, criatividade e atitude.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary">
              Ver produtos
            </Link>
            <Link href="/services" className="btn-secondary">
              Falar com a marca
            </Link>
          </div>
        </div>
        <div className="relative min-h-[26rem] overflow-hidden rounded-2xl border border-white/10 bg-background-card shadow-warm">
          <Image
            src="/images/banners/Produtos.png"
            alt="Banner CAFÉ Store com mascote oficial"
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
              <p className="mt-2 text-sm text-text-secondary">Escolha por tipo de produto.</p>
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
          <p className="mt-2 text-sm text-text-secondary">Itens principais da primeira vitrine CAFÉ Store.</p>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>

      <section className="bg-background-surface py-16">
        <div className="container-page grid gap-5 md:grid-cols-3">
          {['Produtos personalizados', 'Kits para comunidade', 'Drops limited edition'].map((service) => (
            <article key={service} className="card p-5">
              <h3 className="text-lg font-semibold text-text-primary">{service}</h3>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Criado para fortalecer a marca, monetizar a comunidade e centralizar produtos oficiais.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-semibold text-text-primary">Comunidade</h2>
          <p className="mt-2 text-sm text-text-secondary">A proposta da marca em cada produto.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            'Identidade forte para quem cria, constrói e vive no digital.',
            'Produtos pensados para rotina, presente e presença de marca.',
            'Visual energético com mascote oficial e acabamento de impacto.',
          ].map((testimonial, index) => (
            <article key={testimonial} className="card p-5">
              <p className="text-sm leading-7 text-text-secondary">{testimonial}</p>
              <p className="mt-4 text-sm font-semibold text-text-primary">Cliente {index + 1}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="glass-light rounded-2xl p-8 text-center shadow-warm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-primary">CAFÉ Store</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-text-primary">
            Energia e atitude para o seu dia.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Este MVP agora usa os assets oficiais da marca para iniciar o trabalho de produto.
          </p>
        </div>
      </section>
    </main>
  );
}
