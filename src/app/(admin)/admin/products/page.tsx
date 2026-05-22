import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { getAdminProducts } from '@/lib/admin';

export const metadata: Metadata = {
  title: 'Produtos admin | Cafe Store',
  description: 'Gestao de produtos da Cafe Store.',
};

export const dynamic = 'force-dynamic';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <main className="grid gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Produtos</h1>
          <p className="mt-1 text-sm text-text-muted">Gerencie o catálogo da loja.</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          + Novo Produto
        </Link>
      </div>
      <div className="grid gap-3">
        {products.map((product) => (
          <article key={product.id} className="rounded-card border border-border-subtle bg-background-card p-5 md:flex md:items-center md:justify-between md:gap-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-text-primary">{product.name}</p>
                <p className="text-xs text-text-muted">{product.category?.name ?? 'Sem categoria'}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 md:mt-0">
              <Badge variant={product.status === 'ACTIVE' ? 'success' : 'muted'}>{product.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</Badge>
              <span className="text-sm font-semibold text-cafe-orange-500">{currencyFormatter.format(product.price)}</span>
              <Link href={`/admin/products/${product.id}/edit`} className="btn-ghost px-3 py-1.5 text-sm">
                Editar
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
