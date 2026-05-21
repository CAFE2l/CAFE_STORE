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
        <h1 className="font-display text-4xl font-semibold text-text-primary">Checkout</h1>
        <p className="mt-3 text-sm text-text-secondary">Finalize em etapas com dados, entrega e pagamento.</p>
      </div>
      <CheckoutPageClient />
    </main>
  );
}
