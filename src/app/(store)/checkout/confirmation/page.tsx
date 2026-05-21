import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pedido confirmado | Cafe Store',
  description: 'Confirmacao de pedido da Cafe Store.',
};

export default function CheckoutConfirmationPage() {
  return <main className="container-page py-16">Pedido confirmado</main>;
}
