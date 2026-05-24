import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { StatusBadge } from '@/components/account/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { auth } from '@/lib/auth';
import { getUserOrders } from '@/lib/account';
import dynamic from 'next/dynamic'
const OrderActionsClient = dynamic(() => import('@/components/account/OrderActionsClient').then(m => m.default), { ssr: false })

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
        <h1 className="font-display text-3xl font-bold text-text-primary">Meus Pedidos</h1>
        <p className="mt-1 text-sm text-text-muted">Acompanhe o status de suas compras.</p>
      </div>
      {orders.length > 0 ? (
        <div className="grid gap-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-card border border-border-subtle bg-background-card p-5 transition hover:border-cafe-orange-500/40 md:flex md:items-center md:justify-between">
              <Link href={`/orders/${order.id}`} className="flex-1 md:flex md:items-center md:gap-8">
                <div className="grid gap-2 md:flex md:items-center md:gap-8">
                <div>
                  <p className="text-xs text-text-muted">Pedido</p>
                  <p className="font-mono text-sm text-text-primary">#{order.id.slice(0, 10)}</p>
                </div>
                <div>
                  <StatusBadge status={order.status} />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Itens</p>
                  <p className="text-sm text-text-primary">{order.itemCount}</p>
                </div>
               </div>
               <div className="mt-3 md:mt-0">
                 <p className="text-sm font-bold text-cafe-orange-500">{currencyFormatter.format(order.total)}</p>
               </div>
             </Link>

             <div className="mt-3 md:mt-0 md:ml-4">
               {/* Order actions */}
               {/* @ts-ignore */}
               <OrderActionsClient orderId={order.id} status={order.status} />
             </div>
           </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum pedido ainda"
          subtitle="Quando voce finalizar um apoio, ele aparecera aqui."
          action={{ href: '/products', label: 'Apoiar agora' }}
        />
      )}
    </main>
  );
}
