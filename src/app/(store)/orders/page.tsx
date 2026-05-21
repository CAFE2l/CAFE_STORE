import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meus pedidos | Cafe Store',
  description: 'Historico de pedidos do cliente.',
};

export default function OrdersPage() {
  return <main className="container-page py-16">Meus pedidos</main>;
}
