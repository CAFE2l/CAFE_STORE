import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { getAdminProduct } from '@/lib/admin';
import { getCategoriesForSelect } from '@/lib/actions/products';
import { ProductForm } from '@/components/admin/products/product-form';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getCategoriesForSelect(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="grid gap-8">
      {/* Breadcrumb + Header */}
      <div className="grid gap-4">
        <nav className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/admin" className="transition hover:text-zinc-300">
            Admin
          </Link>
          <span className="text-zinc-700">/</span>
          <Link href="/admin/produtos" className="transition hover:text-zinc-300">
            Produtos
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-400">Editar</span>
        </nav>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.08)]">
              <Edit3 className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {product.name}
              </h1>
              <p className="mt-0.5 text-sm text-zinc-500">
                Atualize informações, preço, estoque, categoria e status de publicação.
              </p>
            </div>
          </div>
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-zinc-400 transition-all hover:border-white/[0.15] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 rotate-135" />
            Visualizar na loja
          </Link>
        </div>

        {/* Quick metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600">
          <span>Slug: <span className="font-mono text-zinc-500">{product.slug}</span></span>
          {product.sku ? (
            <>
              <span className="hidden sm:inline">·</span>
              <span>SKU: <span className="font-mono text-zinc-500">{product.sku}</span></span>
            </>
          ) : null}
          <span className="hidden sm:inline">·</span>
          <span>Preço: <span className="font-mono text-zinc-500">R$ {Number(product.price).toFixed(2)}</span></span>
          <span className="hidden sm:inline">·</span>
          <span>Estoque: <span className="font-mono text-zinc-500">{product.stock}</span></span>
          <span className="hidden sm:inline">·</span>
          <span>
            Status:{' '}
            <span
              className={`font-mono ${
                product.status === 'ACTIVE'
                  ? 'text-emerald-400'
                  : product.status === 'INACTIVE'
                    ? 'text-zinc-400'
                    : 'text-amber-400'
              }`}
            >
              {product.status === 'ACTIVE'
                ? 'Ativo'
                : product.status === 'INACTIVE'
                  ? 'Inativo'
                  : 'Sem estoque'}
            </span>
          </span>
        </div>
      </div>

      <ProductForm product={product} categories={categories} />
    </div>
  );
}
