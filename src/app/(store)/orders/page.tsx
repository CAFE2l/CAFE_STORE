import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { StatusBadge } from '@/components/account/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { auth } from '@/lib/auth';
import { getUserOrders } from '@/lib/account';

export const metadata: Metadata = {
  title: 'Meus pedidos | Cafe Store',
  description: 'Historico de pedidos do cliente.',
};

export const dynamic = 'force-dynamic';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/orders');
  }

  const orders = await getUserOrders(session.user.id);

  return (
    <main className="container-page grid gap-8 py-12">
      <div>
        <h1 className="font-display text-4xl font-semibold text-text-primary">Meus pedidos</h1>
        <p className="mt-3 text-sm text-text-secondary">Acompanhe status, itens e historico de compras.</p>
      </div>
      {orders.length > 0 ? (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="card grid gap-4 p-5 md:grid-cols-4">
              <div>
                <p className="text-xs text-text-muted">Pedido</p>
                <p className="mt-1 font-mono text-sm text-text-primary">{order.id}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Status</p>
                <div className="mt-1">
                  <StatusBadge status={order.status} />
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted">Itens</p>
                <p className="mt-1 text-sm text-text-primary">{order.itemCount}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Total</p>
                <p className="mt-1 text-sm font-semibold text-text-primary">{currencyFormatter.format(order.total)}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum pedido ainda"
          subtitle="Quando voce finalizar uma compra, ela aparecera aqui."
          action={{ href: '/products', label: 'Comprar agora' }}
        />
      )}
    </main>
  );
}
