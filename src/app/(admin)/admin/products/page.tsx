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
    <main className="container-page grid gap-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold text-text-primary">Produtos</h1>
        <Link href="/admin/products/new" className="btn-primary">Novo produto</Link>
      </div>
      <section className="card overflow-hidden p-0">
        <div className="grid gap-0">
          {products.map((product) => (
            <div key={product.id} className="grid gap-3 border-b border-border-subtle p-4 md:grid-cols-[1fr_auto_auto_auto]">
              <div>
                <p className="font-semibold text-text-primary">{product.name}</p>
                <p className="text-sm text-text-muted">{product.category.name}</p>
              </div>
              <Badge variant={product.status === 'ACTIVE' ? 'success' : 'muted'}>{product.status}</Badge>
              <span className="text-sm text-text-primary">{currencyFormatter.format(product.price)}</span>
              <Link href={`/admin/products/${product.id}/edit`} className="btn-secondary px-3 py-2 text-sm">Editar</Link>
            </div>
          ))}
          {products.length === 0 ? <p className="p-5 text-sm text-text-secondary">Nenhum produto cadastrado.</p> : null}
        </div>
      </section>
    </main>
  );
}
