import type { Metadata } from 'next';
import { CheckoutPageClient } from '@/components/store/CheckoutPageClient';

export const metadata: Metadata = {
  title: 'Checkout | Cafe Store',
  description: 'Finalizacao de compra da Cafe Store.',
};

export default function CheckoutPage() {
  return (
    <main className="container-page py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-text-primary">Checkout</h1>
        <p className="mt-1 text-sm text-text-muted">Finalize sua compra em etapas.</p>
      </div>
      <CheckoutPageClient />
    </main>
  );
}
