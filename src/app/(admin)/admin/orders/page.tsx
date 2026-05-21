import type { Metadata } from 'next';
import Link from 'next/link';
import { StatusBadge } from '@/components/account/StatusBadge';
import { getAdminOrders } from '@/lib/admin';

export const metadata: Metadata = {
  title: 'Pedidos admin | Cafe Store',
  description: 'Gestao de pedidos da Cafe Store.',
};

export const dynamic = 'force-dynamic';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <main className="container-page grid gap-6 py-8">
      <h1 className="font-display text-4xl font-semibold text-text-primary">Pedidos</h1>
      <section className="card overflow-hidden p-0">
        {orders.map((order) => (
          <Link key={order.id} href={`/admin/orders/${order.id}`} className="grid gap-3 border-b border-border-subtle p-4 md:grid-cols-5">
            <span className="font-mono text-sm text-text-primary">{order.id}</span>
            <span className="text-sm text-text-secondary">{order.user.name ?? order.user.email}</span>
            <StatusBadge status={order.status} />
            <span className="text-sm text-text-secondary">{order.itemCount} itens</span>
            <span className="text-sm font-semibold text-text-primary">{currencyFormatter.format(order.total)}</span>
          </Link>
        ))}
        {orders.length === 0 ? <p className="p-5 text-sm text-text-secondary">Nenhum pedido encontrado.</p> : null}
      </section>
    </main>
  );
}
