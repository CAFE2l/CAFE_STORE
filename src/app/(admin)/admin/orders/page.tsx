import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pedidos admin | Cafe Store',
  description: 'Gestao de pedidos da Cafe Store.',
};

export default function AdminOrdersPage() {
  return <main className="container-page py-16">Pedidos admin</main>;
}
