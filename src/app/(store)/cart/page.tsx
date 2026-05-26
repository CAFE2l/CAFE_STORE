import type { Metadata } from 'next';
import { ShoppingCart } from 'lucide-react';
import { CartPageClient } from '@/components/store/CartPageClient';

export const metadata: Metadata = {
  title: 'Carrinho de apoios | Cafe Store',
  description: 'Carrinho de apoios simbolicos da CAFÉ STORE, sem envio de produto fisico.',
};

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl border border-orange-400/25 bg-orange-500/10 text-orange-400 shadow-[0_0_24px_rgba(249,115,22,0.12)]">
            <ShoppingCart className="size-5" aria-hidden="true" />
          </span>
          <h1 className="font-display text-[2rem] font-bold leading-tight text-white md:text-4xl">Meu Carrinho de Apoios</h1>
        </div>
        <p className="mt-2 text-sm text-white/50">
          Revise os apoios simbolicos antes de finalizar. Nao ha envio fisico.
        </p>
        <div className="mt-5 h-0.5 w-full max-w-md bg-gradient-to-r from-orange-500 via-orange-500/60 to-transparent" />
      </div>
      <CartPageClient />
    </main>
  );
}
