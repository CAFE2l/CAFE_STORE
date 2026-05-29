import Link from 'next/link';
import { ArrowLeft, PackageX } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.08)]">
        <PackageX className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="mt-6 text-2xl font-black tracking-tight text-white">
        Produto não encontrado
      </h1>
      <p className="mt-2 max-w-sm text-center text-sm text-zinc-500">
        Esse produto pode ter sido removido ou o ID está incorreto.
      </p>
      <Link
        href="/admin/produtos"
        className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-white/[0.15] hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para produtos
      </Link>
    </div>
  );
}
