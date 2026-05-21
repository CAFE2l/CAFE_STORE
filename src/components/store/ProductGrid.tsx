import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCard } from '@/components/store/ProductCard';
import type { ProductListItem } from '@/lib/products';

type ProductGridProps = {
  products: ProductListItem[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="Nenhum produto encontrado"
        subtitle="Ajuste os filtros ou volte mais tarde para conferir novos cafes."
        action={{ href: '/products', label: 'Limpar filtros' }}
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
