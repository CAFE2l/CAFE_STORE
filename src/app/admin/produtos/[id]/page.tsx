import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Pencil, ShoppingBag } from 'lucide-react';
import { getAdminProduct } from '@/lib/admin';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductViewPage({ params }: Props) {
  const { id } = await params;
  const product = await getAdminProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="grid gap-8">
      {/* Breadcrumb + Header */}
      <div className="grid gap-4">
        <nav className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/admin" className="transition hover:text-zinc-300">Admin</Link>
          <span className="text-zinc-700">/</span>
          <Link href="/admin/produtos" className="transition hover:text-zinc-300">Produtos</Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-400">{product.name}</span>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{product.name}</h1>
            <p className="mt-1 text-sm text-zinc-500">{product.category.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/produtos/${product.id}/editar`}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-400 active:scale-[0.98]"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:border-white/[0.15] hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Ver na loja
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main: Description */}
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-lg">
          <h2 className="mb-4 text-sm font-semibold text-white">Descrição</h2>
          {product.description ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">{product.description}</p>
          ) : (
            <p className="text-sm italic text-zinc-600">Nenhuma descrição cadastrada.</p>
          )}
        </div>

        {/* Sidebar */}
        <div className="grid gap-6">
          {/* Status */}
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-lg">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</h2>
            <div className="flex items-center justify-between">
              <AdminBadge variant={product.status}>{product.status}</AdminBadge>
              {product.featured ? (
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">Destaque</span>
              ) : null}
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-lg">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Preço e estoque</h2>
            <div className="grid gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Preço</span>
                <span className="font-semibold text-white">R$ {Number(product.price).toFixed(2)}</span>
              </div>
              {product.oldPrice ? (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Promocional</span>
                  <span className="font-semibold text-orange-400">R$ {Number(product.oldPrice).toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Estoque</span>
                <span className="font-semibold text-white">{product.stock}</span>
              </div>
            </div>
          </div>

          {/* Images */}
          {product.images.length > 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-lg">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Imagens</h2>
              <div className="grid grid-cols-3 gap-2">
                {product.images.slice(0, 6).map((url, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-white/[0.06]">
                    <Image
                      src={url}
                      alt={`Imagem ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              {product.images.length > 6 ? (
                <p className="mt-2 text-xs text-zinc-600">+{product.images.length - 6} imagens</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-white/[0.06] pt-6">
        <Link
          href="/admin/produtos"
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:border-white/[0.15] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para lista
        </Link>
        <Link
          href={`/admin/produtos/${product.id}/editar`}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-400 active:scale-[0.98]"
        >
          <Pencil className="h-4 w-4" />
          Editar produto
        </Link>
      </div>
    </div>
  );
}
