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
          <div className="flex items-center gap-2">
            <Badge>🔥 +2.000 clientes satisfeitos</Badge>
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient-fire">Sabor que aquece a alma</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-text-secondary">
            Cafés especiais selecionados das melhores regiões do Brasil. Equipamentos, acessórios e kits para verdadeiros apreciadores.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary">
              Ver Produtos
            </Link>
            <Link href="/products?category=ofertas" className="btn-secondary">
              Ofertas do Dia
            </Link>
          </div>
        </div>
        <div className="relative min-h-[26rem] overflow-hidden rounded-card border border-border-subtle bg-cafe-dark-800">
          <Image
            src="/images/banners/Produtos.png"
            alt="Banner CAFÉ Store"
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="bg-cafe-dark-800 border-y border-border-subtle py-10">
        <div className="container-page grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: '📦', label: 'Frete Grátis', desc: 'Acima de R$ 150' },
            { icon: '🔄', label: 'Troca Fácil', desc: '7 dias para devolver' },
            { icon: '🔒', label: 'Pagamento Seguro', desc: 'SSL + Antifraude' },
            { icon: '💬', label: 'Suporte 24h', desc: 'Atendimento rápido' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-lg bg-cafe-dark-700 p-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-text-primary">Explore por Categoria</h2>
            <p className="mt-2 text-sm text-text-muted">Encontre o café perfeito para você.</p>
          </div>
          <Link href="/products" className="btn-ghost text-sm">
            Ver todas
          </Link>
        </div>
        {categories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`} className="group relative overflow-hidden rounded-card border border-border-subtle bg-cafe-dark-800 p-6 transition-all duration-300 hover:border-cafe-orange-500/40 hover:-translate-y-1">
                <p className="font-semibold text-text-primary group-hover:text-cafe-orange-500 transition-colors">{category.name}</p>
                <p className="mt-2 text-sm text-text-muted">{category._count.products} produtos</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="Categorias em preparo" subtitle="Cadastre categorias no admin para popular esta área." />
        )}
      </section>

      <section className="container-page py-16">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold text-text-primary">Mais Vendidos 🔥</h2>
          <p className="mt-2 text-sm text-text-muted">Os favoritos dos nossos clientes.</p>
        </div>
        <ProductGrid products={featuredProducts} />
        <div className="mt-8 text-center">
          <Link href="/products" className="btn-secondary">
            Ver todos os produtos
          </Link>
        </div>
      </section>

      <section className="gradient-fire py-16">
        <div className="container-page text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-white/80">Oferta Relâmpago</p>
          <h2 className="mt-4 font-display text-4xl font-bold text-white">Aproveite agora</h2>
          <p className="mt-2 text-white/80">Descontos imperdíveis por tempo limitado</p>
          <div className="mt-6 flex items-center justify-center gap-4 text-3xl font-bold text-white">
            <div className="rounded-lg bg-white/15 px-4 py-2 backdrop-blur">02</div>
            <span className="text-white/60">:</span>
            <div className="rounded-lg bg-white/15 px-4 py-2 backdrop-blur">15</div>
            <span className="text-white/60">:</span>
            <div className="rounded-lg bg-white/15 px-4 py-2 backdrop-blur">48</div>
          </div>
          <Link href="/products?category=ofertas" className="btn-primary mt-8 inline-flex bg-cafe-dark-900 text-white hover:bg-cafe-dark-800">
            Aproveitar agora
          </Link>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold text-text-primary">Novidades 🆕</h2>
          <p className="mt-2 text-sm text-text-muted">Os lançamentos mais recentes.</p>
        </div>
        <ProductGrid products={featuredProducts.slice(0, 4)} />
      </section>

      <section className="bg-cafe-dark-800 py-16">
        <div className="container-page">
          <h2 className="font-display text-3xl font-bold text-text-primary text-center">O que dizem nossos clientes</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { name: 'Ana Silva', text: 'Melhor café que já comprei online. Entrega super rápida e o produto veio bem embalado.', stars: 5 },
              { name: 'Carlos Oliveira', text: 'Os grãos são de altíssima qualidade. Virei cliente fiel!', stars: 5 },
              { name: 'Mariana Costa', text: 'Equipamentos de primeira linha. recomendo para todos os amigos.', stars: 4 },
            ].map((testimonial) => (
              <article key={testimonial.name} className="rounded-card border border-border-subtle bg-cafe-dark-900 p-6">
                <div className="flex items-center gap-1 text-cafe-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < testimonial.stars ? '★' : '☆'}</span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-text-secondary">{testimonial.text}</p>
                <p className="mt-4 text-sm font-semibold text-text-primary">{testimonial.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="rounded-card border border-border-subtle bg-cafe-dark-800 p-8 text-center lg:p-12">
          <h2 className="font-display text-3xl font-bold text-text-primary">Receba ofertas exclusivas</h2>
          <p className="mt-3 text-sm text-text-muted">Cadastre-se e seja o primeiro a saber de lançamentos e promoções.</p>
          <div className="mx-auto mt-6 flex max-w-md gap-3">
            <input className="input-field flex-1" type="email" placeholder="Seu melhor e-mail" />
            <button type="button" className="btn-primary shrink-0">Quero descontos</button>
          </div>
          <p className="mt-3 text-xs text-text-muted">Ao cadastrar, você aceita nossa política de privacidade.</p>
        </div>
      </section>
    </main>
  );
}
