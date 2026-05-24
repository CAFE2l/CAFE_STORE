import type { Metadata } from 'next';
import { CartPageClient } from '@/components/store/CartPageClient';

export const metadata: Metadata = {
  title: 'Carrinho de apoios | Cafe Store',
  description: 'Carrinho de apoios simbolicos da CAFÉ STORE, sem envio de produto fisico.',
};

export default function CartPage() {
  return (
    <main className="container-page py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-text-primary">Meu Carrinho de Apoios</h1>
        <p className="mt-1 text-sm text-text-muted">
          Revise os apoios simbolicos antes de finalizar. Nao ha envio fisico.
        </p>
      </div>
      <CartPageClient />
    </main>
  );
}
