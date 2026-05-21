import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { OrderStatusSelect } from '@/components/admin/forms/AdminActions';
import { StatusBadge } from '@/components/account/StatusBadge';
import { getAdminOrder } from '@/lib/admin';

type AdminOrderPageProps = {
  params: {
    id: string;
  };
};

export function generateMetadata({ params }: AdminOrderPageProps): Metadata {
  return {
    title: `Pedido admin ${params.id} | Cafe Store`,
    description: 'Detalhe administrativo do pedido.',
  };
}

export const dynamic = 'force-dynamic';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const order = await getAdminOrder(params.id);
  if (!order) notFound();

  return (
    <main className="container-page grid gap-6 py-8">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-text-primary">Pedido</h1>
          <p className="mt-2 font-mono text-sm text-text-muted">{order.id}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="card p-5">
          <h2 className="font-display text-2xl font-semibold text-text-primary">Itens</h2>
          <div className="mt-5 grid gap-4">
            {order.items.map((item) => (
              <article key={item.id} className="grid grid-cols-[4rem_1fr_auto] gap-4">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-background-surface">
                  <Image src={item.product.images[0] ?? '/placeholder-product.svg'} alt={item.product.name} fill sizes="64px" className="object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{item.product.name}</p>
                  <p className="text-sm text-text-muted">Qtd. {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-text-primary">{currencyFormatter.format(item.price * item.quantity)}</p>
              </article>
            ))}
          </div>
        </div>
        <aside className="glass h-fit rounded-2xl p-5 shadow-warm">
          <h2 className="font-display text-2xl font-semibold text-text-primary">Controle</h2>
          <div className="mt-5 grid gap-4">
            <OrderStatusSelect orderId={order.id} status={order.status} />
            <p className="text-sm text-text-secondary">{order.user.name ?? order.user.email}</p>
            <p className="text-lg font-semibold text-text-primary">{currencyFormatter.format(order.total)}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
