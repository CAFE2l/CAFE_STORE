import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { OrderTimeline } from '@/components/account/OrderTimeline';
import { StatusBadge } from '@/components/account/StatusBadge';
import { OrderFeedback } from '@/components/account/OrderFeedback';
import { auth } from '@/lib/auth';
import { getUserOrderById } from '@/lib/account';
import nextDynamic from 'next/dynamic'
const OrderActionsClient = nextDynamic(() => import('@/components/account/OrderActionsClient').then(m => m.default), { ssr: false })

type OrderPageProps = {
  params: {
    id: string;
  };
};

export function generateMetadata({ params }: OrderPageProps): Metadata {
  return {
    title: `Pedido ${params.id} | Cafe Store`,
    description: 'Detalhes do pedido Cafe Store.',
  };
}

export const dynamic = 'force-dynamic';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

type AddressShape = {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip?: string;
};

function formatAddress(address: unknown) {
  const parsed = address as AddressShape;

  return [
    `${parsed.street ?? ''}, ${parsed.number ?? ''}`.trim(),
    parsed.complement,
    parsed.neighborhood,
    `${parsed.city ?? ''}/${parsed.state ?? ''}`.trim(),
    parsed.zip,
  ]
    .filter(Boolean)
    .join(' - ');
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/orders/${params.id}`);
  }

  const order = await getUserOrderById(session.user.id, params.id);

  if (!order) {
    notFound();
  }

  return (
    <main className="container-page grid gap-8 py-10 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/orders" className="text-sm text-accent-primary hover:text-accent-glow">
            Voltar aos pedidos
          </Link>
          <h1 className="mt-3 font-display text-3xl font-semibold text-text-primary sm:text-4xl">Pedido</h1>
          <p className="mt-2 break-all font-mono text-sm text-text-muted">{order.id}</p>
        </div>
      <div className="flex flex-wrap items-center gap-4">
        <StatusBadge status={order.status} />
        {/* @ts-ignore */}
        <OrderActionsClient orderId={order.id} status={order.status} />
      </div>
      </div>

      <section className="card p-5">
        <OrderTimeline status={order.status} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="card p-5">
          <h2 className="font-display text-2xl font-semibold text-text-primary">Itens</h2>
          <div className="mt-5 grid gap-4">
            {order.items.map((item) => (
              <article key={item.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto]">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-background-surface">
                  <Image
                    src={item.product.images[0] ?? '/placeholder-product.svg'}
                    alt={item.product.name}
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-semibold text-text-primary hover:text-accent-glow"
                  >
                    {item.product.name}
                  </Link>
                  <p className="mt-1 text-sm text-text-muted">Quantidade: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-text-primary sm:text-right">
                  {currencyFormatter.format(item.price * item.quantity)}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside className="glass h-fit rounded-2xl p-5 shadow-warm">
          <h2 className="font-display text-2xl font-semibold text-text-primary">Resumo</h2>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between text-text-secondary">
              <dt>Total</dt>
              <dd>{currencyFormatter.format(order.total)}</dd>
            </div>
            <div className="flex justify-between text-text-secondary">
              <dt>Pagamento</dt>
              <dd>{order.paymentMethod}</dd>
            </div>
            <div className="flex justify-between text-text-secondary">
              <dt>Telefone</dt>
              <dd>{order.phone}</dd>
            </div>
          </dl>
          <div className="mt-5 border-t border-border-subtle pt-5">
            <p className="text-sm font-semibold text-text-primary">Endereco</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{formatAddress(order.address)}</p>
          </div>
        </aside>
      </section>

      <OrderFeedback orderId={order.id} />
    </main>
  );
}
