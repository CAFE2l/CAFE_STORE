import { ProductStatus } from '@prisma/client';
import ProductActions from '@/components/admin/products/ProductActions';
import { ProductCreateDialog } from '@/components/admin/products/ProductCreateDialog';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminFilters, AdminTable, EmptyPanel, Pagination } from '@/components/admin/ui/AdminTable';
import { deleteProductAction, toggleProductStatusAction } from '@/lib/admin/actions';
import { getProductsPage } from '@/lib/admin/queries';
import { toMoney } from '@/lib/admin/formatters';

export const dynamic = 'force-dynamic';

export default async function ProdutosPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const data = await getProductsPage(searchParams);
  const basePath = `/admin/produtos?${new URLSearchParams({
    q: String(searchParams?.q ?? ''),
    status: String(searchParams?.status ?? 'all'),
  }).toString()}`;

  return (
    <div className="grid gap-5">
      <Header title="Produtos" description="CRUD de catálogo, busca, filtros, estoque e status de publicação." action={<ProductCreateDialog categories={data.categories} />} />
      <AdminFilters q={String(searchParams?.q ?? '')} status={String(searchParams?.status ?? 'all')} options={[
        { label: 'Todos', value: 'all' },
        { label: 'Ativos', value: ProductStatus.ACTIVE },
        { label: 'Inativos', value: ProductStatus.INACTIVE },
        { label: 'Sem estoque', value: ProductStatus.OUT_OF_STOCK },
      ]} />
      <AdminTable>
        {data.items.length ? (
          <div className="divide-y divide-white/10">
            {data.items.map((product) => (
              <div id={`product-${product.id}`} key={product.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.5fr_1fr_auto_auto_auto] md:items-center">
                <div>
                  <p className="font-semibold text-white">{product.name}</p>
                  <p className="text-xs text-zinc-500">{product.slug} • {product.category.name}</p>
                </div>
                <span className="text-sm text-zinc-400">{product.stock} em estoque</span>
                <AdminBadge variant={product.status}>{product.status}</AdminBadge>
                <span className="text-sm font-bold text-orange-300">{toMoney(product.price)}</span>
                <div className="flex justify-end">
                  <ProductActions product={{ id: product.id, slug: product.slug, name: product.name, status: product.status }} />
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyPanel title="Nenhum produto encontrado" description="Ajuste os filtros ou cadastre um novo produto para começar." />}
        <Pagination page={data.page} pageSize={data.pageSize} total={data.total} basePath={basePath} />
      </AdminTable>
    </div>
  );
}

function Header({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      </div>
      {action}
    </header>
  );
}

