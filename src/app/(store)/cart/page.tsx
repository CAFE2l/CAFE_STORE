import type { Metadata } from 'next';
import { CartPageClient } from '@/components/store/CartPageClient';

export const metadata: Metadata = {
  title: 'Carrinho | Cafe Store',
  description: 'Carrinho de compras da CAFÉ Store com frete, cupons, upsells e checkout rapido.',
};

export default function CartPage() {
  return (
    <main className="container-page py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-text-primary">Meu Carrinho</h1>
        <p className="mt-1 text-sm text-text-muted">
          Revise seus itens antes de finalizar a compra.
        </p>
      </div>
      <CartPageClient />
    </main>
  );
}
