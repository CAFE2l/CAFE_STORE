import type { Metadata } from 'next';
import { CartPageClient } from '@/components/store/CartPageClient';

export const metadata: Metadata = {
  title: 'Carrinho | Cafe Store',
  description: 'Carrinho de compras da Cafe Store.',
};

export default function CartPage() {
  return (
    <main className="container-page py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-text-primary">Carrinho</h1>
        <p className="mt-3 text-sm text-text-secondary">Revise itens, quantidades e total antes de finalizar.</p>
      </div>
      <CartPageClient />
    </main>
  );
}
