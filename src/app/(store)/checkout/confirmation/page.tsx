import type { Metadata } from 'next';
import { CheckoutConfirmationClient } from '@/components/store/CheckoutConfirmationClient';

export const metadata: Metadata = {
  title: 'Pedido confirmado | Cafe Store',
  description: 'Confirmacao de pedido da Cafe Store.',
};

export default function CheckoutConfirmationPage() {
  return (
    <main className="container-page py-12">
      <CheckoutConfirmationClient />
    </main>
  );
}
